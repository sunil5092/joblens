"""
analyze.py — NLP analysis endpoints.

Routes:
  POST /api/analyze          → single review
  POST /api/analyze/batch    → company batch (up to 50 reviews)
"""
import logging
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    SingleReviewRequest,
    BatchReviewRequest,
    SingleReviewResponse,
    CompanyInsightResponse,
)
from app.services.nlp_service import analyze_review, analyze_batch

router = APIRouter(tags=["Analysis"])
logger = logging.getLogger(__name__)


# ── POST /api/analyze ──────────────────────────────────────────
@router.post(
    "/analyze",
    response_model=SingleReviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a single job review",
    description="""
Runs the full NLP pipeline on one review text:

- **Sentiment** — positive / negative / neutral with per-class scores
- **Topics** — zero-shot classification into up to 3 job-review topics
  (culture, salary, management, growth, work_life_balance, benefits)
- **Summary** — 1-2 sentence extractive summary
- **Keywords** — top 8 content keywords
    """,
)
def analyze_single(req: SingleReviewRequest):
    logger.info(f"Single review request — length={len(req.text)}")
    try:
        result = analyze_review(req.text)
        return result
    except Exception as exc:
        logger.error(f"analyze_single failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(exc)}",
        )


# ── POST /api/analyze/batch ────────────────────────────────────
@router.post(
    "/analyze/batch",
    response_model=CompanyInsightResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a batch of reviews for a company",
    description="""
Accepts up to **50 reviews** for a company and returns:

- Aggregated sentiment breakdown (% positive / negative / neutral)
- Overall sentiment label (positive / negative / mixed)
- Top 3 most-discussed topics
- Auto-generated **pros summary** (from positive reviews)
- Auto-generated **cons summary** (from negative reviews)
- Per-review analysis (same as single endpoint)
    """,
)
def analyze_company_batch(req: BatchReviewRequest):
    logger.info(
        f"Batch request — company={req.company_name!r}, "
        f"reviews={len(req.reviews)}"
    )
    try:
        result = analyze_batch(
            reviews=req.reviews,
            company_name=req.company_name or "Unknown Company",
        )
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        logger.error(f"analyze_batch failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch analysis failed: {str(exc)}",
        )
