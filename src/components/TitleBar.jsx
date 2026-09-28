import React, { useState } from 'react';
import { Icon } from './ui';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fil', name: 'Filipino' },
];

const BarButton = ({ icon, title, onClick, size = 22 }) => (
  <button type="button" title={title} aria-label={title} onClick={onClick} className="kys-bar-btn no-drag"
    style={{ width: 40, height: 40, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--kys-radius-sm)' }}>
    <Icon name={icon} size={size} />
  </button>
);

// The frameless window's orange title bar. `profileName` is only passed while unlocked.
// `themeIcon` / `themeTitle` change once a hidden theme is unlocked (see App.js).
const TitleBar = ({ themeIcon, themeTitle, toggleTheme, profileName }) => {
  const { t, language, changeLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="drag flex items-center gap-1 flex-shrink-0 relative" style={{ height: 52, padding: '0 6px 0 18px', background: 'var(--kys-titlebar, var(--kys-primary))', color: 'var(--kys-on-primary)' }}>
      <span style={{ fontFamily: 'var(--kys-font-wordmark)', fontWeight: 800, fontSize: 20 }}>K</span>
      {profileName && <span className="truncate max-w-[240px] ml-3 text-sm font-medium" style={{ opacity: 0.85 }}>{profileName}</span>}
      <span className="flex-1" />

      <BarButton icon={themeIcon} title={themeTitle} onClick={toggleTheme} />

      <div className="relative no-drag">
        <button type="button" onClick={() => setShowLangMenu(!showLangMenu)} className="kys-bar-btn"
          aria-haspopup="menu" aria-expanded={showLangMenu}
          style={{ height: 40, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 8px 0 12px', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 15, fontWeight: 500, borderRadius: 'var(--kys-radius-sm)' }}>
          {currentLang.name}
          <Icon name="expand_more" size={18} style={{ transform: showLangMenu ? 'rotate(180deg)' : undefined, transition: 'transform var(--kys-dur-fast)' }} />
        </button>
        {showLangMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
            <div role="menu" className="absolute right-0 top-full mt-1 z-50 py-1 min-w-[160px] bg-surface rounded-kys-sm" style={{ boxShadow: 'var(--kys-shadow-2)', border: '1px solid var(--kys-border)' }}>
              {languages.map(lang => (
                <button key={lang.code} type="button" role="menuitem" className="kys-ghost w-full text-left px-4 py-2 text-sm flex items-center justify-between"
                  onClick={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
                  style={{ color: language === lang.code ? 'var(--kys-primary-text)' : 'var(--kys-text)', fontWeight: language === lang.code ? 600 : 400 }}>
                  {lang.name}
                  {language === lang.code && <Icon name="check" size={18} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <span style={{ width: 12 }} />
      <BarButton icon="remove" title={t('minimize')} onClick={() => window.electron.minimizeWindow()} />
      <BarButton icon="open_in_full" title={t('maximize')} size={20} onClick={() => window.electron.maximizeWindow()} />
      <BarButton icon="close" title={t('close')} onClick={() => window.electron.closeWindow()} />
    </div>
  );
};

export default TitleBar;
