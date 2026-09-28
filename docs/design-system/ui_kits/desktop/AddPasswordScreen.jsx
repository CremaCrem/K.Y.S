function generatePassword(len, symbols) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789' + (symbols ? '!@#$%^&*' : '');
  const a = new Uint32Array(len); crypto.getRandomValues(a);
  return Array.from(a, n => chars[n % chars.length]).join('');
}

function AddPasswordScreen({ onBack, onSave }) {
  const { TextField, Select, Button, IconButton, Slider, Checkbox, CATEGORIES } = window.KYS_NS;
  const [site, setSite] = React.useState('');
  const [cat, setCat] = React.useState('');
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [len, setLen] = React.useState(20);
  const [sym, setSym] = React.useState(true);
  const [notes, setNotes] = React.useState(false);

  return (
    <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '20px 20px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px', alignItems: 'center' }}>
        <IconButton icon="arrow_back" variant="tonal" shape="square" size={48} title="Back" onClick={onBack} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ font: '800 40px/1.1 var(--kys-font-wordmark)' }}>K.Y.S</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--kys-text-muted)' }}>Keep Yourself Safe</div>
        </div>
      </div>
      <form onSubmit={e => { e.preventDefault(); onSave({ name: site || 'Untitled', category: cat || 'other', username: user, password: pass }); }}
        style={{ maxWidth: 640, margin: '28px auto 0', background: 'var(--kys-surface)', borderRadius: 'var(--kys-radius-xl)', padding: 32, display: 'flex', flexDirection: 'column', gap: 22, boxShadow: 'var(--kys-shadow-1)' }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Add Password</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(160px,220px)', gap: 16 }}>
          <TextField label="Website/Application" placeholder="Enter website/app" value={site} onChange={e => setSite(e.target.value)} />
          <Select label="Category" value={cat} onChange={e => setCat(e.target.value)} options={Object.entries(CATEGORIES).map(([value, c]) => ({ value, label: c.label }))} />
        </div>
        <TextField label="Username/Email" placeholder="Enter username/email" value={user} onChange={e => setUser(e.target.value)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <TextField style={{ flex: 1 }} label="Password" placeholder="Enter password" mono type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
              trailing={<IconButton icon={show ? 'visibility_off' : 'visibility'} title={show ? 'Hide' : 'Show'} onClick={() => setShow(!show)} />} />
            <Button variant="tonal" size="xl" icon="auto_awesome" style={{ height: 52 }} onClick={() => { setPass(generatePassword(len, sym)); setShow(true); }}>Generate</Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 28 }}>
            <Slider label="Length" min={8} max={64} value={len} onChange={setLen} />
            <Checkbox checked={sym} onChange={setSym} label="Symbols (!@#$%^&*)" />
          </div>
        </div>
        {notes
          ? <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={{ fontSize: 15, fontWeight: 600 }}>Notes</span>
              <textarea className="kys-field" rows={3} placeholder="Recovery hints, security questions…" style={{ resize: 'vertical', borderRadius: 'var(--kys-radius-md)', border: '1px solid var(--kys-border-strong)', padding: 14, font: '16px var(--kys-font-sans)', outline: 'none' }} /></label>
          : <div><Button variant="ghost" icon="add" style={{ paddingLeft: 4 }} onClick={() => setNotes(true)}>Notes (optional)</Button></div>}
        <Button type="submit" size="xl" fullWidth style={{ marginTop: 8 }}>Add Password</Button>
      </form>
    </div>
  );
}
window.AddPasswordScreen = AddPasswordScreen;
