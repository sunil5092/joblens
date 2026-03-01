import React from 'react';

export default function Navbar({ apiOnline }) {
  return (
    <nav style={{
      position:       'sticky',
      top:            0,
      zIndex:         100,
      background:     'rgba(8,12,16,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom:   '1px solid var(--border)',
      padding:        '0.9rem 1.8rem',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <span style={{
        fontFamily:    'var(--font-display)',
        fontWeight:    800,
        fontSize:      '1.15rem',
        color:         'var(--accent)',
        letterSpacing: '-0.02em',
      }}>
        JobLens 🔍
      </span>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

        {/* API status pill */}
        <span style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          '0.4rem',
          background:   apiOnline ? 'rgba(126,231,135,0.1)' : 'rgba(247,129,102,0.1)',
          border:       `1px solid ${apiOnline ? 'rgba(126,231,135,0.3)' : 'rgba(247,129,102,0.3)'}`,
          color:        apiOnline ? 'var(--green)' : 'var(--red)',
          padding:      '0.2rem 0.7rem',
          borderRadius: 999,
          fontSize:     10,
          letterSpacing:'0.06em',
        }}>
          <span style={{
            display:      'block',
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   apiOnline ? 'var(--green)' : 'var(--red)',
            animation:    apiOnline ? 'pulse 2s ease-in-out infinite' : 'none',
          }}/>
          {apiOnline ? 'API Online' : 'API Offline'}
        </span>

        {/* Links */}
        <a
          href="https://github.com/sunil5092"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--muted)', fontSize: 12 }}
        >
          GitHub ↗
        </a>
        <a
          href="https://www.linkedin.com/in/msunil2002/"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--muted)', fontSize: 12 }}
        >
          LinkedIn ↗
        </a>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(126,231,135,0.4); }
          50%      { opacity:.7; box-shadow: 0 0 0 5px rgba(126,231,135,0); }
        }
      `}</style>
    </nav>
  );
}
