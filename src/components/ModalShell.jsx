import React, { useEffect } from 'react';
import { IconButton } from './ui';
import { useLanguage } from '../context/LanguageContext';

// Backdrop, panel, title, and close button shared by the app's dialogs.
const ModalShell = ({ title, onClose, children }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 kys-fade-in" style={{ background: 'rgba(20, 18, 16, 0.45)' }} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title}
        className="relative bg-surface rounded-kys-xl shadow-kys-3 w-full max-w-md max-h-[90vh] overflow-auto kys-fade-in" style={{ padding: 28 }}>
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-[22px] font-bold">{title}</h2>
          <IconButton icon="close" title={t('close')} onClick={onClose} style={{ marginRight: -8 }} />
        </div>
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
