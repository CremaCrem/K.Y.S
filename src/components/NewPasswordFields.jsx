import React from 'react';
import PasswordStrength from './PasswordStrength';
import { TextField } from './ui';
import { useLanguage } from '../context/LanguageContext';

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
      <div className="flex flex-col gap-2">
        <TextField label={label} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus={autoFocus} />
        <PasswordStrength password={password} />
      </div>
      <TextField label={t('confirmPassword')} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
    </>
  );
};

export default NewPasswordFields;
