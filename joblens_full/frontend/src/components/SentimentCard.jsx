import React from 'react';

const LABELS = {
  positive: { color: 'var(--green)', emoji: '😊', bg: 'rgba(126,231,135,0.1)', border: 'rgba(126,231,135,0.3)' },
  negative: { color: 'var(--red)',   emoji: '😞', bg: 'rgba(247,129,102,0.1)', border: 'rgba(247,129,102,0.3)' },
  neutral:  { color: 'var(--muted)', emoji: '😐', bg: 'rgba(139,148,158,0.1)', border: 'rgba(139,148,158,0.3)' },
};

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{label}</span>
        <span style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div style={{ background: 'var(--surface2)', borderRadius: 99, height: 6 }}>
        <div style={{
          width:      `${value * 100}%`,
          background: color,
          borderRadius: 99,
          height: 6,
          transition: 'width 0.7s ease',
        }} />
      </div>
    </div>
  );
}

export default function SentimentCard({ sentiment }) {
  const cfg = LABELS[sentiment.label] || LABELS.neutral;

  return (
    <div style={{
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding:      '1.4rem',
    }}>
      {/* Section label */}
      <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--accent)', marginBottom: '0.9rem' }}>
        Sentiment Analysis
      </p>

      {/* Winning badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.4rem' }}>
        <span style={{
          background:   cfg.bg,
          border:       `1px solid ${cfg.border}`,
          color:        cfg.color,
          padding:      '0.3rem 0.9rem',
          borderRadius: 3,
          fontWeight:   700,
          fontSize:     12,
          letterSpacing:'0.05em',
        }}>
          {cfg.emoji} {sentiment.label.toUpperCase()}
        </span>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>
          {(sentiment.score * 100).toFixed(1)}% confidence
        </span>
      </div>

      {/* Score bars */}
      <ScoreBar label="positive" value={sentiment.positive} color="var(--green)" />
      <ScoreBar label="negative" value={sentiment.negative} color="var(--red)"   />
      <ScoreBar label="neutral"  value={sentiment.neutral}  color="var(--muted)" />
    </div>
  );
}
