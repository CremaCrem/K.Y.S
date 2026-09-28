import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';
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
  const [remember, setRemember] = useState(null);

  useEffect(() => {
    window.electron.getRemember().then(setRemember);
  }, []);

  const toggleRemember = async (e) => {
    const enabled = e.target.checked;
    setError(null);
    try {
      await window.electron.setRemember(enabled);
      setRemember((r) => ({ ...r, remembered: enabled }));
    } catch (err) {
      setError(err.message);
    }
  };

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
    <ModalShell title={t('security')} onClose={onClose}>
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

      <div className="mt-6 pt-5 border-t border-border-color space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!remember?.remembered}
            disabled={!remember?.available}
            onChange={toggleRemember}
            className="mt-1 accent-button cursor-pointer"
          />
          <span>
            <span className="block font-medium text-text-color">{t('remember')}</span>
            <span className="block text-sm text-text-secondary">{t('rememberDesc')}</span>
          </span>
        </label>
        <p className="text-sm text-orange-500">{t('rememberWarning')}</p>
        {remember && !remember.available && <p className="text-sm text-text-secondary">{t('rememberUnavailable')}</p>}
      </div>

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
    </ModalShell>
  );
};

export default SecurityModal;
