"""
nlp_service.py — Core NLP pipeline for JobLens.

Pipeline steps for each review:
  1. Sentiment analysis  (RoBERTa fine-tuned on social/review text)
  2. Topic classification (zero-shot via BART-MNLI — no training data needed)
  3. Extractive summarisation (TF-IDF sentence scoring — no GPU required)
  4. Keyword extraction  (frequency-based with stopword filtering)

Models are lazy-loaded on first request and cached for the process lifetime.
"""

from __future__ import annotations

import re
import logging
from collections import Counter
from typing import List

from app.config import SENTIMENT_MODEL, ZERO_SHOT_MODEL

logger = logging.getLogger(__name__)

# ── Lazy model references ──────────────────────────────────────
_sentiment_pipe = None
_zero_shot_pipe = None


def _get_sentiment_pipe():
    global _sentiment_pipe
    if _sentiment_pipe is None:
        from transformers import pipeline
        logger.info(f"Loading sentiment model: {SENTIMENT_MODEL}")
        _sentiment_pipe = pipeline(
            "sentiment-analysis",
            model=SENTIMENT_MODEL,
            top_k=None,          # return ALL label scores
            truncation=True,
            max_length=512,
        )
        logger.info("Sentiment model loaded ✓")
    return _sentiment_pipe


def _get_zero_shot_pipe():
    global _zero_shot_pipe
    if _zero_shot_pipe is None:
        from transformers import pipeline
        logger.info(f"Loading zero-shot model: {ZERO_SHOT_MODEL}")
        _zero_shot_pipe = pipeline(
            "zero-shot-classification",
            model=ZERO_SHOT_MODEL,
        )
        logger.info("Zero-shot model loaded ✓")
    return _zero_shot_pipe


# ── Topic candidate labels (mapped to our enum keys) ──────────
_CANDIDATE_LABELS = [
    "company culture and work environment",
    "salary and compensation",
    "management and leadership",
    "career growth and promotions",
    "work life balance and flexibility",
    "employee benefits and perks",
]

_LABEL_TO_KEY = {
    "company culture and work environment":  "culture",
    "salary and compensation":               "salary",
    "management and leadership":             "management",
    "career growth and promotions":          "growth",
    "work life balance and flexibility":     "work_life_balance",
    "employee benefits and perks":           "benefits",
}

# ── English stopwords ──────────────────────────────────────────
_STOPWORDS = {
    "the","a","an","is","are","was","were","be","been","being","have","has",
    "had","do","does","did","will","would","could","should","may","might",
    "can","this","that","these","those","and","or","but","in","on","at","to",
    "for","of","with","by","it","its","my","your","our","their","we","they",
    "i","you","he","she","very","really","just","also","there","here","not",
    "company","work","job","place","team","people","about","from","some",
    "they","than","more","into","what","when","who","which","where","how",
    "all","any","each","get","got","make","made","good","well","even","then",
}


# ══════════════════════════════════════════════════════════════
# STEP 1 — SENTIMENT
# ══════════════════════════════════════════════════════════════
def analyze_sentiment(text: str) -> dict:
    """
    Returns:
        {
            label:    "positive" | "negative" | "neutral",
            score:    float  (confidence of winning label),
            positive: float,
            negative: float,
            neutral:  float,
        }
    """
    pipe    = _get_sentiment_pipe()
    results = pipe(text)[0]          # list of {"label": ..., "score": ...}

    # Normalise label names — the Cardiff model uses "positive"/"negative"/"neutral"
    scores: dict[str, float] = {}
    for item in results:
        key = item["label"].lower()
        # roberta labels can be "LABEL_0" etc on some checkpoints — remap
        if key in ("label_0", "label_2"):
            key = "negative" if key == "label_0" else "positive"
        elif key == "label_1":
            key = "neutral"
        scores[key] = round(item["score"], 4)

    pos = scores.get("positive", 0.0)
    neg = scores.get("negative", 0.0)
    neu = scores.get("neutral",  0.0)

    winning = max(("positive", pos), ("negative", neg), ("neutral", neu),
                  key=lambda x: x[1])

    return {
        "label":    winning[0],
        "score":    round(winning[1], 4),
        "positive": pos,
        "negative": neg,
        "neutral":  neu,
    }


# ══════════════════════════════════════════════════════════════
# STEP 2 — TOPIC CLASSIFICATION (zero-shot)
# ══════════════════════════════════════════════════════════════
def classify_topics(text: str, top_n: int = 3, threshold: float = 0.20) -> List[dict]:
    """
    Zero-shot multi-label classification.
    Returns up to top_n topics that exceed the confidence threshold.
    """
    pipe   = _get_zero_shot_pipe()
    result = pipe(text, _CANDIDATE_LABELS, multi_label=True)

    topics = []
    for label, score in zip(result["labels"], result["scores"]):
        if score >= threshold:
            topics.append({
                "label":      _LABEL_TO_KEY.get(label, "other"),
                "confidence": round(score, 4),
            })

    # Sort by confidence descending, take top_n
    topics.sort(key=lambda x: x["confidence"], reverse=True)
    return topics[:top_n]


# ══════════════════════════════════════════════════════════════
# STEP 3 — EXTRACTIVE SUMMARISATION
# ══════════════════════════════════════════════════════════════
def extractive_summary(text: str, num_sentences: int = 2) -> str:
    """
    Simple TF-IDF-style extractive summarisation.

    Algorithm:
      1. Split into sentences.
      2. Build word-frequency table (excluding stopwords).
      3. Score each sentence by the sum of its word frequencies.
      4. Return the top-N sentences in original order.
    """
    # Sentence splitting
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]

    if len(sentences) <= num_sentences:
        return text.strip()

    # Word frequency
    word_freq: Counter = Counter()
    for sent in sentences:
        words = re.findall(r"\b[a-z]{3,}\b", sent.lower())
        word_freq.update(w for w in words if w not in _STOPWORDS)

    # Sentence scoring
    scored = []
    for idx, sent in enumerate(sentences):
        words = re.findall(r"\b[a-z]{3,}\b", sent.lower())
        score = sum(word_freq[w] for w in words if w not in _STOPWORDS)
        scored.append((score, idx, sent))

    # Pick top-N, restore original order
    top = sorted(scored, reverse=True)[:num_sentences]
    top = sorted(top, key=lambda x: x[1])   # re-sort by position
    return " ".join(t[2] for t in top)


# ══════════════════════════════════════════════════════════════
# STEP 4 — KEYWORD EXTRACTION
# ══════════════════════════════════════════════════════════════
def extract_keywords(text: str, top_n: int = 8) -> List[str]:
    """
    Frequency-based keyword extraction with stopword removal.
    Returns a list of the most relevant content words.
    """
    words = re.findall(r"\b[a-z]{4,}\b", text.lower())
    freq  = Counter(w for w in words if w not in _STOPWORDS)
    return [word for word, _ in freq.most_common(top_n)]


# ══════════════════════════════════════════════════════════════
# FULL SINGLE-REVIEW PIPELINE
# ══════════════════════════════════════════════════════════════
def analyze_review(text: str) -> dict:
    """
    Run the complete NLP pipeline on one review.
    Returns a dict matching SingleReviewResponse schema.
    """
    sentiment = analyze_sentiment(text)
    topics    = classify_topics(text)
    summary   = extractive_summary(text)
    keywords  = extract_keywords(text)

    return {
        "text":      text,
        "sentiment": sentiment,
        "topics":    topics,
        "summary":   summary,
        "keywords":  keywords,
    }


# ══════════════════════════════════════════════════════════════
# BATCH / COMPANY PIPELINE
# ══════════════════════════════════════════════════════════════
def analyze_batch(reviews: List[str], company_name: str = "Unknown") -> dict:
    """
    Analyze a list of reviews and aggregate into company-level insight.
    Returns a dict matching CompanyInsightResponse schema.
    """
    if not reviews:
        raise ValueError("No reviews provided.")

    # Analyse individually
    results = [analyze_review(r) for r in reviews]

    # ── Aggregate sentiment ─────────────────────────────────
    n   = len(results)
    pos = sum(r["sentiment"]["positive"] for r in results) / n
    neg = sum(r["sentiment"]["negative"] for r in results) / n
    neu = sum(r["sentiment"]["neutral"]  for r in results) / n

    if pos >= 0.50:
        overall = "positive"
    elif neg >= 0.40:
        overall = "negative"
    else:
        overall = "mixed"

    # ── Aggregate topics ────────────────────────────────────
    topic_counter: Counter = Counter()
    for r in results:
        for t in r["topics"]:
            topic_counter[t["label"]] += 1
    top_topics = [label for label, _ in topic_counter.most_common(3)]

    # ── Pros / Cons summaries ───────────────────────────────
    positive_texts = [r["text"] for r in results if r["sentiment"]["label"] == "positive"]
    negative_texts = [r["text"] for r in results if r["sentiment"]["label"] == "negative"]

    pros_summary = (
        extractive_summary(" ".join(positive_texts[:5]), num_sentences=2)
        if positive_texts
        else "No strongly positive reviews detected."
    )
    cons_summary = (
        extractive_summary(" ".join(negative_texts[:5]), num_sentences=2)
        if negative_texts
        else "No strongly negative reviews detected."
    )

    return {
        "company_name":        company_name,
        "total_reviews":       n,
        "overall_sentiment":   overall,
        "sentiment_breakdown": {
            "positive": round(pos, 3),
            "negative": round(neg, 3),
            "neutral":  round(neu, 3),
        },
        "top_topics":    top_topics,
        "pros_summary":  pros_summary,
        "cons_summary":  cons_summary,
        "reviews":       results,
    }
