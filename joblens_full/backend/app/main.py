"""
main.py — FastAPI application entry point for JobLens.

Run locally:
    uvicorn app.main:app --reload --port 8000

Interactive API docs:
    http://localhost:8000/docs      (Swagger UI)
    http://localhost:8000/redoc     (ReDoc)
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, APP_ENV
from app.api import health, analyze

# ── Logging setup ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── FastAPI app ────────────────────────────────────────────────
app = FastAPI(
    title="JobLens NLP API",
    description=(
        "AI-powered job review analyzer.\n\n"
        "Provides sentiment analysis, topic classification, "
        "extractive summarisation, and keyword extraction "
        "for job reviews — single or in batch."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if APP_ENV == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────
app.include_router(health.router,  prefix="/api")
app.include_router(analyze.router, prefix="/api")


# ── Root ───────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "JobLens NLP API is running 🚀",
        "docs":    "/docs",
        "health":  "/api/health",
    }


# ── Startup event ──────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("=" * 55)
    logger.info("  JobLens API started")
    logger.info(f"  ENV  : {APP_ENV}")
    logger.info(f"  CORS : {CORS_ORIGINS}")
    logger.info("  Models are loaded lazily on first request.")
    logger.info("=" * 55)
