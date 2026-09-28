import React from 'react';

export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, showValue = true, style }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--kys-text-muted)', ...style }}>
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange && onChange(Number(e.target.value))}
        style={{ width: 180, accentColor: 'var(--kys-primary)', cursor: 'pointer',
          background: `linear-gradient(90deg, var(--kys-primary) ${pct}%, var(--kys-border-strong) ${pct}%)`, height: 4, borderRadius: 2, appearance: 'auto' }} />
      {showValue && <span style={{ fontFamily: 'var(--kys-font-mono)', fontSize: 14, color: 'var(--kys-text)', minWidth: 24 }}>{value}</span>}
    </label>
  );
}
