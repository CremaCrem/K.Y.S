import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function FilterChip({ label, icon, color = 'var(--kys-neutral-700)', selected = false, count, onClick }) {
  return (
    <button type="button" onClick={onClick} className="kys-press" style={{
      height: 36, padding: icon ? '0 14px 0 5px' : '0 14px', borderRadius: 'var(--kys-radius-full)', border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--kys-font-sans)', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap',
      background: selected ? 'var(--kys-primary)' : 'var(--kys-surface-muted)', color: selected ? 'var(--kys-on-primary)' : 'var(--kys-text)',
    }}>
      {icon && (
        <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: selected ? 'rgba(255,255,255,0.25)' : color, color: '#fff' }}>
          <Icon name={icon} size={16} fill />
        </span>
      )}
      {label}
      {count != null && <span style={{ fontSize: 12, opacity: 0.75 }}>{count}</span>}
    </button>
  );
}
