import React, { useState, useEffect } from 'react';
import { Alert, Button, CATEGORIES, Card, Checkbox, IconButton, Select, Slider, TextArea, TextField, Wordmark } from '../components/ui';
import PasswordStrength from '../components/PasswordStrength';
import { generatePassword as makePassword, MIN_LENGTH, MAX_LENGTH, DEFAULT_LENGTH } from '../utils/generatePassword.mjs';
import { useLanguage } from '../context/LanguageContext';

// Add Password, or edit `entry` (which arrives without its password; it's fetched here).
const PasswordForm = ({ entry, onBack, onSaved }) => {
  const { t } = useLanguage();
  const editing = !!entry;
  const [site, setSite] = useState(entry ? entry.site || entry.website || '' : '');
  const [username, setUsername] = useState(entry?.username || '');
  const [category, setCategory] = useState(entry?.category || '');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showNotes, setShowNotes] = useState(!!entry?.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [genLength, setGenLength] = useState(() => Number(localStorage.getItem('generatorLength')) || DEFAULT_LENGTH);
  const [genSymbols, setGenSymbols] = useState(() => localStorage.getItem('generatorSymbols') !== 'false');

  useEffect(() => {
    if (entry) window.electron.getPassword(entry.id).then(setPassword);
  }, [entry]);

  const generatePassword = () => {
    localStorage.setItem('generatorLength', genLength);
    localStorage.setItem('generatorSymbols', genSymbols);
    setPassword(makePassword({ length: genLength, symbols: genSymbols }));
    setShowPassword(true);
  };

  // Editing an entry never counts as a duplicate of itself.
  const checkDuplicate = async () => {
    if (editing || !site || !username) return false;
    try {
      const { isDuplicate } = await window.electron.checkDuplicate(site, username);
      setDuplicateWarning(isDuplicate);
      return isDuplicate;
    } catch (err) {
      console.error('Error checking duplicate:', err);
      return false;
    }
  };

  const handleSubmit = async (e, force = false) => {
    e.preventDefault();
    if (!force && await checkDuplicate()) return;

    setSaving(true);
    setError(null);
    setDuplicateWarning(false);
    try {
      if (editing) {
        await window.electron.updatePassword(entry.id, { site, username, password, category, notes });
        onSaved(entry.id, t('changesSaved'));
      } else {
        const data = { site, username, password };
        if (category) data.category = category;
        if (notes) data.notes = notes;
        const { id } = await window.electron.savePassword(data);
        onSaved(id, t('passwordAdded'));
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const editField = (setter) => (e) => { setter(e.target.value); setDuplicateWarning(false); };

  return (
    <main className="flex-1 min-w-0 overflow-auto" style={{ padding: '20px 20px 32px 0' }}>
      <div className="grid items-center" style={{ gridTemplateColumns: '48px 1fr 48px' }}>
        <IconButton icon="arrow_back" variant="tonal" shape="square" size={48} title={t('back')} onClick={onBack} />
        <Wordmark large center />
      </div>

      <Card as="form" onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ maxWidth: 640, margin: '24px auto 0' }}>
        <h1 className="text-2xl font-bold">{t(editing ? 'editEntry' : 'addPassword')}</h1>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(160px,220px)' }}>
          <TextField label={t('websiteApp')} placeholder={t('enterWebsite')} value={site}
            onChange={editField(setSite)} onBlur={checkDuplicate} required autoFocus={!editing} />
          <Select label={t('category')} value={category} onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map(c => ({ value: c.value, label: t(c.label) }))} />
        </div>

        <TextField label={t('usernameEmail')} placeholder={t('enterUsername')} value={username}
          onChange={editField(setUsername)} onBlur={checkDuplicate} required />

        {duplicateWarning && (
          <Alert tone="warning" action={<Button variant="outline" onClick={(e) => handleSubmit(e, true)}>{t('addAnyway')}</Button>}>
            <div>{t('duplicate')}</div>
            <div className="text-[13px] font-normal mt-0.5">{t('duplicateWarning')}</div>
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-end">
            <TextField style={{ flex: 1 }} label={t('password')} placeholder={t('enterPassword')} mono
              type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
              trailing={<IconButton icon={showPassword ? 'visibility_off' : 'visibility'} title={t(showPassword ? 'hide' : 'show')} onClick={() => setShowPassword(!showPassword)} />} />
            <Button variant="tonal" size="xl" icon="auto_awesome" onClick={generatePassword}>{t('generate')}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-7">
            <Slider label={t('length')} min={MIN_LENGTH} max={MAX_LENGTH} value={genLength} onChange={setGenLength} />
            <Checkbox checked={genSymbols} onChange={setGenSymbols}>{t('symbols')} (!@#$%^&amp;*)</Checkbox>
          </div>
          <PasswordStrength password={password} />
        </div>

        {showNotes
          ? <TextArea label={t('notes')} placeholder={t('notesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} autoFocus={!entry?.notes} />
          : <div><Button variant="ghost" icon="add" style={{ paddingLeft: 4 }} onClick={() => setShowNotes(true)}>{t('notes')} ({t('optional')})</Button></div>}

        {error && <Alert tone="danger">{error}</Alert>}

        <Button type="submit" size="xl" fullWidth disabled={saving || duplicateWarning} style={{ marginTop: 4 }}>
          {saving ? t('saving') : t(editing ? 'saveChanges' : 'addPassword')}
        </Button>
      </Card>
    </main>
  );
};

export default PasswordForm;
