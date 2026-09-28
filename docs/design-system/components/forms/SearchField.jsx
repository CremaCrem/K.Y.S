import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

export function SearchField({ value, onChange, onClear, placeholder = 'Search passwords', style }) {
  return (
    <div className="kys-field" style={{
      display: 'flex', alignItems: 'center', gap: 12, height: 48, padding: '0 6px 0 18px', borderRadius: 'var(--kys-radius-full)',
      background: 'var(--kys-surface-muted)', border: '1px solid transparent', minWidth: 0, ...style,
    }}>
      <Icon name="search" color="var(--kys-text-muted)" />
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--kys-font-sans)', fontSize: 16, color: 'var(--kys-text)' }} />
      {value ? <IconButton icon="close" size={36} title="Clear search" onClick={onClear} /> : null}
    </div>
  );
}
