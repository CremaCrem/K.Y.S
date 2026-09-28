function VaultScreen({ items, setItems, onAdd, toast }) {
  const { SearchField, Button, FilterChip, PasswordRow, SecretField, Alert, IconButton, CategoryIcon, CATEGORIES, Icon } = window.KYS_NS;
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [sort, setSort] = React.useState('name');
  const [selId, setSelId] = React.useState(items[0] && items[0].id);

  const present = Object.keys(CATEGORIES).filter(k => items.some(i => i.category === k));
  const chips = [['all', 'All', 'apps', 'var(--kys-neutral-700)'], ['fav', 'Favorites', 'star', 'var(--kys-favorite)'],
    ...present.map(k => [k, CATEGORIES[k].label, CATEGORIES[k].icon, CATEGORIES[k].color])];
  const s = q.trim().toLowerCase();
  const list = items
    .filter(i => filter === 'all' || (filter === 'fav' ? i.favorite : i.category === filter))
    .filter(i => !s || [i.name, i.username, i.url].some(v => v.toLowerCase().includes(s)))
    .sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => b.ts - a.ts);
  const sel = items.find(i => i.id === selId);
  const copy = (v, what) => { try { navigator.clipboard.writeText(v); } catch (e) {} toast(what + ' copied'); };

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 20px 16px 0' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', paddingLeft: 4 }}>
        <div>
          <div style={{ font: '800 26px/1.1 var(--kys-font-wordmark)' }}>K.Y.S</div>
          <div style={{ fontSize: 13, color: 'var(--kys-text-muted)' }}>Keep Yourself Safe</div>
        </div>
        <SearchField value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} style={{ flex: 1, minWidth: 220, maxWidth: 560, marginLeft: 'auto' }} />
        <Button icon="add" size="lg" onClick={onAdd}>Add password</Button>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 4 }}>
        {chips.map(([k, l, ic, c]) => <FilterChip key={k} label={l} icon={ic} color={c} selected={filter === k} onClick={() => setFilter(k)} />)}
        <Button variant="ghost" icon="swap_vert" style={{ marginLeft: 'auto', color: 'var(--kys-text-muted)' }} onClick={() => setSort(sort === 'name' ? 'recent' : 'name')}>{sort === 'name' ? 'Name A–Z' : 'Recent'}</Button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,360px)', gap: 20 }}>
        <section style={{ background: 'var(--kys-surface)', borderRadius: 'var(--kys-radius-xl)', overflow: 'auto', padding: 10 }}>
          {list.length === 0 && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--kys-text-muted)' }}>
              <Icon name="search_off" size={40} color="var(--kys-primary)" />No passwords found.
            </div>
          )}
          {list.map(i => <PasswordRow key={i.id} {...i} selected={i.id === selId} onClick={() => setSelId(i.id)} onCopy={() => copy(i.password, 'Password')} />)}
        </section>

        <aside style={{ background: 'var(--kys-surface)', borderRadius: 'var(--kys-radius-xl)', overflow: 'auto', padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sel && <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <CategoryIcon category={sel.category} logo={sel.logo} brandColor={sel.brandColor} size={72} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{sel.name}</div>
                <div style={{ fontSize: 14, color: 'var(--kys-text-muted)' }}>{sel.url}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SecretField key={'u' + sel.id} label={sel.category === 'wifi' ? 'Network' : 'Username'} value={sel.username} onCopy={v => copy(v, 'Username')} />
              <SecretField key={'p' + sel.id} label={sel.category === 'apikeys' ? 'API key' : sel.category === 'licenses' ? 'License key' : 'Password'} value={sel.password} secret onCopy={v => copy(v, 'Password')} />
              {sel.risk && <Alert tone="danger">{sel.risk}</Alert>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--kys-text-muted)' }}>
              <span>{CATEGORIES[sel.category].label}</span><span>Updated {sel.updated}</span>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <Button size="lg" fullWidth style={{ flex: 1 }}>Edit</Button>
              <IconButton icon="star" variant="outline" size={48} fill={!!sel.favorite} color={sel.favorite ? 'var(--kys-favorite)' : undefined} title="Favorite"
                onClick={() => setItems(items.map(i => i.id === sel.id ? { ...i, favorite: !i.favorite } : i))} />
              <IconButton icon="delete" variant="outline" size={48} color="var(--kys-danger)" title="Delete"
                onClick={() => { setItems(items.filter(i => i.id !== sel.id)); toast('Item deleted'); }} />
            </div>
          </>}
        </aside>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4, fontSize: 13, color: 'var(--kys-text-muted)' }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--kys-success)' }} />Offline · Encrypted on this device
      </div>
    </div>
  );
}
window.VaultScreen = VaultScreen;
