"""
Central configuration — reads from environment variables / .env file.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── App ────────────────────────────────────────────────────────
APP_ENV   = os.getenv("APP_ENV", "development")
APP_PORT  = int(os.getenv("APP_PORT", 8000))

# ── Models ─────────────────────────────────────────────────────
SENTIMENT_MODEL  = os.getenv(
    "SENTIMENT_MODEL",
    "cardiffnlp/twitter-roberta-base-sentiment-latest"
)
ZERO_SHOT_MODEL  = os.getenv(
    "ZERO_SHOT_MODEL",
    "facebook/bart-large-mnli"
)

# ── CORS ───────────────────────────────────────────────────────
_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173"
)
CORS_ORIGINS = [o.strip() for o in _raw_origins.split(",")]
