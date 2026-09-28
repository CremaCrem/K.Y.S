import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaCopy, FaCheck, FaStickyNote } from 'react-icons/fa';
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import Modal from './Modal';
import { useLanguage } from '../context/LanguageContext';

// Entries arrive without their password. It's fetched only while revealed or
// being edited, and copying happens in the main process (auto-cleared after 30 s).
const ISSUE_STYLES = {
  weak: 'bg-red-500/15 text-red-500',
  reused: 'bg-orange-500/15 text-orange-500',
  old: 'bg-yellow-500/15 text-yellow-600',
};
const ISSUE_LABELS = { weak: 'weak', reused: 'reusedBadge', old: 'oldBadge' };

const EntryCard = ({ id, site, username, category, notes, issues, compact = false, onDelete, onEdit }) => {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, field, e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyPassword = async (e) => {
    e?.stopPropagation();
    try {
      await window.electron.copyPassword(id);
      setCopiedField('password');
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleReveal = async (e) => {
    e?.stopPropagation();
    setRevealed(revealed === null ? await window.electron.getPassword(id) : null);
  };

  const handleEditClick = async (e) => {
    e?.stopPropagation();
    setEditPassword(await window.electron.getPassword(id));
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditPassword('');
  };

  const handleEditConfirm = (updatedEntry) => {
    setRevealed(null);
    onEdit(updatedEntry);
  };

  const handleDeleteClick = (e) => {
    e?.stopPropagation();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const issueBadges = issues?.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-1">
      {issues.map((issue) => (
        <span key={issue} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ISSUE_STYLES[issue]}`}>
          {t(ISSUE_LABELS[issue])}
        </span>
      ))}
    </div>
  );

  const getCategoryColor = () => {
    const colors = {
      'Games': 'bg-amber-400',
      'Email': 'bg-red-500',
      'Socials': 'bg-cyan-500',
      'Apps': 'bg-purple-500',
      'Bank': 'bg-emerald-500',
      'Shopping': 'bg-pink-500',
      'Work': 'bg-slate-500',
      'Entertainment': 'bg-indigo-500',
    };
    return colors[category] || 'bg-gray-400';
  };

  const getCategoryLabel = () => {
    if (!category) return t('uncategorized');
    return t(category.toLowerCase()) || category;
  };

  // Compact card for grid view
  if (compact) {
    return (
      <>
        <div className="bg-card-bg rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-border-color/50 group">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-lg ${getCategoryColor()} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
                {site.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-text-color text-sm truncate">{site}</h3>
                <p className="text-xs text-text-secondary truncate">{username}</p>
                {issueBadges}
              </div>
            </div>
            {notes && <FaStickyNote className="text-button opacity-50" size={10} />}
          </div>

          {/* Password Row */}
          <div className="flex items-center justify-between bg-surface/50 rounded-lg px-2 py-1.5">
            <span className="text-xs text-text-color font-mono truncate flex-1">
              {revealed ?? '••••••••'}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={toggleReveal}
                className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-text-color hover:bg-border-color/50 transition-colors"
              >
                {revealed !== null ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
              </button>
              <button
                onClick={copyPassword}
                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                  copiedField === 'password' ? 'bg-green-500 text-white' : 'text-text-secondary hover:text-text-color hover:bg-border-color/50'
                }`}
              >
                {copiedField === 'password' ? <FaCheck size={9} /> : <FaCopy size={9} />}
              </button>
            </div>
          </div>

          {/* Actions - Show on hover */}
          <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleEditClick}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500/10 transition-colors"
            >
              <HiOutlinePencilSquare size={14} />
            </button>
            <button 
              onClick={handleDeleteClick}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <HiOutlineTrash size={14} />
            </button>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          onEditConfirm={handleEditConfirm}
          onDeleteConfirm={onDelete}
          isEditMode={isEditMode}
          currentSite={site}     
          currentUsername={username}  
          currentPassword={editPassword}   
          currentCategory={category}
          currentNotes={notes}
        />
      </>
    );
  }

  // Full card for list view
  return (
    <>
      <div className="bg-card-bg rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-border-color/50">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${getCategoryColor()} flex items-center justify-center text-white font-semibold text-sm`}>
              {site.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-text-color text-sm">{site}</h3>
              <p className="text-xs text-text-secondary">{getCategoryLabel()}</p>
              {issueBadges}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {notes && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-button" title={notes}>
                <FaStickyNote size={14} />
              </div>
            )}
            <button 
              onClick={handleEditClick}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500/10 transition-colors"
              title={t('edit')}
            >
              <HiOutlinePencilSquare size={18} />
            </button>
            <button 
              onClick={handleDeleteClick}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
              title={t('delete')}
            >
              <HiOutlineTrash size={18} />
            </button>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-2">
          {/* Username */}
          <div className="flex items-center justify-between py-1.5 px-3 bg-surface/50 rounded-lg">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wide text-text-secondary font-medium">{t('usernameEmail')}</span>
              <p className="text-sm text-text-color truncate">{username}</p>
            </div>
            <button
              onClick={(e) => copyToClipboard(username, 'username', e)}
              className={`ml-2 w-7 h-7 rounded flex items-center justify-center transition-all flex-shrink-0 ${
                copiedField === 'username' ? 'bg-green-500 text-white' : 'text-text-secondary hover:text-text-color hover:bg-border-color/50'
              }`}
            >
              {copiedField === 'username' ? <FaCheck size={11} /> : <FaCopy size={11} />}
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between py-1.5 px-3 bg-surface/50 rounded-lg">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wide text-text-secondary font-medium">{t('password')}</span>
              <p className="text-sm text-text-color font-mono">
                {revealed ?? '••••••••••'}
              </p>
            </div>
            <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
              <button
                onClick={toggleReveal}
                className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:text-text-color hover:bg-border-color/50 transition-colors"
              >
                {revealed !== null ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
              </button>
              <button
                onClick={copyPassword}
                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                  copiedField === 'password' ? 'bg-green-500 text-white' : 'text-text-secondary hover:text-text-color hover:bg-border-color/50'
                }`}
              >
                {copiedField === 'password' ? <FaCheck size={11} /> : <FaCopy size={11} />}
              </button>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="py-1.5 px-3 bg-surface/50 rounded-lg">
              <span className="text-[10px] uppercase tracking-wide text-text-secondary font-medium">{t('notes')}</span>
              <p className="text-sm text-text-color">{notes}</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onEditConfirm={handleEditConfirm}
        onDeleteConfirm={onDelete}
        isEditMode={isEditMode}
        currentSite={site}     
        currentUsername={username}  
        currentPassword={editPassword}   
        currentCategory={category}
        currentNotes={notes}
      />
    </>
  );
};

export default EntryCard;
