import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Select({ label, value, onChange, options = [], placeholder = '--', style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, ...style }}>
      {label && <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--kys-text)' }}>{label}</span>}
      <span className="kys-field" style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 52,
        borderRadius: 'var(--kys-radius-md)', background: 'var(--kys-surface)', border: '1px solid var(--kys-border-strong)' }}>
        <select value={value} onChange={onChange}
          style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent',
            padding: '0 40px 0 16px', fontFamily: 'var(--kys-font-sans)', fontSize: 16, color: 'var(--kys-text)', cursor: 'pointer' }}>
          <option value="">{placeholder}</option>
          {options.map(o => typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="expand_more" size={20} color="var(--kys-text-muted)" style={{ position: 'absolute', right: 12, pointerEvents: 'none' }} />
      </span>
    </label>
  );
}
