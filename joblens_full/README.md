# 🔍 JobLens — AI Job Review Analyzer

> NLP-powered tool that analyzes job reviews for sentiment, topics, and insights.
> Built as a portfolio project demonstrating end-to-end ML engineering.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=flat-square)](https://huggingface.co)

---

## 🎯 What It Does

Paste any job review → get instant AI analysis:

| Feature | Description |
|---|---|
| **Sentiment** | positive / negative / neutral with per-class confidence scores |
| **Topics** | zero-shot classification into culture, salary, management, growth, work-life balance, benefits |
| **Summary** | 1-2 sentence extractive summary |
| **Keywords** | top content words from the review |
| **Company Report** | batch analyze up to 50 reviews — auto-generates pros/cons + sentiment breakdown |

---

## 🗂️ Project Structure

```
joblens/
│
├── backend/                         # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                  # App entry point & CORS setup
│   │   ├── config.py                # Environment config
│   │   ├── api/
│   │   │   ├── analyze.py           # POST /api/analyze & /api/analyze/batch
│   │   │   └── health.py            # GET /api/health
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic request/response models
│   │   └── services/
│   │       └── nlp_service.py       # Full NLP pipeline
│   ├── notebooks/
│   │   └── explore.ipynb            # EDA + visualization notebook
│   ├── tests/
│   │   └── test_api.py              # pytest test suite
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                        # React frontend
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx                  # Root component + tab routing
        ├── index.js                 # Entry point
        ├── api.js                   # All API calls
        ├── components/
        │   ├── Navbar.jsx
        │   ├── SentimentCard.jsx
        │   ├── TopicsCard.jsx
        │   ├── SummaryKeywords.jsx
        │   └── LoadingSpinner.jsx
        ├── pages/
        │   ├── SingleReview.jsx     # Single review analysis page
        │   └── BatchAnalysis.jsx    # Company batch analysis page
        └── styles/
            └── global.css
```

---

## 🤖 Models

| Task | Model | Why |
|---|---|---|
| Sentiment | `cardiffnlp/twitter-roberta-base-sentiment-latest` | RoBERTa fine-tuned on informal review text |
| Topic Classification | `facebook/bart-large-mnli` | Zero-shot — no labeled training data needed |
| Summarization | Custom TF-IDF extractive | Lightweight, no GPU required |
| Keywords | Frequency + stopword filtering | Fast and interpretable |

---

## 🚀 Running Locally — Step by Step

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- ~2GB disk space for model downloads (happens automatically on first run)

---

### Step 1 — Clone the repo
```bash
git clone https://github.com/sunil5092/joblens.git
cd joblens
```

### Step 2 — Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Start the server
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Open **http://localhost:8000/docs** to see the interactive Swagger UI.

---

### Step 3 — Frontend setup (new terminal tab)
```bash
cd frontend

# Install packages
npm install

# Start the dev server
npm start
```

The app opens at **http://localhost:3000** automatically.

> The React dev server proxies `/api/*` requests to `http://localhost:8000`
> so you don't need to set any URLs manually.

---

### Step 4 — Run the notebook (optional but recommended)
```bash
cd backend
pip install jupyter
jupyter notebook notebooks/explore.ipynb
```

Run all cells — this generates 4 charts saved to `backend/data/` that you can use in your GitHub README.

---

### Step 5 — Run tests
```bash
cd backend
pytest tests/ -v
```

---

## 📡 API Reference

### `POST /api/analyze`
```json
// Request
{ "text": "Great culture but pay is below market rate." }

// Response
{
  "text": "Great culture but pay is below market rate.",
  "sentiment": {
    "label": "positive",
    "score": 0.74,
    "positive": 0.74,
    "negative": 0.18,
    "neutral": 0.08
  },
  "topics": [
    { "label": "culture", "confidence": 0.88 },
    { "label": "salary",  "confidence": 0.76 }
  ],
  "summary": "Great culture but pay is below market rate.",
  "keywords": ["culture", "market", "rate", "salary"]
}
```

### `POST /api/analyze/batch`
```json
// Request
{
  "company_name": "Acme Corp",
  "reviews": ["Review 1...", "Review 2..."]
}

// Response
{
  "company_name": "Acme Corp",
  "total_reviews": 2,
  "overall_sentiment": "mixed",
  "sentiment_breakdown": { "positive": 0.6, "negative": 0.3, "neutral": 0.1 },
  "top_topics": ["culture", "salary"],
  "pros_summary": "...",
  "cons_summary": "...",
  "reviews": [...]
}
```

---

## ☁️ Deployment

**Backend → HuggingFace Spaces** (free)
1. Create a new Space at huggingface.co/spaces
2. Select "Docker" SDK
3. Push the `backend/` folder
4. Set env var `CORS_ORIGINS` to your Vercel frontend URL

**Frontend → Vercel** (free)
1. Push `frontend/` to GitHub
2. Import to vercel.com
3. Set `REACT_APP_API_BASE` to your HuggingFace Space URL

---

## 🧠 What This Project Demonstrates

- End-to-end NLP engineering from raw text to production API
- Using pre-trained transformer models without writing training code
- REST API design with FastAPI + Pydantic validation
- React frontend with multi-page routing and real API integration
- Proper project structure: separation of concerns, config management, testing

---

## 👨‍💻 Author

**Sunil KM** · MS Applied CS @ Southeast Missouri State University

[LinkedIn](https://www.linkedin.com/in/msunil2002/) · [GitHub](https://github.com/sunil5092)

F1 OPT — Authorized to work in the US
