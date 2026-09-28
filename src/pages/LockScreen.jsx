import React, { useState } from 'react';
import { HiLockClosed, HiExclamationTriangle } from 'react-icons/hi2';
import NewPasswordFields, { inputClass, labelClass, newPasswordError } from '../components/NewPasswordFields';
import { useLanguage } from '../context/LanguageContext';

// Shown whenever the vault isn't unlocked: first-time setup, unlock, or
// "forgot password" recovery. `vault` comes from window.electron.getVaultStatus().
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

  if (mode === 'error') {
    return (
      <div className="h-full bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-2 text-red-500 mb-3">
            <HiExclamationTriangle size={20} />
            <h1 className="text-lg font-semibold">{t('vaultErrorTitle')}</h1>
          </div>
          <p className="text-sm text-text-secondary break-words select-text">{vault.message}</p>
        </div>
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
    <div className="h-full overflow-auto bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold font-montserrat text-text-color tracking-tight">{t('appName')}</h1>
        <p className="text-text-secondary mt-1 text-sm font-medium">{t('tagline')}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface rounded-2xl shadow-soft p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HiLockClosed className="text-button" size={20} />
          <h2 className="text-xl font-semibold text-text-color">{t(title)}</h2>
        </div>
        <p className="text-sm text-text-secondary">
          {t(intro)} {mode === 'setup' && vault.hasExistingPasswords && t('setupExisting')}
        </p>

        {mode === 'unlock' && vault.remembered && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(async () => {
                const { ok } = await window.electron.unlockRemembered();
                if (ok) return onUnlocked();
                setError('rememberFailed');
                onUnlocked(); // refreshes the status, which hides this button
              })}
              className="w-full h-11 bg-button text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {t('unlockRemembered')}
            </button>
            <p className="text-center text-xs text-text-secondary">{t('or')}</p>
          </>
        )}

        {mode === 'unlock' && (
          <div>
            <label className={labelClass}>{t('masterPassword')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>
        )}

        {mode === 'recover' && (
          <div>
            <label className={labelClass}>{t('recoveryCode')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} font-mono uppercase`}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
              spellCheck={false}
              autoFocus
            />
          </div>
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

        {error && <p className="text-sm text-red-500">{t(error)}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full h-11 bg-button text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {busy ? t('working') : t(submitLabel[mode])}
        </button>

        {mode === 'unlock' && (
          <button type="button" onClick={() => switchMode(true)} className="w-full text-sm text-button hover:underline">
            {t('forgotPassword')}
          </button>
        )}
        {mode === 'recover' && (
          <button type="button" onClick={() => switchMode(false)} className="w-full text-sm text-text-secondary hover:underline">
            {t('back')}
          </button>
        )}
      </form>
    </div>
  );
};

export default LockScreen;
