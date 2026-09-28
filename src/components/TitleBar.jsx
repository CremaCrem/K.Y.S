import React, { useState, useEffect } from 'react';
import { Icon } from './ui';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fil', name: 'Filipino' },
];

const HEIGHT = 32;
const mac = window.electron.platform === 'darwin';

const BarButton = ({ icon, title, onClick }) => (
  <button type="button" title={title} aria-label={title} onClick={onClick} className="kys-bar-btn no-drag"
    style={{ width: HEIGHT, height: HEIGHT - 4, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--kys-radius-xs)' }}>
    <Icon name={icon} size={18} />
  </button>
);

// Windows 11-style caption button: full bar height, square, icon only.
const CaptionButton = ({ icon, title, onClick, close = false }) => (
  <button type="button" title={title} aria-label={title} onClick={onClick}
    className={`kys-bar-btn no-drag${close ? ' kys-caption-close' : ''}`}
    style={{ width: 46, height: HEIGHT, border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
    <Icon name={icon} size={16} />
  </button>
);

// The frameless window's orange title bar. On macOS the native traffic lights sit
// on its left (main.js); elsewhere it draws Windows caption buttons on the right.
// `profileName` is only passed while unlocked. `themeIcon` / `themeTitle` change
// once a hidden theme is unlocked (see App.js).
const TitleBar = ({ themeIcon, themeTitle, toggleTheme, profileName }) => {
  const { t, language, changeLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [windowState, setWindowState] = useState({ maximized: false, fullScreen: false });
  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => window.electron.onWindowState(setWindowState), []);

  // macOS hides the traffic lights in full screen, so their space goes too.
  const paddingLeft = mac && !windowState.fullScreen ? 80 : 12;

  return (
    <div className="drag flex items-center gap-0.5 flex-shrink-0 relative"
      style={{ height: HEIGHT, paddingLeft, paddingRight: mac ? 6 : 0, background: 'var(--kys-titlebar, var(--kys-primary))', color: 'var(--kys-on-primary)' }}>
      <span style={{ fontFamily: 'var(--kys-font-wordmark)', fontWeight: 800, fontSize: 16 }}>K</span>
      {profileName && <span className="truncate max-w-[240px] ml-2.5 text-[13px] font-medium" style={{ opacity: 0.85 }}>{profileName}</span>}
      <span className="flex-1" />

      <BarButton icon={themeIcon} title={themeTitle} onClick={toggleTheme} />

      <div className="relative no-drag">
        <button type="button" onClick={() => setShowLangMenu(!showLangMenu)} className="kys-bar-btn"
          aria-haspopup="menu" aria-expanded={showLangMenu}
          style={{ height: HEIGHT - 4, display: 'inline-flex', alignItems: 'center', gap: 2, padding: '0 6px 0 10px', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 13, fontWeight: 500, borderRadius: 'var(--kys-radius-xs)' }}>
          {currentLang.name}
          <Icon name="expand_more" size={16} style={{ transform: showLangMenu ? 'rotate(180deg)' : undefined, transition: 'transform var(--kys-dur-fast)' }} />
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

      {!mac && (
        <div className="flex ml-2 self-stretch">
          <CaptionButton icon="remove" title={t('minimize')} onClick={() => window.electron.minimizeWindow()} />
          <CaptionButton icon={windowState.maximized ? 'filter_none' : 'crop_square'} title={t(windowState.maximized ? 'restore' : 'maximize')}
            onClick={() => window.electron.maximizeWindow()} />
          <CaptionButton icon="close" title={t('close')} onClick={() => window.electron.closeWindow()} close />
        </div>
      )}
    </div>
  );
};

export default TitleBar;
