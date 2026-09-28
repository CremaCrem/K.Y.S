import React from 'react';

const TONES = { primary: 'var(--kys-primary)', danger: 'var(--kys-danger)', warning: 'var(--kys-cat-games)', success: 'var(--kys-success)', neutral: 'var(--kys-text)' };

export function StatCard({ value, label, tone = 'primary', onClick }) {
  return (
    <div onClick={onClick} className={onClick ? 'kys-press' : undefined} style={{
      flex: 1, minWidth: 120, padding: '18px 16px', borderRadius: 'var(--kys-radius-lg)', background: 'var(--kys-surface-muted)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, color: TONES[tone] }}>{value}</span>
      <span style={{ fontSize: 14, color: 'var(--kys-text-muted)' }}>{label}</span>
    </div>
  );
}
