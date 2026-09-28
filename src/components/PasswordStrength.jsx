import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { passwordStrength } from '../utils/passwordStrength.mjs';

const STYLES = {
  weak: { color: 'var(--kys-danger)', width: '25%' },
  fair: { color: 'var(--kys-primary)', width: '50%' },
  good: { color: 'var(--kys-warning)', width: '75%' },
  strong: { color: 'var(--kys-success)', width: '100%' },
};

const PasswordStrength = ({ password }) => {
  const { t } = useLanguage();
  if (!password) return null;
  const strength = passwordStrength(password);
  const { color, width } = STYLES[strength];

  return (
    <div className="flex flex-col gap-1">
      <div className="h-1.5 rounded-full overflow-hidden bg-surface-muted">
        <div className="h-full rounded-full" style={{ width, background: color, transition: 'width var(--kys-dur) var(--kys-ease)' }} />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold" style={{ color }}>{t(strength)}</span>
        <span className="text-muted font-mono">{password.length} {t('chars')}</span>
      </div>
    </div>
  );
};

export default PasswordStrength;
