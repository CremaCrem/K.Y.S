import React from 'react';
import PasswordStrength from './PasswordStrength';
import { useLanguage } from '../context/LanguageContext';

export const inputClass = 'w-full h-11 px-4 bg-input-bg border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all';
export const labelClass = 'block text-sm font-medium text-text-color mb-1.5';

// Returns a translation key describing what's wrong, or null. main.js enforces the same minimum.
export const newPasswordError = (password, confirm) => {
  if (password.length < 8) return 'passwordTooShort';
  if (password !== confirm) return 'passwordsDontMatch';
  return null;
};

const NewPasswordFields = ({ label, password, confirm, setPassword, setConfirm, autoFocus }) => {
  const { t } = useLanguage();
  return (
    <>
      <div>
        <label className={labelClass}>{label}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          autoFocus={autoFocus}
        />
        <PasswordStrength password={password} />
      </div>
      <div>
        <label className={labelClass}>{t('confirmPassword')}</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>
    </>
  );
};

export default NewPasswordFields;
