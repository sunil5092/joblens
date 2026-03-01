import React, { useState } from 'react';
import { analyzeSingle } from '../api';
import SentimentCard from '../components/SentimentCard';
import TopicsCard from '../components/TopicsCard';
import SummaryKeywords from '../components/SummaryKeywords';
import LoadingSpinner from '../components/LoadingSpinner';

const SAMPLE = `The team culture here is absolutely fantastic — everyone is collaborative and supportive. 
Management is transparent and genuinely listens to employee feedback. 
The onboarding process was smooth and the learning opportunities are great. 
The only real downside is that the salary is a bit below market rate for the region, 
and promotions can be slow if you don't advocate for yourself.`;

export default function SingleReview() {
  const [text,    setText]   = useState('');
  const [result,  setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState(null);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeSingle(text.trim());
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Input card */}
      <div style={cardStyle}>
        <p style={labelStyle}>Paste a job review</p>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. Great culture but pay is below market rate. Management is supportive..."
          style={taStyle}
          rows={6}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleAnalyze}
            disabled={loading || text.trim().length < 10}
            style={text.trim().length >= 10 && !loading ? btnPrimary : btnDisabled}
          >
            {loading ? 'Analyzing...' : 'Analyze →'}
          </button>

          <button
            onClick={() => setText(SAMPLE)}
            style={btnGhost}
          >
            Load Sample
          </button>

          {result && (
            <button
              onClick={() => { setResult(null); setText(''); }}
              style={btnGhost}
            >
              Clear
            </button>
          )}
        </div>

        {/* Char count */}
        <p style={{ color: 'var(--dim)', fontSize: 10, marginTop: '0.5rem' }}>
          {text.length} / 5000 characters
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background:   'rgba(247,129,102,0.1)',
          border:       '1px solid rgba(247,129,102,0.3)',
          borderRadius: 'var(--radius-md)',
          padding:      '1rem 1.2rem',
          color:        'var(--red)',
          fontSize:     13,
          marginBottom: '1rem',
        }}>
          ⚠ {error}
          <span style={{ color: 'var(--muted)', display: 'block', marginTop: 4, fontSize: 11 }}>
            Make sure the backend is running: <code>uvicorn app.main:app --reload</code>
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner message="Running NLP pipeline..." />}

      {/* Results */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SentimentCard sentiment={result.sentiment} />
          <TopicsCard topics={result.topics} />
          <SummaryKeywords summary={result.summary} keywords={result.keywords} />
        </div>
      )}
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────────────── */
const cardStyle = {
  background:   'var(--surface)',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding:      '1.4rem',
  marginBottom: '1rem',
};

const labelStyle = {
  fontSize:      10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color:         'var(--accent)',
  marginBottom:  '0.75rem',
};

const taStyle = {
  width:        '100%',
  background:   'var(--surface2)',
  border:       '1px solid var(--border)',
  borderRadius: 6,
  color:        'var(--text)',
  fontFamily:   'var(--font-mono)',
  fontSize:     13,
  padding:      '0.75rem 1rem',
  resize:       'vertical',
  outline:      'none',
  lineHeight:   1.7,
  transition:   'border-color 0.2s',
};

const btnBase = {
  padding:      '0.65rem 1.4rem',
  borderRadius: 'var(--radius-sm)',
  fontFamily:   'var(--font-mono)',
  fontSize:     12,
  fontWeight:   600,
  border:       'none',
  cursor:       'pointer',
  transition:   'all 0.2s',
};

const btnPrimary = {
  ...btnBase,
  background: 'var(--accent)',
  color:      'var(--bg)',
};

const btnDisabled = {
  ...btnBase,
  background: 'var(--border)',
  color:      'var(--dim)',
  cursor:     'not-allowed',
};

const btnGhost = {
  ...btnBase,
  background: 'transparent',
  border:     '1px solid var(--border)',
  color:      'var(--muted)',
};
