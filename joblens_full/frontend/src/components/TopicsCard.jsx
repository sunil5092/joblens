import React from 'react';

const TOPIC_ICONS = {
  culture:           '🏢',
  salary:            '💰',
  management:        '👔',
  growth:            '📈',
  work_life_balance: '⚖️',
  benefits:          '🎁',
  other:             '💬',
};

function TopicChip({ label, confidence }) {
  return (
    <div style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          6,
      background:   'rgba(0,229,255,0.07)',
      border:       '1px solid rgba(0,229,255,0.2)',
      color:        'var(--accent)',
      padding:      '0.35rem 0.8rem',
      borderRadius: 3,
      fontSize:     11,
      marginRight:  8,
      marginBottom: 8,
    }}>
      <span>{TOPIC_ICONS[label] || '💬'}</span>
      <span style={{ textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span>
      <span style={{ color: 'var(--muted)' }}>· {(confidence * 100).toFixed(0)}%</span>
    </div>
  );
}

export default function TopicsCard({ topics }) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div style={{
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding:      '1.4rem',
    }}>
      <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--accent)', marginBottom: '0.9rem' }}>
        Topics Detected
      </p>

      <div>
        {topics.map((t, i) => (
          <TopicChip key={i} label={t.label} confidence={t.confidence} />
        ))}
      </div>
    </div>
  );
}

// Named export for reuse in batch view
export { TopicChip };
