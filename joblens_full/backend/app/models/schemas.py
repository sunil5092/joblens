"""
Pydantic schemas — all request and response models for the JobLens API.
"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────
class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL  = "neutral"


class TopicLabel(str, Enum):
    CULTURE   = "culture"
    SALARY    = "salary"
    MANAGEMENT = "management"
    GROWTH    = "growth"
    WORK_LIFE = "work_life_balance"
    BENEFITS  = "benefits"
    OTHER     = "other"


# ── Request Models ─────────────────────────────────────────────
class SingleReviewRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="The review text to analyze",
        example="Great company culture but the pay is a bit below market rate."
    )


class BatchReviewRequest(BaseModel):
    reviews: List[str] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of review strings to analyze (max 50)",
        example=[
            "Amazing team and work life balance.",
            "Salary is low and promotions are rare."
        ]
    )
    company_name: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional company name for the batch report",
        example="Acme Corp"
    )


# ── Response Sub-Models ────────────────────────────────────────
class SentimentResult(BaseModel):
    label:    SentimentLabel
    score:    float = Field(..., ge=0.0, le=1.0, description="Confidence of winning label")
    positive: float = Field(..., ge=0.0, le=1.0)
    negative: float = Field(..., ge=0.0, le=1.0)
    neutral:  float = Field(..., ge=0.0, le=1.0)


class TopicResult(BaseModel):
    label:      TopicLabel
    confidence: float = Field(..., ge=0.0, le=1.0)


# ── Primary Response Models ────────────────────────────────────
class SingleReviewResponse(BaseModel):
    text:      str
    sentiment: SentimentResult
    topics:    List[TopicResult]
    summary:   str
    keywords:  List[str]


class SentimentBreakdown(BaseModel):
    positive: float
    negative: float
    neutral:  float


class CompanyInsightResponse(BaseModel):
    company_name:         str
    total_reviews:        int
    overall_sentiment:    str
    sentiment_breakdown:  SentimentBreakdown
    top_topics:           List[str]
    pros_summary:         str
    cons_summary:         str
    reviews:              List[SingleReviewResponse]


# ── Health ─────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status:  str
    service: str
    version: str
