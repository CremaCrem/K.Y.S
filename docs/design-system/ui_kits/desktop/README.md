# K.Y.S desktop UI kit

Click-through recreation of the K.Y.S desktop app (Electron-style window with orange title bar).

- `index.html` — app shell: TitleBar + NavRail, toast, dark-mode toggle (moon icon).
- `VaultScreen.jsx` — vault list with search, category filter chips (only categories in use), sort, detail panel with reveal/copy, favorite, delete.
- `AddPasswordScreen.jsx` — the Add Password form (website, category, username, password + generator with length and symbols).
- `data.js` — sample vault covering everyday and specialty categories (Wi‑Fi, servers, API keys, licenses).

Composes components from `components/` via the compiled bundle (or `ds-fallback.js` in-browser transpile).
