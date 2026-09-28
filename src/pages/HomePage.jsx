import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import { HiSparkles, HiKey } from 'react-icons/hi2';
import SuccessAnimation from '../components/SuccessAnimation';
import PasswordStrength from '../components/PasswordStrength';
import { generatePassword as makePassword, MIN_LENGTH, MAX_LENGTH, DEFAULT_LENGTH } from '../utils/generatePassword.mjs';
import { useLanguage } from '../context/LanguageContext';

const HomePage = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [category, setCategory] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [genLength, setGenLength] = useState(() => Number(localStorage.getItem('generatorLength')) || DEFAULT_LENGTH);
  const [genSymbols, setGenSymbols] = useState(() => localStorage.getItem('generatorSymbols') !== 'false');

  const categories = [
    { value: 'Games', label: t('games') },
    { value: 'Email', label: t('email') },
    { value: 'Socials', label: t('socials') },
    { value: 'Apps', label: t('apps') },
    { value: 'Bank', label: t('bank') },
    { value: 'Shopping', label: t('shopping') },
    { value: 'Work', label: t('work') },
    { value: 'Entertainment', label: t('entertainment') },
  ];

  const generatePassword = () => {
    localStorage.setItem('generatorLength', genLength);
    localStorage.setItem('generatorSymbols', genSymbols);
    setPassword(makePassword({ length: genLength, symbols: genSymbols }));
    setShowPassword(true);
  };

  const checkDuplicate = async () => {
    if (site && username) {
      try {
        const result = await window.electron.checkDuplicate(site, username);
        if (result.isDuplicate) {
          setDuplicateWarning(result.existing);
          return true;
        }
      } catch (err) {
        console.error('Error checking duplicate:', err);
      }
    }
    setDuplicateWarning(null);
    return false;
  };

  const handleSubmit = async (e, force = false) => {
    e.preventDefault();
    
    if (!force) {
      const isDuplicate = await checkDuplicate();
      if (isDuplicate) return;
    }
    
    setSaving(true);
    setDuplicateWarning(null);
    
    try {
      const passwordData = { site, username, password };
      if (category) passwordData.category = category;
      if (notes) passwordData.notes = notes;
      
      await window.electron.savePassword(passwordData);
      setShowSuccess(true);
      setSite('');
      setUsername('');
      setCategory('');
      setPassword('');
      setNotes('');
      setShowPassword(false);
      setShowNotes(false);
    } catch (error) {
      console.error('Failed to save password:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <SuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
      
      <div className="flex-1 overflow-auto px-6 py-4 flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold font-montserrat text-text-color tracking-tight">{t('appName')}</h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">{t('tagline')}</p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-lg mx-auto bg-surface rounded-2xl shadow-soft p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold text-text-color mb-5">{t('addPassword')}</h2>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
            {/* Site & Category Row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-color mb-1.5">
                  {t('websiteApp')}
                </label>
                <input
                  type="text"
                  value={site}
                  onChange={(e) => { setSite(e.target.value); setDuplicateWarning(null); }}
                  onBlur={checkDuplicate}
                  required
                  className="w-full h-11 px-4 bg-input-bg border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all"
                  placeholder={t('enterWebsite')}
                />
              </div>
              
              <div className="w-32">
                <label className="block text-sm font-medium text-text-color mb-1.5">
                  {t('category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-2 bg-input-bg border border-border-color rounded-xl text-text-color transition-all appearance-none cursor-pointer text-sm"
                >
                  <option value="">--</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-text-color mb-1.5">
                {t('usernameEmail')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setDuplicateWarning(null); }}
                onBlur={checkDuplicate}
                required
                className="w-full h-11 px-4 bg-input-bg border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all"
                placeholder={t('enterUsername')}
              />
            </div>

            {/* Duplicate Warning */}
            {duplicateWarning && (
              <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <FaExclamationTriangle className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{t('duplicate')}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{t('duplicateWarning')}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                >
                  {t('addAnyway')}
                </button>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-color mb-1.5">
                {t('password')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 px-4 pr-10 bg-input-bg border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all"
                    placeholder={t('enterPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-color transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="h-11 px-4 bg-button text-white rounded-xl font-medium text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <HiSparkles size={14} />
                  {t('generate')}
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                <label className="flex items-center gap-2">
                  {t('length')}
                  <input
                    type="range"
                    min={MIN_LENGTH}
                    max={MAX_LENGTH}
                    value={genLength}
                    onChange={(e) => setGenLength(Number(e.target.value))}
                    className="w-28 accent-button cursor-pointer"
                  />
                  <span className="w-5 font-mono text-text-color">{genLength}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genSymbols}
                    onChange={(e) => setGenSymbols(e.target.checked)}
                    className="accent-button cursor-pointer"
                  />
                  {t('symbols')} (!@#$%^&amp;*)
                </label>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Notes Toggle & Field */}
            <div>
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-sm text-button hover:underline"
              >
                {showNotes ? '− ' : '+ '}{t('notes')} ({t('optional')})
              </button>
              {showNotes && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-2 p-3 bg-input-bg border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all resize-none text-sm"
                  placeholder={t('notesPlaceholder')}
                  rows={2}
                />
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1 min-h-2" />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || duplicateWarning}
              className="w-full h-12 bg-button text-white rounded-xl font-semibold text-base hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? t('saving') : t('addPassword')}
            </button>
          </form>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 px-6 py-3 bg-background border-t border-border-color/20">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <button className="flex items-center gap-2 text-text-secondary hover:text-text-color transition-colors text-sm">
            <FaQuestionCircle size={16} />
            {t('help')}
          </button>
          
          <button 
            onClick={onNavigate}
            className="w-12 h-12 rounded-2xl bg-button flex items-center justify-center text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            title="View saved passwords"
          >
            <HiKey size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
