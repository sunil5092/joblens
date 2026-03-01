import React from 'react';

export default function SummaryKeywords({ summary, keywords }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

      {/* Summary */}
      <div style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding:      '1.4rem',
      }}>
        <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '0.9rem' }}>
          AI Summary
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.75 }}>
          {summary || '—'}
        </p>
      </div>

      {/* Keywords */}
      <div style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding:      '1.4rem',
      }}>
        <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '0.9rem' }}>
          Keywords
        </p>
        <div>
          {(keywords || []).map((kw, i) => (
            <span key={i} style={{
              display:      'inline-block',
              background:   'var(--surface2)',
              border:       '1px solid var(--border)',
              color:        'var(--muted)',
              padding:      '0.2rem 0.55rem',
              borderRadius: 3,
              fontSize:     11,
              marginRight:  6,
              marginBottom: 6,
            }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
