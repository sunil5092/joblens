import React, { useState } from 'react';
import { analyzeBatch } from '../api';
import SentimentCard from '../components/SentimentCard';
import { TopicChip } from '../components/TopicsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SAMPLE_COMPANY = 'Acme Corp';
const SAMPLE_REVIEWS = `The team culture here is fantastic and everyone is super collaborative. Highly recommend.
Pay is below market rate and promotions are extremely hard to come by. Frustrating.
Excellent learning opportunities and very supportive management team. Great place to grow.
Toxic environment with high turnover. Very stressful and unsustainable workload.
Decent benefits but the workload is intense. Good culture though, just overworked.
Great work life balance and flexible hours. Management really listens to feedback.
Salary needs improvement but the people and environment are amazing. Love the team.`;

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{label}</span>
        <span style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div style={{ background: 'var(--surface2)', borderRadius: 99, height: 6 }}>
        <div style={{ width: `${value * 100}%`, background: color, borderRadius: 99, height: 6, transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );
}

function SentimentBadge({ label }) {
  const map = {
    positive: { color: 'var(--green)', bg: 'rgba(126,231,135,0.1)', bd: 'rgba(126,231,135,0.3)', e: '😊' },
    negative: { color: 'var(--red)',   bg: 'rgba(247,129,102,0.1)', bd: 'rgba(247,129,102,0.3)', e: '😞' },
    mixed:    { color: 'var(--yellow)',bg: 'rgba(227,179,65,0.1)',  bd: 'rgba(227,179,65,0.3)',  e: '🤔' },
    neutral:  { color: 'var(--muted)', bg: 'rgba(139,148,158,0.1)', bd: 'rgba(139,148,158,0.3)', e: '😐' },
  };
  const c = map[label] || map.neutral;
  return (
    <span style={{ background: c.bg, border: `1px solid ${c.bd}`, color: c.color,
      padding: '0.3rem 0.9rem', borderRadius: 3, fontWeight: 700, fontSize: 12 }}>
      {c.e} {label.toUpperCase()}
    </span>
  );
}

export default function BatchAnalysis() {
  const [company, setCompany] = useState('');
  const [reviews, setReviews] = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const reviewLines = reviews.split('\n').map(l => l.trim()).filter(Boolean);

  async function handleAnalyze() {
    if (reviewLines.length === 0) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await analyzeBatch(reviewLines, company);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Input */}
      <div style={cardStyle}>
        <p style={labelStyle}>Company Name (optional)</p>
        <input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="e.g. Google, Amazon, Acme Corp..."
          style={{ ...taStyle, height: 40, resize: 'none' }}
        />

        <p style={{ ...labelStyle, marginTop: '1rem' }}>
          Reviews — one per line ({reviewLines.length} / 50)
        </p>
        <textarea
          value={reviews}
          onChange={e => setReviews(e.target.value)}
          placeholder={'Review 1...\nReview 2...\nReview 3...'}
          style={{ ...taStyle, minHeight: 160 }}
          rows={8}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleAnalyze}
            disabled={loading || reviewLines.length === 0}
            style={reviewLines.length > 0 && !loading ? btnPrimary : btnDisabled}
          >
            {loading ? 'Analyzing...' : `Analyze ${reviewLines.length > 0 ? `(${reviewLines.length})` : ''} →`}
          </button>
          <button onClick={() => { setReviews(SAMPLE_REVIEWS); setCompany(SAMPLE_COMPANY); }} style={btnGhost}>
            Load Sample
          </button>
          {result && (
            <button onClick={() => { setResult(null); setReviews(''); setCompany(''); }} style={btnGhost}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(247,129,102,0.1)', border: '1px solid rgba(247,129,102,0.3)',
          borderRadius: 'var(--radius-md)', padding: '1rem 1.2rem', color: 'var(--red)',
          fontSize: 13, marginBottom: '1rem' }}>
          ⚠ {error}
          <span style={{ color: 'var(--muted)', display: 'block', marginTop: 4, fontSize: 11 }}>
            Make sure the backend is running: <code>uvicorn app.main:app --reload</code>
          </span>
        </div>
      )}

      {loading && <LoadingSpinner message={`Analyzing ${reviewLines.length} reviews...`} />}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* Company overview */}
          <div style={{ ...cardStyle, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.4rem' }}>
              <div>
                <p style={labelStyle}>Company Report</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                  {result.company_name}
                </h2>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {result.total_reviews} reviews analyzed
                </span>
              </div>
              <SentimentBadge label={result.overall_sentiment} />
            </div>

            <ScoreBar label="Positive" value={result.sentiment_breakdown.positive} color="var(--green)" />
            <ScoreBar label="Negative" value={result.sentiment_breakdown.negative} color="var(--red)"   />
            <ScoreBar label="Neutral"  value={result.sentiment_breakdown.neutral}  color="var(--muted)" />
          </div>

          {/* Pros / Cons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '3px solid var(--green)' }}>
              <p style={{ ...labelStyle, color: 'var(--green)' }}>✅ What's Working</p>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.75 }}>{result.pros_summary}</p>
            </div>
            <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '3px solid var(--red)' }}>
              <p style={{ ...labelStyle, color: 'var(--red)' }}>⚠️ Areas to Improve</p>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.75 }}>{result.cons_summary}</p>
            </div>
          </div>

          {/* Top topics */}
          <div style={{ ...cardStyle, marginBottom: '1rem' }}>
            <p style={labelStyle}>Top Discussed Topics</p>
            {result.top_topics.map((t, i) => (
              <span key={i} style={{ display: 'inline-block',
                background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.2)',
                color: 'var(--accent)', padding: '0.3rem 0.8rem', borderRadius: 3,
                fontSize: 11, marginRight: 8, marginBottom: 8, textTransform: 'capitalize' }}>
                {t.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          {/* Per-review breakdown */}
          <div style={cardStyle}>
            <p style={{ ...labelStyle, marginBottom: '0.9rem' }}>
              Per-Review Breakdown ({result.reviews.length})
            </p>
            {result.reviews.map((r, i) => (
              <div key={i} style={{
                padding:      '1rem 0',
                borderBottom: i < result.reviews.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--dim)', fontSize: 10 }}>Review #{i + 1}</span>
                  <SentimentBadge label={r.sentiment.label} />
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.65, marginBottom: '0.5rem' }}>
                  {r.text}
                </p>
                <div>
                  {r.topics.slice(0, 2).map((t, j) => (
                    <TopicChip key={j} label={t.label} confidence={t.confidence} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background:   'var(--surface)',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding:      '1.4rem',
  marginBottom: '1rem',
};
const labelStyle = {
  fontSize: 10, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem',
};
const taStyle = {
  width: '100%', background: 'var(--surface2)',
  border: '1px solid var(--border)', borderRadius: 6,
  color: 'var(--text)', fontFamily: 'var(--font-mono)',
  fontSize: 13, padding: '0.75rem 1rem', resize: 'vertical',
  outline: 'none', lineHeight: 1.7, boxSizing: 'border-box',
};
const btnBase = {
  padding: '0.65rem 1.4rem', borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
  border: 'none', cursor: 'pointer',
};
const btnPrimary  = { ...btnBase, background: 'var(--accent)',  color: 'var(--bg)' };
const btnDisabled = { ...btnBase, background: 'var(--border)',  color: 'var(--dim)', cursor: 'not-allowed' };
const btnGhost    = { ...btnBase, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' };
