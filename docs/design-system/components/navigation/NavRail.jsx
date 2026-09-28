import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function NavRail({ items = [], active, onChange, footer }) {
  return (
    <nav style={{ width: 84, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <button key={it.id} type="button" onClick={() => onChange && onChange(it.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontFamily: 'var(--kys-font-sans)' }}>
            <span className={on ? undefined : 'kys-ghost'} style={{ width: 56, height: 32, borderRadius: 'var(--kys-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? 'var(--kys-primary)' : 'transparent', color: on ? '#fff' : 'var(--kys-text-muted)' }}>
              <Icon name={it.icon} fill={on} />
            </span>
            <span style={{ fontSize: 12, fontWeight: on ? 600 : 500, color: on ? 'var(--kys-text)' : 'var(--kys-text-muted)' }}>{it.label}</span>
          </button>
        );
      })}
      {footer && <div style={{ marginTop: 'auto' }}>{footer}</div>}
    </nav>
  );
}
