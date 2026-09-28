import React, { useState } from 'react';
import { HiPrinter } from 'react-icons/hi2';
import { inputClass, labelClass } from './NewPasswordFields';
import { useLanguage } from '../context/LanguageContext';

// Same forgiving rules as vault.js: case-insensitive, O reads as 0, I/L as 1.
const normalize = (text) => text.trim().toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');

// Shown after setup and after "Create new recovery kit". The user can't
// continue until they type back the last 4 characters.
const RecoveryKit = ({ code, onDone }) => {
  const { t } = useLanguage();
  const [typed, setTyped] = useState('');
  const confirmed = normalize(typed) === code.slice(-4);

  return (
    <div className="h-full overflow-auto bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-soft p-6 space-y-4">
        {/* Everything in .print-area is what gets printed (see index.css). */}
        <div className="print-area space-y-3">
          <h1 className="text-2xl font-bold font-montserrat text-text-color">KYS · {t('kitTitle')}</h1>
          <p className="text-sm text-text-color">{t('kitIntro')}</p>
          <div className="font-mono text-2xl font-semibold tracking-wider text-center text-text-color p-4 border-2 border-dashed border-border-color rounded-xl select-all">
            {code}
          </div>
          <p className="text-xs text-text-secondary">{t('kitCreated')}: {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-text-color">{t('kitHowTo')}</p>
          <p className="text-sm text-orange-500">{t('kitWarning')}</p>
        </div>

        <p className="text-sm text-text-secondary">{t('kitStore')}</p>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full h-11 bg-input-bg border border-border-color text-text-color rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <HiPrinter size={18} />
          {t('kitPrint')}
        </button>

        <div>
          <label className={labelClass}>{t('kitConfirm')}</label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            maxLength={4}
            spellCheck={false}
            className={`${inputClass} font-mono uppercase tracking-widest text-center`}
          />
        </div>

        <button
          type="button"
          disabled={!confirmed}
          onClick={onDone}
          className="w-full h-11 bg-button text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {t('kitDone')}
        </button>
      </div>
    </div>
  );
};

export default RecoveryKit;
