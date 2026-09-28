import React, { useState } from 'react';
import ModalShell, { primaryButton, secondaryButton } from './ModalShell';
import NewPasswordFields, { inputClass, labelClass, newPasswordError } from './NewPasswordFields';
import { useLanguage } from '../context/LanguageContext';

// Asks for the master password (proof it's the owner), then main.js writes a
// password-protected .kys file. The file password is the master password
// unless the user picks a different one.
const ExportModal = ({ onClose }) => {
  const { t } = useLanguage();
  const [master, setMaster] = useState('');
  const [useMaster, setUseMaster] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [exported, setExported] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!useMaster) {
      const passwordError = newPasswordError(password, confirm);
      if (passwordError) return setError(passwordError);
    }
    setBusy(true);
    setError(null);
    try {
      const result = await window.electron.exportPasswords(master, useMaster ? null : password);
      if (result.ok) setExported(result.count);
      else if (result.error) setError(result.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (exported !== null) {
    return (
      <ModalShell title={t('exportTitle')} onClose={onClose}>
        <p className="text-sm text-emerald-500 mb-4">{t('exportDone')} {exported}</p>
        <button type="button" onClick={onClose} className={secondaryButton}>{t('close')}</button>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={t('exportTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-secondary">{t('exportIntro')}</p>
        <div>
          <label className={labelClass}>{t('masterPassword')}</label>
          <input type="password" value={master} onChange={(e) => setMaster(e.target.value)} className={inputClass} autoFocus />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-color cursor-pointer">
          <input
            type="checkbox"
            checked={useMaster}
            onChange={(e) => setUseMaster(e.target.checked)}
            className="accent-button cursor-pointer"
          />
          {t('exportUseMaster')}
        </label>
        {!useMaster && (
          <NewPasswordFields
            label={t('filePassword')}
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
          />
        )}
        <p className="text-sm text-orange-500">{t('exportWarning')}</p>
        {error && <p className="text-sm text-red-500">{t(error)}</p>}
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? t('working') : t('exportButton')}
        </button>
      </form>
    </ModalShell>
  );
};

export default ExportModal;
