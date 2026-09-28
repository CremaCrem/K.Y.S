import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = {
  danger: ['var(--kys-danger-container)', 'var(--kys-on-danger-container)', 'error'],
  warning: ['var(--kys-warning-container)', 'var(--kys-on-warning-container)', 'warning'],
  success: ['var(--kys-success-container)', 'var(--kys-on-success-container)', 'check_circle'],
  info: ['var(--kys-info-container)', 'var(--kys-on-info-container)', 'info'],
};

export function Alert({ tone = 'danger', icon, children, action }) {
  const [bg, fg, ic] = TONES[tone] || TONES.info;
  return (
    <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--kys-radius-md)', background: bg, color: fg, fontSize: 14, fontWeight: 500 }}>
      <Icon name={icon || ic} size={20} fill />
      <span style={{ flex: 1 }}>{children}</span>
      {action}
    </div>
  );
}
