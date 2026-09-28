import React, { useState, useEffect, useCallback } from 'react';
import { HiArrowLeft, HiArrowDownTray, HiArrowUpTray } from 'react-icons/hi2';
import { FaGamepad, FaEnvelope, FaGlobe, FaDesktop, FaUniversity, FaShoppingCart, FaBriefcase, FaFilm, FaSearch, FaTh, FaList } from 'react-icons/fa';
import EntryCard from '../components/EntryCard';
import SuccessAnimation from '../components/SuccessAnimation';
import ExportModal from '../components/ExportModal';
import ImportModal from '../components/ImportModal';
import { useLanguage } from '../context/LanguageContext';

const EntriesPage = ({ onBack }) => {
  const { t } = useLanguage();
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [stats, setStats] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [importStart, setImportStart] = useState(null);
  const [healthFilter, setHealthFilter] = useState(''); // '', 'weak', 'reused', or 'old'

  const categories = [
    { id: 'Games', icon: FaGamepad, color: 'bg-amber-400' },
    { id: 'Email', icon: FaEnvelope, color: 'bg-red-500' },
    { id: 'Socials', icon: FaGlobe, color: 'bg-cyan-500' },
    { id: 'Apps', icon: FaDesktop, color: 'bg-purple-500' },
    { id: 'Bank', icon: FaUniversity, color: 'bg-emerald-500' },
    { id: 'Shopping', icon: FaShoppingCart, color: 'bg-pink-500' },
    { id: 'Work', icon: FaBriefcase, color: 'bg-slate-500' },
    { id: 'Entertainment', icon: FaFilm, color: 'bg-indigo-500' },
  ];

  const fetchData = useCallback(async () => {
    try {
      const [passwordsData, statsData] = await Promise.all([
        window.electron.getPasswords(),
        window.electron.getStats()
      ]);
      setPasswords(passwordsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = async (id, updatedEntry) => {
    try {
      await window.electron.updatePassword(id, updatedEntry);
      // The list never holds passwords; only the other fields are merged back.
      const { password, ...shown } = updatedEntry;
      setPasswords(prev => prev.map(p => p.id === id ? { ...p, ...shown } : p));
      setStats(await window.electron.getStats());
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await window.electron.deletePassword(id);
      setPasswords(prev => prev.filter(p => p.id !== id));
      setShowSuccess(true);
      // Update stats
      const newStats = await window.electron.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleImport = async () => {
    try {
      const result = await window.electron.importPasswords();
      if (result.cancelled) return;
      if (result.ok) fetchData();
      setImportStart(result);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const getSiteName = (entry) => entry.site || entry.website || '';

  const filteredPasswords = passwords.filter(password => {
    const siteName = getSiteName(password);
    const matchesSearch = 
      siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? password.category === selectedCategory : true;
    const matchesHealth = !healthFilter || stats?.issues[password.id]?.includes(healthFilter);
    return matchesSearch && matchesCategory && matchesHealth;
  });

  // Group passwords by category for grid view
  const groupedPasswords = filteredPasswords.reduce((acc, password) => {
    const cat = password.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(password);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-text-secondary">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <SuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {importStart && <ImportModal start={importStart} onClose={() => setImportStart(null)} onImported={fetchData} />}
      
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text-color hover:bg-border-color transition-colors"
          >
            <HiArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold font-montserrat text-text-color">{t('appName')}</h1>
            <p className="text-text-secondary text-xs font-medium">{t('tagline')}</p>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={handleImport}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text-color hover:bg-border-color transition-colors"
              title={t('import')}
            >
              <HiArrowUpTray size={16} />
            </button>
            <button 
              onClick={() => setShowExport(true)}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text-color hover:bg-border-color transition-colors"
              title={t('export')}
            >
              <HiArrowDownTray size={16} />
            </button>
          </div>
        </div>

        {/* Password health: each tile filters the list to the entries with that issue */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { id: '', value: stats.total, label: t('totalPasswords'), color: 'text-button' },
              { id: 'weak', value: stats.weak, label: t('weakPasswords'), color: 'text-red-500' },
              { id: 'reused', value: stats.reused, label: t('reusedPasswords'), color: 'text-orange-500' },
              { id: 'old', value: stats.old, label: t('oldPasswords'), color: 'text-yellow-500' },
            ].map((tile) => (
              <button
                key={tile.id || 'total'}
                onClick={() => setHealthFilter(healthFilter === tile.id ? '' : tile.id)}
                className={`bg-surface rounded-xl p-3 text-center transition-all hover:bg-border-color/40 ${
                  tile.id && healthFilter === tile.id ? 'ring-2 ring-button' : ''
                }`}
              >
                <p className={`text-2xl font-bold ${tile.color}`}>{tile.value}</p>
                <p className="text-xs text-text-secondary">{tile.label}</p>
              </button>
            ))}
          </div>
        )}
        {healthFilter && <p className="text-xs text-text-secondary -mt-2 mb-3 px-1">{t(`${healthFilter}Hint`)}</p>}

        {/* Search & Controls */}
        <div className="bg-entryBar rounded-xl p-2 flex items-center gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex items-center gap-1">
            {categories.slice(0, 5).map(({ id, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(selectedCategory === id ? '' : id)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${color} ${
                  selectedCategory === id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title={t(id.toLowerCase())}
              >
                <Icon className="text-white" size={16} />
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2 h-9 rounded-lg text-white text-xs font-medium transition-all ${
                !selectedCategory ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              All
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'bg-white text-gray-800' : 'text-white hover:bg-white/10'
              }`}
            >
              <FaTh size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'bg-white text-gray-800' : 'text-white hover:bg-white/10'
              }`}
            >
              <FaList size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {filteredPasswords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <p className="text-sm">{healthFilter ? t('noIssues') : t('noPasswords')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View - Grouped by Category */
          <div className="space-y-6 pt-4">
            {Object.entries(groupedPasswords).map(([category, items]) => {
              const catConfig = categories.find(c => c.id === category) || { icon: FaDesktop, color: 'bg-gray-400' };
              const CatIcon = catConfig.icon;
              
              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${catConfig.color} flex items-center justify-center`}>
                      <CatIcon className="text-white" size={14} />
                    </div>
                    <h3 className="font-semibold text-text-color">{t(category.toLowerCase()) || category}</h3>
                    <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded-full">{items.length}</span>
                  </div>
                  
                  {/* Grid of Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {items.map((entry) => (
                      <EntryCard 
                        key={entry.id}
                        id={entry.id}
                        site={getSiteName(entry)}
                        username={entry.username} 
                        category={entry.category} 
                        notes={entry.notes}
                        issues={stats?.issues[entry.id]}
                        compact={true}
                        onEdit={(updatedEntry) => handleEdit(entry.id, updatedEntry)} 
                        onDelete={() => handleDelete(entry.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2 pt-4">
            {filteredPasswords.map((entry) => (
              <EntryCard 
                key={entry.id}
                id={entry.id}
                site={getSiteName(entry)}
                username={entry.username} 
                category={entry.category} 
                notes={entry.notes}
                issues={stats?.issues[entry.id]}
                compact={false}
                onEdit={(updatedEntry) => handleEdit(entry.id, updatedEntry)} 
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntriesPage;
