import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert, Button, CATEGORIES, CategoryIcon, FilterChip, Icon, IconButton, ISSUE_LABELS,
  PasswordRow, SearchField, SecretField, StatCard, Wordmark, categoryOf,
} from '../components/ui';
import ModalShell from '../components/ModalShell';
import ExportModal from '../components/ExportModal';
import ImportModal from '../components/ImportModal';
import { useLanguage } from '../context/LanguageContext';

// Entries arrive without their password. It's fetched only while revealed,
// and copying happens in the main process (auto-cleared after 30 s).
// `onSearch` sees every search keystroke (App.js checks it for hidden-theme secrets).
const VaultPage = ({ selectId, onAdd, onEdit, onSearch, toast }) => {
  const { t } = useLanguage();
  const [passwords, setPasswords] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(''); // '', 'fav', or a category value
  const [healthFilter, setHealthFilter] = useState(''); // '', 'weak', 'reused', or 'old'
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('sortBy') || 'name');
  const [selectedId, setSelectedId] = useState(selectId);
  const [revealed, setRevealed] = useState(null); // { id, value }
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [importStart, setImportStart] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [passwordsData, statsData] = await Promise.all([
        window.electron.getPasswords(),
        window.electron.getStats(),
      ]);
      setPasswords(passwordsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setPasswords([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    try {
      await window.electron.deletePassword(id);
      setPasswords(prev => prev.filter(p => p.id !== id));
      setStats(await window.electron.getStats());
      setConfirmingDelete(false);
      toast(t('itemDeleted'));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleFavorite = async (id, favorite) => {
    try {
      await window.electron.setFavorite(id, favorite);
      setPasswords(prev => prev.map(p => p.id === id ? { ...p, favorite } : p));
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  const copyPassword = async (id) => {
    await window.electron.copyPassword(id);
    toast(t('passwordCopied'));
  };

  const copyUsername = async (username) => {
    await navigator.clipboard.writeText(username);
    toast(t('usernameCopied'));
  };

  const toggleReveal = async (id) => {
    setRevealed(revealed?.id === id ? null : { id, value: await window.electron.getPassword(id) });
  };

  const changeSort = (value) => {
    setSortBy(value);
    localStorage.setItem('sortBy', value);
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

  if (!passwords) return <main className="flex-1" />;

  const getSiteName = (entry) => entry.site || entry.website || '';
  const search = searchTerm.trim().toLowerCase();

  const filtered = passwords.filter(p =>
    (!search || getSiteName(p).toLowerCase().includes(search) || p.username?.toLowerCase().includes(search)) &&
    (!filter || (filter === 'fav' ? p.favorite : p.category === filter)) &&
    (!healthFilter || stats?.issues[p.id]?.includes(healthFilter))
  );

  // Favorites first, then the chosen order. Dates are ISO strings, so they compare as text.
  const sorts = {
    name: (a, b) => getSiteName(a).localeCompare(getSiteName(b), undefined, { sensitivity: 'base' }),
    newest: (a, b) => (b.importedAt || b.createdAt || '').localeCompare(a.importedAt || a.createdAt || ''),
    changed: (a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''),
  };
  filtered.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || (sorts[sortBy] || sorts.name)(a, b));

  // Filter chips show only the categories that have entries.
  const chips = [
    { id: '', label: t('all'), icon: 'apps' },
    { id: 'fav', label: t('favorites'), icon: 'star', color: 'var(--kys-favorite)' },
    ...CATEGORIES.filter(c => passwords.some(p => p.category === c.value))
      .map(c => ({ id: c.value, label: t(c.label), icon: c.icon, color: c.color })),
  ];

  const sel = filtered.find(p => p.id === selectedId) || filtered[0];
  const selIssues = sel && (stats?.issues[sel.id] || []);
  const shownPassword = sel && revealed?.id === sel.id ? revealed.value : null;
  const categoryLabel = (entry) => entry.category ? t(categoryOf(entry.category).label) : t('uncategorized');
  const formatDate = (iso) => iso && new Date(iso).toLocaleDateString();

  return (
    <main className="flex-1 min-w-0 flex flex-col gap-4" style={{ padding: '20px 20px 14px 0' }}>
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {importStart && <ImportModal start={importStart} onClose={() => setImportStart(null)} onImported={fetchData} />}
      {confirmingDelete && sel && (
        <ModalShell title={t('deleteEntry')} onClose={() => setConfirmingDelete(false)}>
          <p className="text-ink mb-1">{t('confirmDelete')} <strong>{getSiteName(sel)}</strong>?</p>
          <p className="text-muted text-sm mb-6">{t('cannotUndo')}</p>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" fullWidth style={{ flex: 1 }} onClick={() => setConfirmingDelete(false)}>{t('cancel')}</Button>
            <Button variant="danger" size="lg" icon="delete" fullWidth style={{ flex: 1 }} onClick={() => handleDelete(sel.id)}>{t('delete')}</Button>
          </div>
        </ModalShell>
      )}

      <header className="flex items-center gap-3 pl-1">
        <Wordmark />
        <SearchField
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); onSearch(e.target.value); }}
          onClear={() => setSearchTerm('')}
          placeholder={t('search')}
          style={{ flex: 1, maxWidth: 560, marginLeft: 'auto' }}
        />
        <IconButton icon="download" variant="tonal" shape="square" size={48} title={t('import')} onClick={handleImport} />
        <IconButton icon="upload" variant="tonal" shape="square" size={48} title={t('export')} onClick={() => setShowExport(true)} />
        <Button icon="add" size="lg" onClick={onAdd}>{t('addPassword')}</Button>
      </header>

      {/* Password health: each tile filters the list to the entries with that issue */}
      {stats && (
        <div className="flex gap-3 pl-1">
          {[
            { id: '', value: stats.total, label: t('totalPasswords'), tone: 'primary' },
            { id: 'weak', value: stats.weak, label: t('weakPasswords'), tone: 'danger' },
            { id: 'reused', value: stats.reused, label: t('reusedPasswords'), tone: 'primary' },
            { id: 'old', value: stats.old, label: t('oldPasswords'), tone: 'warning' },
          ].map(tile => (
            <StatCard key={tile.id || 'total'} {...tile} selected={!!tile.id && healthFilter === tile.id}
              onClick={() => setHealthFilter(healthFilter === tile.id ? '' : tile.id)} />
          ))}
        </div>
      )}
      {healthFilter && <div className="pl-1"><Alert tone="info">{t(`${healthFilter}Hint`)}</Alert></div>}

      <div className="flex items-center gap-2 pl-1 min-w-0">
        <div className="flex gap-2 overflow-x-auto min-w-0 pb-0.5">
          {chips.map(c => <FilterChip key={c.id || 'all'} {...c} selected={filter === c.id} onClick={() => setFilter(c.id)} />)}
        </div>
        <label className="kys-ghost ml-auto flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full text-muted text-sm font-medium flex-shrink-0 cursor-pointer">
          <Icon name="swap_vert" size={18} />
          <select value={sortBy} onChange={(e) => changeSort(e.target.value)} aria-label={t('sortBy')}
            className="bg-transparent outline-none cursor-pointer text-muted">
            <option value="name">{t('sortName')}</option>
            <option value="newest">{t('sortNewest')}</option>
            <option value="changed">{t('sortChanged')}</option>
          </select>
        </label>
      </div>

      <div className="flex-1 min-h-0 grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(280px,360px)' }}>
        <section className="bg-surface rounded-kys-xl overflow-auto p-2.5">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2.5 text-muted">
              <Icon name="search_off" size={40} color="var(--kys-primary)" />
              {t(healthFilter ? 'noIssues' : 'noPasswords')}
            </div>
          ) : filtered.map(entry => (
            <PasswordRow
              key={entry.id}
              name={getSiteName(entry)}
              username={entry.username}
              category={entry.category}
              favorite={!!entry.favorite}
              issues={stats?.issues[entry.id]}
              selected={entry.id === sel?.id}
              onClick={() => { setSelectedId(entry.id); setRevealed(null); }}
              onCopy={() => copyPassword(entry.id)}
            />
          ))}
        </section>

        <aside className="bg-surface rounded-kys-xl overflow-auto flex flex-col gap-5" style={{ padding: '24px 20px 20px' }}>
          {sel && <>
            <div className="flex flex-col items-center gap-3 text-center">
              <CategoryIcon category={sel.category} size={72} />
              <div className="min-w-0 w-full">
                <div className="text-[22px] font-semibold break-words">{getSiteName(sel)}</div>
                <div className="text-sm text-muted">{categoryLabel(sel)}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <SecretField label={t('usernameEmail')} value={sel.username} onCopy={() => copyUsername(sel.username)} />
              <SecretField label={t('password')} value={shownPassword} secret shown={shownPassword !== null}
                onToggle={() => toggleReveal(sel.id)} onCopy={() => copyPassword(sel.id)} />
              {sel.notes && <SecretField label={t('notes')} value={sel.notes} multiline />}
              {selIssues.map(issue => (
                <Alert key={issue} tone={issue === 'old' ? 'warning' : 'danger'}>
                  <div>{t(ISSUE_LABELS[issue])}</div>
                  <div className="text-[13px] font-normal mt-0.5">{t(`${issue}Hint`)}</div>
                </Alert>
              ))}
            </div>

            <div className="flex justify-between gap-3 text-[13px] text-muted">
              <span>{sel.createdAt && `${t('added')} ${formatDate(sel.createdAt)}`}</span>
              <span>{sel.updatedAt && `${t('updated')} ${formatDate(sel.updatedAt)}`}</span>
            </div>

            <div className="mt-auto flex gap-2">
              <Button size="lg" icon="edit" style={{ flex: 1 }} onClick={() => onEdit(sel)}>{t('edit')}</Button>
              <IconButton icon="star" variant="outline" size={48} fill={!!sel.favorite}
                color={sel.favorite ? 'var(--kys-favorite)' : undefined}
                title={t(sel.favorite ? 'removeFavorite' : 'addFavorite')}
                onClick={() => handleFavorite(sel.id, !sel.favorite)} />
              <IconButton icon="delete" variant="outline" size={48} color="var(--kys-danger)" title={t('delete')}
                onClick={() => setConfirmingDelete(true)} />
            </div>
          </>}
        </aside>
      </div>

      <div className="flex items-center gap-2 pl-1 text-[13px] text-muted">
        <span className="w-2 h-2 rounded-full bg-success" />{t('offlineNote')}
      </div>
    </main>
  );
};

export default VaultPage;
