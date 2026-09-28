import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Toast({ message, icon = 'check_circle', style }) {
  return (
    <div role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 'var(--kys-radius-sm)',
      background: 'var(--kys-neutral-800)', color: '#fff', fontSize: 14, boxShadow: 'var(--kys-shadow-3)', ...style }}>
      <Icon name={icon} size={18} fill color="var(--kys-orange-300)" />{message}
    </div>
  );
}
