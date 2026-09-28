import React from 'react';
import { Icon } from './Icon.jsx';

const VARIANTS = {
  standard: { background: 'transparent', color: 'var(--kys-text-muted)', border: 'none' },
  filled: { background: 'var(--kys-primary)', color: 'var(--kys-on-primary)', border: 'none' },
  tonal: { background: 'var(--kys-surface-muted)', color: 'var(--kys-text)', border: 'none' },
  outline: { background: 'transparent', color: 'var(--kys-text-muted)', border: '1px solid var(--kys-border-strong)' },
};

export function IconButton({ icon, variant = 'standard', size = 40, shape = 'circle', fill = false, color, title, onClick, disabled = false, style }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={variant === 'standard' || variant === 'outline' ? 'kys-ghost' : 'kys-press'}
      style={{
        width: size, height: size, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: shape === 'circle' ? '50%' : 'var(--kys-radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, padding: 0, ...VARIANTS[variant], ...(color ? { color } : null), ...style,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} fill={fill} />
    </button>
  );
}
