import React, { useState } from 'react';
import ModalShell from './ModalShell';
import { Alert, Button, TextField } from './ui';
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
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              <Alert tone="success">{t('importDone')} {result.imported}</Alert>
              {result.skipped > 0 && <p className="text-sm text-muted">{t('importSkipped')} {result.skipped}</p>}
            </>
          ) : (
            <Alert tone="danger">{t(error)}</Alert>
          )}
          <Button variant="outline" size="lg" fullWidth onClick={onClose}>{t('close')}</Button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={t('importTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm font-medium break-all">{start.fileName}</p>
        <p className="text-sm text-muted">{t('importIntro')}</p>
        <TextField label={t('filePassword')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <Alert tone="danger">{t(error)}</Alert>}
        <Button type="submit" size="lg" icon="download" fullWidth disabled={busy}>
          {busy ? t('working') : t('importButton')}
        </Button>
      </form>
    </ModalShell>
  );
};

export default ImportModal;
