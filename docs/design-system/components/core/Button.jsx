import React from 'react';
import { Icon } from './Icon.jsx';

const VARIANTS = {
  primary: { background: 'var(--kys-primary)', color: 'var(--kys-on-primary)', border: 'none', boxShadow: 'var(--kys-shadow-primary)' },
  tonal: { background: 'var(--kys-primary-container)', color: 'var(--kys-on-primary-container)', border: 'none' },
  outline: { background: 'transparent', color: 'var(--kys-text)', border: '1px solid var(--kys-border-strong)' },
  ghost: { background: 'transparent', color: 'var(--kys-primary-text)', border: 'none' },
  danger: { background: 'transparent', color: 'var(--kys-danger)', border: '1px solid var(--kys-border-strong)' },
};
const SIZES = {
  md: { height: 40, padding: '0 18px', fontSize: 14, icon: 18 },
  lg: { height: 48, padding: '0 22px', fontSize: 15, icon: 20 },
  xl: { height: 56, padding: '0 28px', fontSize: 17, icon: 22 },
};

export function Button({ variant = 'primary', size = 'md', icon, fullWidth = false, disabled = false, type = 'button', onClick, children, style }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={variant === 'ghost' ? 'kys-ghost' : 'kys-press'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: s.height, padding: s.padding, paddingLeft: icon ? `calc(${s.padding.split(' ')[1]} - 4px)` : undefined,
        width: fullWidth ? '100%' : undefined,
        borderRadius: 'var(--kys-radius-full)', fontFamily: 'var(--kys-font-sans)', fontSize: s.fontSize, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap',
        ...VARIANTS[variant], ...style,
      }}
    >
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
    </button>
  );
}
