"""
test_api.py — Basic API tests using FastAPI's TestClient.

Run:
    cd backend
    pytest tests/test_api.py -v
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ── Health ─────────────────────────────────────────────────────
def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "service" in data


# ── Root ───────────────────────────────────────────────────────
def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "JobLens" in resp.json()["message"]


# ── Single review ──────────────────────────────────────────────
def test_analyze_single_positive():
    resp = client.post("/api/analyze", json={
        "text": "Great team culture and fantastic work life balance. Management is very supportive."
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "sentiment" in data
    assert "topics"    in data
    assert "summary"   in data
    assert "keywords"  in data
    assert data["sentiment"]["label"] in ("positive", "negative", "neutral")


def test_analyze_single_too_short():
    resp = client.post("/api/analyze", json={"text": "short"})
    assert resp.status_code == 422   # Pydantic validation error


def test_analyze_single_missing_field():
    resp = client.post("/api/analyze", json={})
    assert resp.status_code == 422


# ── Batch ──────────────────────────────────────────────────────
def test_analyze_batch():
    resp = client.post("/api/analyze/batch", json={
        "company_name": "Test Corp",
        "reviews": [
            "Great culture and work life balance. Love working here.",
            "Pay is too low and promotions are hard to get.",
            "Management is supportive and the team is collaborative.",
        ]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["company_name"]       == "Test Corp"
    assert data["total_reviews"]      == 3
    assert "overall_sentiment"        in data
    assert "sentiment_breakdown"      in data
    assert "top_topics"               in data
    assert "pros_summary"             in data
    assert "cons_summary"             in data
    assert len(data["reviews"])       == 3


def test_analyze_batch_no_company_name():
    resp = client.post("/api/analyze/batch", json={
        "reviews": ["This place is amazing. Really great environment."]
    })
    assert resp.status_code == 200
    assert resp.json()["company_name"] == "Unknown Company"


def test_analyze_batch_empty():
    resp = client.post("/api/analyze/batch", json={"reviews": []})
    assert resp.status_code == 422
