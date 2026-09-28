import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import NewPasswordFields, { inputClass, labelClass, newPasswordError } from './NewPasswordFields';
import { useLanguage } from '../context/LanguageContext';

const SecurityModal = ({ onClose, onRecoveryCode }) => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [changed, setChanged] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChanged(false);
    const passwordError = newPasswordError(password, confirm);
    if (passwordError) return setError(passwordError);

    setBusy(true);
    setError(null);
    try {
      const { ok } = await window.electron.changePassword(current, password);
      if (!ok) return setError('wrongPassword');
      setCurrent('');
      setPassword('');
      setConfirm('');
      setChanged(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleNewKit = async () => {
    setBusy(true);
    try {
      const { recoveryCode } = await window.electron.newRecoveryCode();
      onClose();
      onRecoveryCode(recoveryCode);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative bg-card-bg rounded-2xl shadow-strong w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-color">{t('security')}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="font-medium text-text-color">{t('changePassword')}</h3>
          <div>
            <label className={labelClass}>{t('currentPassword')}</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
          </div>
          <NewPasswordFields
            label={t('newPassword')}
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
          />
          {error && <p className="text-sm text-red-500">{t(error)}</p>}
          {changed && <p className="text-sm text-emerald-500">{t('passwordChanged')}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-10 bg-button text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? t('working') : t('changePassword')}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border-color space-y-3">
          <h3 className="font-medium text-text-color">{t('newKit')}</h3>
          <p className="text-sm text-text-secondary">{t('newKitWarning')}</p>
          <button
            type="button"
            onClick={handleNewKit}
            disabled={busy}
            className="w-full h-10 bg-surface text-text-color rounded-xl font-medium text-sm hover:bg-border-color transition-colors disabled:opacity-50"
          >
            {t('newKitButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;
