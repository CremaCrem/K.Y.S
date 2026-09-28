import React from 'react';

export function TextField({ label, value, defaultValue, onChange, placeholder, type = 'text', mono = false, leading, trailing, hint, style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, ...style }}>
      {label && <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--kys-text)' }}>{label}</span>}
      <span className="kys-field" style={{
        display: 'flex', alignItems: 'center', gap: 4, height: 52, padding: `0 ${trailing ? 6 : 16}px 0 ${leading ? 12 : 16}px`,
        borderRadius: 'var(--kys-radius-md)', background: 'var(--kys-surface)', border: '1px solid var(--kys-border-strong)',
      }}>
        {leading}
        <input
          type={type} value={value} defaultValue={defaultValue} onChange={onChange} placeholder={placeholder}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--kys-text)',
            fontFamily: mono ? 'var(--kys-font-mono)' : 'var(--kys-font-sans)', fontSize: 16 }}
        />
        {trailing}
      </span>
      {hint && <span style={{ fontSize: 13, color: 'var(--kys-text-muted)' }}>{hint}</span>}
    </label>
  );
}
