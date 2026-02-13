import React, { useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { HiChevronDown } from 'react-icons/hi2';
import { FiMinus, FiMaximize2, FiX } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
];

const TitleBar = ({ toggleTheme, currentTheme }) => {
  const { language, changeLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const getThemeIcon = () => {
    const darkThemes = ['dark', 'vaporwave', 'alpha-wolf'];
    return darkThemes.includes(currentTheme) ? (
      <FiSun size={14} />
    ) : (
      <FiMoon size={14} />
    );
  };

  return (
    <div className="flex justify-between items-stretch h-10 bg-entryBar pl-3 drag relative">
      {/* Left - App Icon */}
      <div className="flex items-center gap-3">
        <span className="text-white font-bold text-sm no-drag">K</span>
      </div>

      {/* Right - Controls */}
      <div className="flex items-stretch">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors no-drag"
        >
          {getThemeIcon()}
        </button>

        {/* Language Selector */}
        <div className="relative no-drag flex items-stretch">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="px-3 flex items-center gap-1.5 text-white/80 hover:bg-white/10 transition-colors text-xs font-medium"
          >
            <span>{currentLang.flag}</span>
            <span>{currentLang.name}</span>
            <HiChevronDown size={12} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showLangMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowLangMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-card-bg rounded-lg shadow-lg py-1 z-50 min-w-[140px] border border-border-color">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-surface transition-colors ${
                      language === lang.code ? 'text-button font-medium' : 'text-text-color'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Window Controls - Windows style */}
        <div className="flex items-stretch">
          <button 
            onClick={() => window.electron.minimizeWindow()}
            className="w-[46px] flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors no-drag"
            title="Minimize"
          >
            <FiMinus size={16} />
          </button>
          <button 
            onClick={() => window.electron.maximizeWindow()}
            className="w-[46px] flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors no-drag"
            title="Maximize"
          >
            <FiMaximize2 size={14} />
          </button>
          <button 
            onClick={() => window.electron.closeWindow()}
            className="w-[46px] flex items-center justify-center text-white/80 hover:bg-red-600 transition-colors no-drag"
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
