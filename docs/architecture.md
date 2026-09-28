# Architecture

KYS is an Electron desktop app with a React (Create React App) UI.

## Processes

| Layer | File(s) | Role |
|---|---|---|
| Main process | `main.js` | Owns the window, dialogs, and IPC handlers. |
| Vault storage | `vault.js` | The only code that reads or writes the vault file. No Electron dependency, so it's testable with plain Node. |
| Preload | `preload.js` | Exposes a small, fixed API to the UI as `window.electron` via `contextBridge`. |
| Renderer | `src/` | React UI. Has no Node access (`nodeIntegration: false`, `contextIsolation: true`). |

The renderer never touches the disk. Everything goes through IPC.

## IPC API

All password operations use `ipcRenderer.invoke` → `ipcMain.handle`.

| `window.electron.*` | Channel | Does |
|---|---|---|
| `getPasswords()` | `get-passwords` | Returns all entries. |
| `savePassword(data)` | `save-password` | Adds an entry. `site`, `username`, `password` are required. |
| `updatePassword(id, updates)` | `update-password` | Merges `updates` into one entry, sets `updatedAt`. |
| `deletePassword(id)` | `delete-password` | Removes one entry. |
| `checkDuplicate(site, username)` | `check-duplicate` | Case-insensitive match on site + username. |
| `exportPasswords()` | `export-passwords` | Save dialog, writes entries (without `id`) as JSON. |
| `importPasswords()` | `import-passwords` | Open dialog, merges a JSON array, skips duplicates. |
| `getStats()` | `get-stats` | Totals by category, reused passwords, entries older than 90 days. |
| `minimizeWindow()` / `maximizeWindow()` / `closeWindow()` | `*-window` (`send`) | Custom title bar controls. |

Adding a capability means adding it in both `main.js` and `preload.js`. Keep the API narrow: expose specific operations, never a generic "write the whole file" call.

## Data

The vault is a single JSON array in Electron's `userData` folder:

- Windows: `%APPDATA%\KYS\passwords.json`
- macOS (dev): `~/Library/Application Support/kys/passwords.json`

Entry shape:

```json
{
  "id": "uuid",
  "site": "Gmail",
  "username": "me@example.com",
  "password": "…",
  "category": "Email",
  "notes": "optional",
  "createdAt": "ISO date",
  "updatedAt": "ISO date, set on edit",
  "importedAt": "ISO date, set on import"
}
```

`category`, `notes`, `updatedAt`, `importedAt` are optional. Entries without an `id` get one on first read.

How `vault.js` protects the file:

- **Missing file** = empty vault. **Unreadable file** (bad JSON, not a list, permission error) throws; it is never treated as empty, so a save can't overwrite it. On startup `main.js` shows an error dialog with the path.
- **Writes are atomic**: write `passwords.json.tmp`, copy the current file to `passwords.json.bak`, rename the temp file into place.
- **Recovery**: if the vault is damaged, close KYS and rename `passwords.json.bak` to `passwords.json`. It holds the version before the last save.

On startup, `migrateOldPasswords()` copies a `passwords.json` from the app directory into `userData` if `userData` has none (legacy location from v0.1.0).

See [security.md](security.md) for how the vault is (and is not) protected.

## UI

- Navigation is plain state in `App.js` (`home` ↔ `entries`), no router.
- `src/pages/HomePage.jsx`: add-password form, generator, duplicate warning.
- `src/pages/EntriesPage.jsx`: list, search, edit, delete, import/export, stats.
- `src/context/LanguageContext.js`: translations (English, Spanish, Filipino). Choice saved in `localStorage` key `language`.
- Themes: `light`, `dark`, `pink`, `vaporwave`, `alpha-wolf`, cycled from the title bar. Saved in `localStorage` key `theme`.
- Styling: Tailwind CSS plus `src/App.css`.
