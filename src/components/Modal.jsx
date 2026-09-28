import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const Modal = ({ 
  isOpen, 
  onClose, 
  onEditConfirm, 
  onDeleteConfirm, 
  isEditMode, 
  currentSite, 
  currentUsername, 
  currentPassword, 
  currentCategory,
  currentNotes 
}) => {
  const { t } = useLanguage();
  const [newSite, setNewSite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      setNewSite(currentSite || '');
      setNewUsername(currentUsername || '');
      setNewPassword(currentPassword || '');
      setNewCategory(currentCategory || '');
      setNewNotes(currentNotes || '');
      setShowPassword(false);
    }
  }, [isOpen, currentSite, currentUsername, currentPassword, currentCategory, currentNotes]);

  const handleEdit = () => {
    const updatedEntry = {
      site: newSite,
      username: newUsername,
      password: newPassword,
    };
    if (newCategory) updatedEntry.category = newCategory;
    if (newNotes) updatedEntry.notes = newNotes;
    onEditConfirm(updatedEntry);
    onClose();
  };

  const handleDelete = () => {
    onDeleteConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-card-bg rounded-2xl shadow-strong w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-color">
            {isEditMode ? t('editEntry') : t('deleteEntry')}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {isEditMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1.5">{t('site')}</label>
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all text-sm"
                placeholder={t('enterWebsite')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color mb-1.5">{t('usernameEmail')}</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all text-sm"
                placeholder={t('enterUsername')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color mb-1.5">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 bg-surface border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all font-mono text-sm"
                  placeholder={t('enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-color transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color mb-1.5">{t('category')} ({t('optional')})</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border-color rounded-xl text-text-color transition-all appearance-none cursor-pointer text-sm"
              >
                <option value="">-- {t('optional')} --</option>
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color mb-1.5">{t('notes')} ({t('optional')})</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full p-3 bg-surface border border-border-color rounded-xl text-text-color placeholder-text-secondary transition-all resize-none text-sm"
                placeholder={t('notesPlaceholder')}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={onClose}
                className="flex-1 h-10 bg-surface text-text-color rounded-xl font-medium text-sm hover:bg-border-color transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleEdit}
                className="flex-1 h-10 bg-button text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-text-color mb-2">
              {t('confirmDelete')} <strong>{currentSite}</strong>?
            </p>
            <p className="text-text-secondary text-sm mb-6">{t('cannotUndo')}</p>
            
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 h-10 bg-surface text-text-color rounded-xl font-medium text-sm hover:bg-border-color transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 h-10 bg-red-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
