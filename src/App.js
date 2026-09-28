import React, { useState, useEffect, useCallback } from 'react';
import HomePage from './pages/HomePage';
import EntriesPage from './pages/EntriesPage';
import LockScreen from './pages/LockScreen';
import RecoveryKit from './components/RecoveryKit';
import SecurityModal from './components/SecurityModal';
import './App.css';
import TitleBar from './components/TitleBar';

function App() {
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState('home');
  const [vault, setVault] = useState(null);
  // Kept here, above the lock screen, so an auto-lock can't hide a new code before it's saved.
  const [recoveryCode, setRecoveryCode] = useState(null);
  const [showSecurity, setShowSecurity] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const refreshVault = useCallback(() => {
    window.electron.getVaultStatus().then(setVault);
  }, []);

  useEffect(() => {
    refreshVault();
    return window.electron.onVaultLocked(() => {
      setShowSecurity(false);
      refreshVault();
    });
  }, [refreshVault]);

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'pink', 'vaporwave', 'alpha-wolf'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  const navigateToEntries = () => {
    setCurrentPage('entries');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const unlocked = vault?.status === 'unlocked' && !recoveryCode;

  let content = null;
  if (recoveryCode) {
    content = <RecoveryKit code={recoveryCode} onDone={() => { setRecoveryCode(null); refreshVault(); }} />;
  } else if (vault && !unlocked) {
    content = <LockScreen vault={vault} onUnlocked={refreshVault} onRecoveryCode={setRecoveryCode} />;
  } else if (unlocked) {
    content = currentPage === 'home'
      ? <HomePage onNavigate={navigateToEntries} />
      : <EntriesPage onBack={navigateToHome} />;
  }

  return (
    <div className={`app ${theme} ${theme === 'alpha-wolf' ? 'bg-alpha-wolf' : ''} flex flex-col h-screen`}>
      <TitleBar
        toggleTheme={toggleTheme}
        currentTheme={theme}
        onLock={unlocked ? () => window.electron.lock() : null}
        onSecurity={unlocked ? () => setShowSecurity(true) : null}
      />
      <div className="flex-1 overflow-hidden">
        {content}
      </div>
      {showSecurity && unlocked && (
        <SecurityModal onClose={() => setShowSecurity(false)} onRecoveryCode={setRecoveryCode} />
      )}
    </div>
  );
}

export default App;
