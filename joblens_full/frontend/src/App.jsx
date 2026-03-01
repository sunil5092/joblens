import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SingleReview from './pages/SingleReview';
import BatchAnalysis from './pages/BatchAnalysis';
import { checkHealth } from './api';

export default function App() {
  const [tab,       setTab]      = useState('single');
  const [apiOnline, setApiOnline] = useState(false);

  // Check if backend is up on mount
  useEffect(() => {
    checkHealth().then(setApiOnline);
    const interval = setInterval(() => checkHealth().then(setApiOnline), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Navbar apiOnline={apiOnline} />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Hero */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: '0.5rem',
          }}>
            AI-Powered Job Review Analyzer
          </p>
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontWeight:    800,
            fontSize:      'clamp(1.8rem, 4vw, 2.8rem)',
            letterSpacing: '-0.03em',
            lineHeight:    1.05,
            marginBottom:  '0.75rem',
          }}>
            Understand what{' '}
            <span style={{ color: 'var(--accent)' }}>employees</span>{' '}
            really think.
          </h1>
          <p style={{ color: 'var(--muted)', maxWidth: 500, lineHeight: 1.75, fontSize: 13 }}>
            Paste any job review and get instant{' '}
            <strong style={{ color: 'var(--text)' }}>sentiment analysis</strong>,{' '}
            <strong style={{ color: 'var(--text)' }}>topic classification</strong>, and{' '}
            <strong style={{ color: 'var(--text)' }}>AI-generated summaries</strong> — powered by
            RoBERTa and BART transformer models.
          </p>
        </div>

        {/* API offline warning */}
        {!apiOnline && (
          <div style={{
            background:   'rgba(227,179,65,0.08)',
            border:       '1px solid rgba(227,179,65,0.3)',
            borderRadius: 'var(--radius-md)',
            padding:      '0.9rem 1.2rem',
            color:        'var(--yellow)',
            fontSize:     12,
            marginBottom: '1.2rem',
            lineHeight:   1.6,
          }}>
            ⚠ Backend API is not reachable.{' '}
            <span style={{ color: 'var(--muted)' }}>
              Start it with:{' '}
              <code style={{
                background: 'var(--surface2)',
                padding: '0.1rem 0.4rem',
                borderRadius: 3,
              }}>
                cd backend && uvicorn app.main:app --reload
              </code>
            </span>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{
          display:      'flex',
          gap:          4,
          marginBottom: '1.5rem',
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding:      4,
          width:        'fit-content',
        }}>
          {[
            { key: 'single', label: 'Single Review' },
            { key: 'batch',  label: 'Company Batch' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                background:   tab === key ? 'var(--surface2)' : 'transparent',
                border:       tab === key ? '1px solid var(--border)' : '1px solid transparent',
                color:        tab === key ? 'var(--text)' : 'var(--muted)',
                padding:      '0.4rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
                cursor:       'pointer',
                fontFamily:   'var(--font-mono)',
                fontSize:     12,
                transition:   'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Page content */}
        {tab === 'single' ? <SingleReview /> : <BatchAnalysis />}

        {/* Footer */}
        <div style={{
          textAlign:  'center',
          padding:    '3rem 0 1rem',
          color:      'var(--dim)',
          fontSize:   11,
          borderTop:  '1px solid var(--border)',
          marginTop:  '3rem',
        }}>
          Built by{' '}
          <a href="https://www.linkedin.com/in/msunil2002/" target="_blank" rel="noreferrer"
            style={{ color: 'var(--accent)' }}>
            Sunil KM
          </a>
          {' '}· MS Applied CS @ SEMO ·{' '}
          <a href="https://github.com/sunil5092" target="_blank" rel="noreferrer"
            style={{ color: 'var(--muted)' }}>
            GitHub
          </a>
        </div>

      </main>
    </div>
  );
}
