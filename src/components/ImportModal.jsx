import React, { useState } from 'react';
import ModalShell, { primaryButton, secondaryButton } from './ModalShell';
import { inputClass, labelClass } from './NewPasswordFields';
import { useLanguage } from '../context/LanguageContext';

// `start` is what window.electron.importPasswords() returned after the file
// was picked: a finished import, a request for the file's password, or an
// error. The file itself stays in main.js; only its password is sent there.
const ImportModal = ({ start, onClose, onImported }) => {
  const { t } = useLanguage();
  const [result, setResult] = useState(start.ok ? start : null);
  const [error, setError] = useState(start.error || null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await window.electron.importWithPassword(password);
      if (r.ok) {
        setResult(r);
        onImported();
      } else {
        setPassword('');
        setError(r.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (result || !start.needsPassword) {
    return (
      <ModalShell title={t('importTitle')} onClose={onClose}>
        {result ? (
          <div className="text-sm space-y-1 mb-4">
            <p className="text-emerald-500">{t('importDone')} {result.imported}</p>
            {result.skipped > 0 && <p className="text-text-secondary">{t('importSkipped')} {result.skipped}</p>}
          </div>
        ) : (
          <p className="text-sm text-red-500 mb-4">{t(error)}</p>
        )}
        <button type="button" onClick={onClose} className={secondaryButton}>{t('close')}</button>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={t('importTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-color font-medium break-all">{start.fileName}</p>
        <p className="text-sm text-text-secondary">{t('importIntro')}</p>
        <div>
          <label className={labelClass}>{t('filePassword')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoFocus />
        </div>
        {error && <p className="text-sm text-red-500">{t(error)}</p>}
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? t('working') : t('importButton')}
        </button>
      </form>
    </ModalShell>
  );
};

export default ImportModal;
