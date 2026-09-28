import React, { useState } from 'react';
import ProfileAvatar from '../components/ProfileAvatar';
import NewPasswordFields, { newPasswordError } from '../components/NewPasswordFields';
import { Alert, Button, Card, Icon, TextField, Wordmark } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';

// "Who's using KYS?": one card per person on this computer, like Netflix.
// Picking a card opens that person's lock screen; "Add person" creates a
// profile with its own master password (and recovery kit) in one step.
const ProfilePicker = ({ profiles, onPicked, onRecoveryCode }) => {
  const { t } = useLanguage();
  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const pick = async (id) => {
    await window.electron.selectProfile(id);
    onPicked();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('nameInvalid');
    const passwordError = newPasswordError(password, confirm);
    if (passwordError) return setError(passwordError);
    setBusy(true);
    setError(null);
    try {
      const result = await window.electron.createProfile(name, password);
      if (result.ok) onRecoveryCode(result.recoveryCode);
      else setError(result.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const header = <div className="mb-8"><Wordmark large center /></div>;

  if (adding) {
    return (
      <div className="h-full overflow-auto flex flex-col items-center justify-center p-6">
        {header}
        <Card as="form" onSubmit={handleCreate} className="w-full max-w-[440px] flex flex-col gap-4">
          <h1 className="text-[22px] font-bold">{t(profiles.length ? 'newProfile' : 'welcomeTitle')}</h1>
          <p className="text-sm text-muted">{t('welcomeIntro')}</p>
          <TextField label={t('profileName')} value={name} onChange={(e) => setName(e.target.value)}
            maxLength={30} placeholder={t('profileNamePlaceholder')} autoFocus />
          <NewPasswordFields
            label={t('masterPassword')}
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
          />
          {error && <Alert tone="danger">{t(error)}</Alert>}
          <Button type="submit" size="xl" fullWidth disabled={busy} style={{ marginTop: 4 }}>
            {busy ? t('working') : t('createProfile')}
          </Button>
          {profiles.length > 0 && (
            <Button variant="ghost" style={{ color: 'var(--kys-text-muted)', alignSelf: 'center' }}
              onClick={() => { setAdding(false); setError(null); }}>
              {t('back')}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const tile = 'rounded-[31px] ring-4 ring-transparent group-hover:ring-primary group-focus-visible:ring-primary transition-shadow';

  return (
    <div className="h-full overflow-auto flex flex-col items-center justify-center p-6">
      {header}
      <h1 className="text-[22px] font-bold mb-8">{t('whoIsUsing')}</h1>
      <div className="flex flex-wrap justify-center gap-8 max-w-3xl">
        {profiles.map((profile) => (
          <button key={profile.id} type="button" onClick={() => pick(profile.id)} className="group flex flex-col items-center gap-3 w-28 outline-none">
            <div className={tile}><ProfileAvatar profile={profile} /></div>
            <span className="text-[15px] font-medium text-muted group-hover:text-ink truncate w-full text-center">{profile.name}</span>
          </button>
        ))}
        <button type="button" onClick={() => setAdding(true)} className="group flex flex-col items-center gap-3 w-28 outline-none">
          <div className={`${tile} w-24 h-24 border-2 border-dashed border-border-strong flex items-center justify-center text-muted group-hover:text-primary-text`}>
            <Icon name="add" size={40} />
          </div>
          <span className="text-[15px] font-medium text-muted group-hover:text-ink">{t('addPerson')}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePicker;
