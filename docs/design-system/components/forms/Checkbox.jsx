import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Checkbox({ checked = false, onChange, label, disabled = false }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: 14, color: 'var(--kys-text-muted)' }}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange && onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{ width: 20, height: 20, borderRadius: 'var(--kys-radius-xs)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? 'var(--kys-primary)' : 'var(--kys-surface)', border: checked ? 'none' : '1.5px solid var(--kys-border-strong)',
        color: '#fff', transition: 'background-color var(--kys-dur-fast)' }}>
        {checked && <Icon name="check" size={16} weight={600} />}
      </span>
      {label}
    </label>
  );
}
