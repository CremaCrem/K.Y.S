import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';
import NewPasswordFields, { newPasswordError } from './NewPasswordFields';
import { Alert, Button, Checkbox, TextField } from './ui';
import { useLanguage } from '../context/LanguageContext';

const section = 'mt-6 pt-5 border-t border-border flex flex-col gap-3';
const heading = 'text-base font-semibold';

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

  const message = (msg) => msg && <Alert tone={msg[1] ? 'danger' : 'success'}>{t(msg[0])}</Alert>;

  return (
    <ModalShell title={t('security')} onClose={onClose}>
      <form onSubmit={handleRename} className="flex flex-col gap-3">
        <h3 className={heading}>{t('profileSection')}</h3>
        <div className="flex gap-2">
          <TextField value={name} onChange={(e) => setName(e.target.value)} maxLength={30} aria-label={t('profileSection')} style={{ flex: 1 }} />
          <Button type="submit" size="xl" disabled={busy || name.trim() === profile.name}>{t('saveName')}</Button>
        </div>
        {message(nameMsg)}
      </form>

      <form onSubmit={handleChangePassword} className={section}>
        <h3 className={heading}>{t('changePassword')}</h3>
        <TextField label={t('currentPassword')} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <NewPasswordFields
          label={t('newPassword')}
          password={password}
          confirm={confirm}
          setPassword={setPassword}
          setConfirm={setConfirm}
        />
        {message(passwordMsg)}
        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? t('working') : t('changePassword')}
        </Button>
      </form>

      <div className={section}>
        <Checkbox
          checked={!!remember?.remembered || confirmingRemember}
          disabled={!remember?.available || busy}
          onChange={(checked) => (checked ? setConfirmingRemember(true) : setRemembered(false))}
        >
          <span className="block text-[15px] font-semibold text-ink">{t('remember')}</span>
          <span className="block">{t('rememberDesc')}</span>
        </Checkbox>
        {confirmingRemember ? (
          <div ref={(el) => el?.scrollIntoView({ block: 'nearest' })}>
            <Alert tone="warning">
              <p className="font-semibold">{t('rememberConfirmTitle')}</p>
              <p className="font-normal mt-1">{t('rememberConfirmText')}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" style={{ flex: 1 }} onClick={() => setConfirmingRemember(false)}>{t('cancel')}</Button>
                <Button style={{ flex: 1 }} disabled={busy} onClick={() => setRemembered(true)}>{t('rememberConfirmYes')}</Button>
              </div>
            </Alert>
          </div>
        ) : (
          <p className="text-sm text-muted">{t('rememberWarning')}</p>
        )}
        {remember && !remember.available && <p className="text-sm text-muted">{t('rememberUnavailable')}</p>}
        {message(rememberMsg)}
      </div>

      <div className={section}>
        <h3 className={heading}>{t('newKit')}</h3>
        <p className="text-sm text-muted">{t('newKitWarning')}</p>
        <Button variant="outline" size="lg" fullWidth disabled={busy} onClick={handleNewKit}>{t('newKitButton')}</Button>
      </div>

      <form onSubmit={handleDelete} className={section}>
        <h3 className={`${heading} text-danger`}>{t('deleteProfile')}</h3>
        <p className="text-sm text-muted">{t('deleteProfileWarning')}</p>
        <TextField label={t('masterPassword')} type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
        {message(deleteMsg)}
        <Button type="submit" variant="danger" size="lg" icon="delete" fullWidth disabled={busy || !deletePassword}>
          {t('deleteProfileButton')}
        </Button>
      </form>
    </ModalShell>
  );
};

export default SecurityModal;
