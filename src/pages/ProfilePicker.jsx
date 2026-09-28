import React, { useState } from 'react';
import { HiPlus } from 'react-icons/hi2';
import ProfileAvatar from '../components/ProfileAvatar';
import NewPasswordFields, { inputClass, labelClass, newPasswordError } from '../components/NewPasswordFields';
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

  const header = (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold font-montserrat text-text-color tracking-tight">{t('appName')}</h1>
      <p className="text-text-secondary mt-1 text-sm font-medium">{t('tagline')}</p>
    </div>
  );

  if (adding) {
    return (
      <div className="h-full overflow-auto bg-background flex flex-col items-center justify-center p-6">
        {header}
        <form onSubmit={handleCreate} className="w-full max-w-sm bg-surface rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="text-xl font-semibold text-text-color">{t(profiles.length ? 'newProfile' : 'welcomeTitle')}</h2>
          <p className="text-sm text-text-secondary">{t('welcomeIntro')}</p>
          <div>
            <label className={labelClass}>{t('profileName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder={t('profileNamePlaceholder')}
              className={inputClass}
              autoFocus
            />
          </div>
          <NewPasswordFields
            label={t('masterPassword')}
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
          />
          {error && <p className="text-sm text-red-500">{t(error)}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 bg-button text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {busy ? t('working') : t('createProfile')}
          </button>
          {profiles.length > 0 && (
            <button type="button" onClick={() => { setAdding(false); setError(null); }} className="w-full text-sm text-text-secondary hover:underline">
              {t('back')}
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background flex flex-col items-center justify-center p-6">
      {header}
      <h2 className="text-2xl font-semibold text-text-color mb-6">{t('whoIsUsing')}</h2>
      <div className="flex flex-wrap justify-center gap-6 max-w-3xl">
        {profiles.map((profile) => (
          <button key={profile.id} onClick={() => pick(profile.id)} className="group flex flex-col items-center gap-2 w-28">
            <div className="rounded-2xl ring-4 ring-transparent group-hover:ring-button transition-all">
              <ProfileAvatar profile={profile} />
            </div>
            <span className="text-sm text-text-secondary group-hover:text-text-color truncate w-full text-center">{profile.name}</span>
          </button>
        ))}
        <button onClick={() => setAdding(true)} className="group flex flex-col items-center gap-2 w-28">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border-color group-hover:border-button flex items-center justify-center text-text-secondary group-hover:text-button transition-all">
            <HiPlus size={36} />
          </div>
          <span className="text-sm text-text-secondary group-hover:text-text-color">{t('addPerson')}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePicker;
