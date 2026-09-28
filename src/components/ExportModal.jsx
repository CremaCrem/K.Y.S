import React, { useState } from 'react';
import ModalShell from './ModalShell';
import NewPasswordFields, { newPasswordError } from './NewPasswordFields';
import { Alert, Button, Checkbox, TextField } from './ui';
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
        <div className="flex flex-col gap-4">
          <Alert tone="success">{t('exportDone')} {exported}</Alert>
          <Button variant="outline" size="lg" fullWidth onClick={onClose}>{t('close')}</Button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={t('exportTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">{t('exportIntro')}</p>
        <TextField label={t('masterPassword')} type="password" value={master} onChange={(e) => setMaster(e.target.value)} autoFocus />
        <Checkbox checked={useMaster} onChange={setUseMaster}>{t('exportUseMaster')}</Checkbox>
        {!useMaster && (
          <NewPasswordFields
            label={t('filePassword')}
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
          />
        )}
        <Alert tone="warning">{t('exportWarning')}</Alert>
        {error && <Alert tone="danger">{t(error)}</Alert>}
        <Button type="submit" size="lg" icon="upload" fullWidth disabled={busy}>
          {busy ? t('working') : t('exportButton')}
        </Button>
      </form>
    </ModalShell>
  );
};

export default ExportModal;
