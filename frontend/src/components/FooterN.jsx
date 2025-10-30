import React from 'react';

export default function FooterN() {
  return (
    <a
      href="https://nextjs.org"
      target="_blank"
      rel="noreferrer"
      aria-label="Built with Next.js"
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 1000,
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <img src="/n.svg" alt="Next.js" width={16} height={16} />
    </a>
  );
}


