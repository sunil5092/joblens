"""
evaluate_sentiment.py — Smoke evaluation of JobLens sentiment analysis.

Runs the real sentiment pipeline (app.services.nlp_service.analyze_sentiment)
against a small hand-labeled set of job reviews (reviews_labeled.csv, in this
folder) and reports accuracy plus every misclassification.

This is a smoke check on 24 labeled reviews, NOT a benchmark. Its purpose is
to give an honest, reproducible number and concrete failure examples to look
at before considering fine-tuning on review-domain data.

Run (from backend/):
    python -m evaluation.evaluate_sentiment
First run downloads the sentiment model (~500MB) and takes a few minutes on CPU.
"""

import csv
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.nlp_service import analyze_sentiment  # noqa: E402

CSV_PATH = os.path.join(os.path.dirname(__file__), "reviews_labeled.csv")


def main() -> None:
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    correct = 0
    failures = []
    confusion: dict[tuple[str, str], int] = {}

    for row in rows:
        predicted = analyze_sentiment(row["text"])["label"]
        actual = row["label"]
        confusion[(actual, predicted)] = confusion.get((actual, predicted), 0) + 1
        if predicted == actual:
            correct += 1
        else:
            failures.append((actual, predicted, row["text"]))

    total = len(rows)
    print(f"Labeled reviews: {total}")
    print(f"Correct:         {correct}")
    print(f"Accuracy:        {correct / total:.1%}")
    print("\nConfusion (actual -> predicted: count):")
    for (actual, predicted), n in sorted(confusion.items()):
        print(f"  {actual:8s} -> {predicted:8s}: {n}")
    if failures:
        print("\nMisclassifications:")
        for actual, predicted, text in failures:
            print(f"  [actual={actual}, predicted={predicted}] {text}")
    else:
        print("\nNo misclassifications.")


if __name__ == "__main__":
    main()
