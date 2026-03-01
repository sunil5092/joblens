import React from 'react';

export default function LoadingSpinner({ message = 'Analyzing...' }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '3rem',
      gap:            '1rem',
    }}>
      {/* Spinner */}
      <div style={{
        width:        40,
        height:       40,
        border:       '3px solid var(--border)',
        borderTop:    '3px solid var(--accent)',
        borderRadius: '50%',
        animation:    'spin 0.8s linear infinite',
      }} />

      <p style={{ color: 'var(--muted)', fontSize: 12 }}>{message}</p>
      <p style={{ color: 'var(--dim)', fontSize: 11 }}>
        First run downloads AI models (~1.5 GB). Subsequent runs are fast.
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
