import React, { useState, useEffect, useCallback, useRef } from 'react';
import VaultPage from './pages/VaultPage';
import PasswordForm from './pages/PasswordForm';
import LockScreen from './pages/LockScreen';
import RecoveryKit from './components/RecoveryKit';
import SecurityModal from './components/SecurityModal';
import TitleBar from './components/TitleBar';
import { NavRail, NavItem, Toast } from './components/ui';
import { useLanguage } from './context/LanguageContext';

// Easter eggs: typing a secret into the vault search unlocks a hidden theme for
// good (on this computer). Matched lowercase with spaces removed, so
// "a e s t h e t i c" counts too.
const SECRET_THEMES = [
  { theme: 'pink', name: 'Pink', secret: /^prettyinpink$/ },
  { theme: 'vaporwave', name: 'Vaporwave', secret: /^aesthetic$/ },
  { theme: 'alpha-wolf', name: 'Alpha Wolf', secret: /^awo{2,}$/ },
];
const DARK_THEMES = ['dark', 'vaporwave', 'alpha-wolf'];

// Someone already using a hidden theme (they were free before the redesign) keeps it.
const initialUnlocked = () => {
  let unlocked = [];
  try { unlocked = JSON.parse(localStorage.getItem('unlockedThemes')) || []; } catch {}
  const saved = localStorage.getItem('theme');
  return SECRET_THEMES.some(s => s.theme === saved) && !unlocked.includes(saved) ? [...unlocked, saved] : unlocked;
};

function App() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [unlockedThemes, setUnlockedThemes] = useState(initialUnlocked);
  // { name: 'vault', selectId } or { name: 'form', entry } (entry only when editing).
  const [page, setPage] = useState({ name: 'vault' });
  const [vault, setVault] = useState(null);
  // Kept here, above the lock screen, so an auto-lock can't hide a new code before it's saved.
  const [recoveryCode, setRecoveryCode] = useState(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimer = useRef();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
  }, [unlockedThemes]);

  const toast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // Light → dark → any unlocked hidden themes → light.
  const themes = ['light', 'dark', ...SECRET_THEMES.map(s => s.theme).filter(th => unlockedThemes.includes(th))];
  const nextTheme = () => setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]);

  const trySecret = (text) => {
    const typed = text.toLowerCase().replace(/\s+/g, '');
    const found = SECRET_THEMES.find(s => s.secret.test(typed));
    if (!found || unlockedThemes.includes(found.theme)) return;
    setUnlockedThemes([...unlockedThemes, found.theme]);
    setTheme(found.theme);
    toast(t('themeUnlocked').replace('{name}', found.name));
  };

  const refreshVault = useCallback(() => {
    window.electron.getVaultStatus().then(setVault);
  }, []);

  useEffect(() => {
    refreshVault();
    return window.electron.onVaultLocked(() => {
      setShowSecurity(false);
      setPage({ name: 'vault' });
      refreshVault();
    });
  }, [refreshVault]);

  const unlocked = vault?.status === 'unlocked' && !recoveryCode;

  let content = null;
  if (recoveryCode) {
    content = <RecoveryKit code={recoveryCode} onDone={() => { setRecoveryCode(null); refreshVault(); }} />;
  } else if (vault && !unlocked) {
    content = <LockScreen vault={vault} onUnlocked={refreshVault} onRecoveryCode={setRecoveryCode} />;
  } else if (unlocked) {
    const navActive = showSecurity ? 'security' : page.name === 'form' && !page.entry ? 'add' : 'vault';
    content = (
      <div className="flex h-full">
        <NavRail
          items={[
            { id: 'vault', label: t('vault'), icon: 'shield_lock' },
            { id: 'add', label: t('add'), icon: 'add' },
            { id: 'security', label: t('security'), icon: 'shield' },
          ]}
          active={navActive}
          onChange={(id) => (id === 'security' ? setShowSecurity(true) : setPage({ name: id === 'add' ? 'form' : 'vault' }))}
          footer={<NavItem icon="lock" label={t('lock')} onClick={() => window.electron.lock()} />}
        />
        {page.name === 'form' ? (
          <PasswordForm
            key={page.entry?.id || 'new'}
            entry={page.entry}
            onBack={() => setPage({ name: 'vault', selectId: page.entry?.id })}
            onSaved={(id, message) => { setPage({ name: 'vault', selectId: id }); toast(message); }}
          />
        ) : (
          <VaultPage
            selectId={page.selectId}
            onAdd={() => setPage({ name: 'form' })}
            onEdit={(entry) => setPage({ name: 'form', entry })}
            onSearch={trySecret}
            toast={toast}
          />
        )}
      </div>
    );
  }

  return (
    <div className="kys-app flex flex-col h-screen bg-bg text-ink">
      <TitleBar
        themeIcon={themes.length > 2 ? 'palette' : DARK_THEMES.includes(theme) ? 'light_mode' : 'dark_mode'}
        themeTitle={t(themes.length > 2 ? 'changeTheme' : 'toggleTheme')}
        toggleTheme={nextTheme}
        profileName={unlocked ? vault.profile.name : null}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        {content}
      </div>
      {showSecurity && unlocked && (
        <SecurityModal
          profile={vault.profile}
          onClose={() => setShowSecurity(false)}
          onRecoveryCode={setRecoveryCode}
          onProfileChanged={refreshVault}
        />
      )}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

export default App;
