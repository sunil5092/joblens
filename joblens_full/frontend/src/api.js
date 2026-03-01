/**
 * api.js — centralised API layer for JobLens frontend.
 *
 * The React dev server proxies /api/* → http://localhost:8000
 * (configured via "proxy" in package.json).
 *
 * In production, set REACT_APP_API_BASE to your deployed backend URL.
 */

const BASE = process.env.REACT_APP_API_BASE || '';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Analyze a single review.
 * @param {string} text
 * @returns {Promise<SingleReviewResponse>}
 */
export async function analyzeSingle(text) {
  return post('/api/analyze', { text });
}

/**
 * Analyze a batch of reviews for a company.
 * @param {string[]} reviews
 * @param {string}   companyName
 * @returns {Promise<CompanyInsightResponse>}
 */
export async function analyzeBatch(reviews, companyName = '') {
  return post('/api/analyze/batch', {
    reviews,
    company_name: companyName || undefined,
  });
}

/**
 * Health check — resolves true if API is reachable.
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
