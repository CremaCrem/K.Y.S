import React, { useState } from 'react';
import NewPasswordFields, { newPasswordError } from '../components/NewPasswordFields';
import { Alert, Button, Card, Icon, TextField, Wordmark } from '../components/ui';
import ProfileAvatar from '../components/ProfileAvatar';
import ProfilePicker from './ProfilePicker';
import { useLanguage } from '../context/LanguageContext';

// Shown whenever the vault isn't unlocked: the profile picker, first-time
// setup, unlock, or "forgot password" recovery. `vault` comes from
// window.electron.getVaultStatus().
const LockScreen = ({ vault, onUnlocked, onRecoveryCode }) => {
  const { t } = useLanguage();
  const [recovering, setRecovering] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const mode = vault.status === 'locked' ? (recovering ? 'recover' : 'unlock') : vault.status;

  const switchMode = (toRecover) => {
    setRecovering(toRecover);
    setPassword('');
    setConfirm('');
    setCode('');
    setError(null);
  };

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'unlock') {
      return run(async () => {
        const { ok } = await window.electron.unlock(password);
        if (ok) return onUnlocked();
        setPassword('');
        setError('wrongPassword');
      });
    }

    const passwordError = newPasswordError(password, confirm);
    if (passwordError) return setError(passwordError);

    if (mode === 'setup') {
      return run(async () => {
        const { recoveryCode } = await window.electron.setupVault(password);
        onRecoveryCode(recoveryCode);
      });
    }
    return run(async () => {
      const { ok } = await window.electron.recover(code, password);
      if (ok) return onUnlocked();
      setError('wrongRecoveryCode');
    });
  };

  if (mode === 'pick') {
    return <ProfilePicker profiles={vault.profiles} onPicked={onUnlocked} onRecoveryCode={onRecoveryCode} />;
  }

  const switchProfile = (
    <Button variant="ghost" style={{ color: 'var(--kys-text-muted)', alignSelf: 'center' }}
      onClick={async () => { await window.electron.switchProfile(); onUnlocked(); }}>
      {t('switchProfile')}
    </Button>
  );

  if (mode === 'error') {
    return (
      <div className="h-full overflow-auto flex items-center justify-center p-6">
        <Card className="w-full max-w-md flex flex-col gap-4">
          <Alert tone="danger">{t('vaultErrorTitle')}</Alert>
          <p className="text-sm text-muted break-words select-text">{vault.message}</p>
          {switchProfile}
        </Card>
      </div>
    );
  }

  const titles = {
    setup: ['setupTitle', 'setupIntro'],
    unlock: ['unlockTitle', 'unlockIntro'],
    recover: ['recoverTitle', 'recoverIntro'],
  };
  const submitLabel = { setup: 'createVault', unlock: 'unlock', recover: 'recoverSubmit' };
  const [title, intro] = titles[mode];

  return (
    <div className="h-full overflow-auto flex flex-col items-center justify-center p-6">
      <div className="mb-7"><Wordmark large center /></div>

      <Card as="form" onSubmit={handleSubmit} className="w-full max-w-[440px] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <ProfileAvatar profile={vault.profile} size={48} />
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold leading-tight">{t(title)}</h1>
            <p className="text-sm text-muted truncate flex items-center gap-1">
              <Icon name="lock" size={14} /> {vault.profile.name}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted">
          {t(intro)} {mode === 'setup' && vault.hasExistingPasswords && t('setupExisting')}
        </p>

        {mode === 'unlock' && vault.remembered && (
          <>
            <Button variant="tonal" size="lg" icon="key" fullWidth disabled={busy}
              onClick={() => run(async () => {
                const { ok } = await window.electron.unlockRemembered();
                if (ok) return onUnlocked();
                setError('rememberFailed');
                onUnlocked(); // refreshes the status, which hides this button
              })}>
              {t('unlockRemembered')}
            </Button>
            <p className="text-center text-xs text-subtle">{t('or')}</p>
          </>
        )}

        {mode === 'unlock' && (
          <TextField label={t('masterPassword')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        )}

        {mode === 'recover' && (
          <TextField label={t('recoveryCode')} value={code} onChange={(e) => setCode(e.target.value)} mono
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" spellCheck={false} autoFocus inputStyle={{ textTransform: 'uppercase' }} />
        )}

        {mode !== 'unlock' && (
          <NewPasswordFields
            label={t(mode === 'setup' ? 'masterPassword' : 'newPassword')}
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
            autoFocus={mode === 'setup'}
          />
        )}

        {error && <Alert tone="danger">{t(error)}</Alert>}

        <Button type="submit" size="xl" fullWidth disabled={busy} style={{ marginTop: 4 }}>
          {busy ? t('working') : t(submitLabel[mode])}
        </Button>

        <div className="flex flex-col items-center gap-1">
          {mode === 'unlock' && <Button variant="ghost" onClick={() => switchMode(true)}>{t('forgotPassword')}</Button>}
          {mode === 'recover' && (
            <Button variant="ghost" style={{ color: 'var(--kys-text-muted)' }} onClick={() => switchMode(false)}>{t('back')}</Button>
          )}
          {mode !== 'recover' && switchProfile}
        </div>
      </Card>
    </div>
  );
};

export default LockScreen;
