import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import EntriesPage from './pages/EntriesPage';
import './App.css';
import TitleBar from './components/TitleBar';

function App() {
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

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

  return (
    <div className={`app ${theme} ${theme === 'alpha-wolf' ? 'bg-alpha-wolf' : ''} flex flex-col h-screen`}> 
      <TitleBar toggleTheme={toggleTheme} currentTheme={theme} /> 
      <div className="flex-1 overflow-hidden">
        {currentPage === 'home' && <HomePage onNavigate={navigateToEntries} />}
        {currentPage === 'entries' && <EntriesPage onBack={navigateToHome} />}
      </div>
    </div>
  );
}

export default App;
