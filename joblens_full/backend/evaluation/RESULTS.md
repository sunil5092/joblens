# Sentiment Evaluation — Results

Run: 2026-11-01, using `evaluate_sentiment.py` against the real `analyze_sentiment` pipeline
(model: `cardiffnlp/twitter-roberta-base-sentiment-latest`).

**This is a smoke check, not a benchmark**: 24 hand-labeled reviews, balanced
8 positive / 8 negative / 8 neutral (`reviews_labeled.csv`).

## Headline

- Labeled reviews: 24
- Correct: 19
- **Accuracy: 79.2%**

## Confusion (actual -> predicted)

| Actual   | negative | neutral | positive |
|----------|----------|---------|----------|
| negative | 8        | 0       | 0        |
| neutral  | 1        | 3       | 4        |
| positive | 0        | 0       | 8        |

Positive and negative were perfect (8/8 each). **All 5 errors were neutral reviews**
(only 3/8 correct) — mild, factual text tends to be pushed to positive by a model
fine-tuned on opinion-heavy tweet data.

## Misclassifications

- [neutral -> positive] The office is in a good location. Work is steady and the hours are predictable.
- [neutral -> positive] Meetings are frequent but usually short. The workflow is fine overall.
- [neutral -> negative] The company is neither great nor awful. Just a normal workplace.
- [neutral -> positive] Some days are good, some are bad. Overall it balances out to okay.
- [neutral -> positive] The parking is convenient and the cafeteria food is acceptable.

## Next steps

- Grow the set to 100+ real (anonymized) job reviews, keep it balanced.
- If neutral accuracy stays weak, fine-tune on review-domain data and re-run this script.
