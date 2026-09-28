import React, { useState, useEffect } from 'react';
import ModalShell, { primaryButton, secondaryButton } from './ModalShell';
import NewPasswordFields, { inputClass, labelClass, newPasswordError } from './NewPasswordFields';
import { useLanguage } from '../context/LanguageContext';

const section = 'mt-6 pt-5 border-t border-border-color space-y-3';
const heading = 'font-medium text-text-color';

// Settings for the unlocked profile: its name, master password, "Remember on
// this computer", recovery kit, and deleting the profile.
const SecurityModal = ({ profile, onClose, onRecoveryCode, onProfileChanged }) => {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  // Each section has its own message: [translation key or error text, isError].
  const [nameMsg, setNameMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [rememberMsg, setRememberMsg] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState(null);

  const [name, setName] = useState(profile.name);
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(null);
  const [confirmingRemember, setConfirmingRemember] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    window.electron.getRemember().then(setRemember);
  }, []);

  const run = async (setMsg, action) => {
    setBusy(true);
    setMsg(null);
    try {
      await action();
    } catch (err) {
      setMsg([err.message, true]);
    } finally {
      setBusy(false);
    }
  };

  const handleRename = (e) => {
    e.preventDefault();
    run(setNameMsg, async () => {
      const result = await window.electron.renameProfile(name);
      if (!result.ok) return setNameMsg([result.error, true]);
      setName(result.profile.name);
      setNameMsg(['nameSaved', false]);
      onProfileChanged();
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const passwordError = newPasswordError(password, confirm);
    if (passwordError) return setPasswordMsg([passwordError, true]);
    run(setPasswordMsg, async () => {
      const { ok } = await window.electron.changePassword(current, password);
      if (!ok) return setPasswordMsg(['wrongPassword', true]);
      setCurrent('');
      setPassword('');
      setConfirm('');
      setPasswordMsg(['passwordChanged', false]);
    });
  };

  // Turning "Remember" on first shows a warning the user has to accept;
  // turning it off happens right away.
  const setRemembered = (enabled) => run(setRememberMsg, async () => {
    await window.electron.setRemember(enabled);
    setRemember((r) => ({ ...r, remembered: enabled }));
    setConfirmingRemember(false);
  });

  const handleNewKit = () => run(setPasswordMsg, async () => {
    const { recoveryCode } = await window.electron.newRecoveryCode();
    onClose();
    onRecoveryCode(recoveryCode);
  });

  const handleDelete = (e) => {
    e.preventDefault();
    run(setDeleteMsg, async () => {
      const result = await window.electron.deleteProfile(deletePassword);
      if (!result.ok) {
        setDeletePassword('');
        return setDeleteMsg([result.error, true]);
      }
      onClose(); // main.js locks; the app returns to the profile picker
    });
  };

  const message = (msg) => msg && (
    <p className={`text-sm ${msg[1] ? 'text-red-500' : 'text-emerald-500'}`}>{t(msg[0])}</p>
  );

  return (
    <ModalShell title={t('security')} onClose={onClose}>
      <form onSubmit={handleRename} className="space-y-3">
        <h3 className={heading}>{t('profileSection')}</h3>
        <div className="flex gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} className={inputClass} />
          <button type="submit" disabled={busy || name.trim() === profile.name} className={`${primaryButton} !w-auto px-4 !h-11`}>
            {t('saveName')}
          </button>
        </div>
        {message(nameMsg)}
      </form>

      <form onSubmit={handleChangePassword} className={section}>
        <h3 className={heading}>{t('changePassword')}</h3>
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
        {message(passwordMsg)}
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? t('working') : t('changePassword')}
        </button>
      </form>

      <div className={section}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!remember?.remembered || confirmingRemember}
            disabled={!remember?.available || busy}
            onChange={(e) => (e.target.checked ? setConfirmingRemember(true) : setRemembered(false))}
            className="mt-1 accent-button cursor-pointer"
          />
          <span>
            <span className="block font-medium text-text-color">{t('remember')}</span>
            <span className="block text-sm text-text-secondary">{t('rememberDesc')}</span>
          </span>
        </label>
        {confirmingRemember && (
          <div
            ref={(el) => el?.scrollIntoView({ block: 'nearest' })}
            className="p-4 rounded-xl border border-orange-500/40 bg-orange-500/10 space-y-3"
          >
            <p className="font-medium text-orange-500">{t('rememberConfirmTitle')}</p>
            <p className="text-sm text-text-color">{t('rememberConfirmText')}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmingRemember(false)} className={secondaryButton}>
                {t('cancel')}
              </button>
              <button type="button" onClick={() => setRemembered(true)} disabled={busy} className={`${primaryButton} !bg-orange-500`}>
                {t('rememberConfirmYes')}
              </button>
            </div>
          </div>
        )}
        {!confirmingRemember && <p className="text-sm text-orange-500">{t('rememberWarning')}</p>}
        {remember && !remember.available && <p className="text-sm text-text-secondary">{t('rememberUnavailable')}</p>}
        {message(rememberMsg)}
      </div>

      <div className={section}>
        <h3 className={heading}>{t('newKit')}</h3>
        <p className="text-sm text-text-secondary">{t('newKitWarning')}</p>
        <button type="button" onClick={handleNewKit} disabled={busy} className={secondaryButton}>
          {t('newKitButton')}
        </button>
      </div>

      <form onSubmit={handleDelete} className={section}>
        <h3 className="font-medium text-red-500">{t('deleteProfile')}</h3>
        <p className="text-sm text-text-secondary">{t('deleteProfileWarning')}</p>
        <div>
          <label className={labelClass}>{t('masterPassword')}</label>
          <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className={inputClass} />
        </div>
        {message(deleteMsg)}
        <button type="submit" disabled={busy || !deletePassword} className={`${primaryButton} !bg-red-500`}>
          {t('deleteProfileButton')}
        </button>
      </form>
    </ModalShell>
  );
};

export default SecurityModal;
