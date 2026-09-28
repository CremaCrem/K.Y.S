# Architecture

KYS is an Electron desktop app with a React (Create React App) UI.

## Processes

| Layer | File(s) | Role |
|---|---|---|
| Main process | `main.js` | Owns the window, dialogs, IPC handlers, and the in-memory vault key (lock state, auto-lock). |
| Vault storage | `vault.js` | The only code that reads, writes, encrypts, or decrypts the vault file. No Electron dependency, so it's testable with plain Node. |
| Preload | `preload.js` | Exposes a small, fixed API to the UI as `window.electron` via `contextBridge`. |
| Renderer | `src/` | React UI. Has no Node access (`nodeIntegration: false`, `contextIsolation: true`). |

The renderer never touches the disk. Everything goes through IPC.

In development the window loads the React dev server (`ELECTRON_START_URL`). Otherwise it loads `app://kys/index.html`, a custom protocol `main.js` serves from `build/` only (never `file://`).

## Packaging

- Every npm package is a `devDependency`. The UI is bundled into `build/` and `main.js` only uses Electron and Node built-ins, so the installer ships just `build/`, `main.js`, `preload.js`, `vault.js`, and `package.json`. Don't add runtime `dependencies` unless `main.js` truly needs them.
- Electron fuses (`build.electronFuses` in `package.json`) are flipped in the packaged app; see [security.md](security.md). They don't apply to `npm start`.

## IPC API

All operations use `ipcRenderer.invoke` → `ipcMain.handle`. Password operations throw `The vault is locked.` unless the vault is unlocked.

### Master password

| `window.electron.*` | Channel | Does |
|---|---|---|
| `getVaultStatus()` | `vault-status` | `{ status }`: `setup` (no vault, or a pre-1.0 plaintext one; then `hasExistingPasswords: true`), `locked`, `unlocked`, or `error` (with `message`). |
| `setupVault(password)` | `setup-vault` | Creates the encrypted vault (migrating plaintext entries), unlocks it, returns `{ recoveryCode }`. Refuses if already encrypted. |
| `unlock(password)` | `unlock` | `{ ok }`. |
| `recover(recoveryCode, newPassword)` | `recover` | Forgot password: unlocks with the recovery code and sets a new password. `{ ok }`. |
| `lock()` | `lock` | Forgets the key and sends `vault-locked`. |
| `changePassword(current, new)` | `change-password` | `{ ok }`; `ok: false` if `current` is wrong. |
| `newRecoveryCode()` | `new-recovery-code` | Replaces the recovery code (the old one stops working), returns `{ recoveryCode }`. |
| `onVaultLocked(callback)` | `vault-locked` (event) | Fires on manual lock and auto-lock. Returns an unsubscribe function. |

New passwords must be at least 8 characters; `main.js` enforces it, the UI mirrors it.

### Passwords

| `window.electron.*` | Channel | Does |
|---|---|---|
| `getPasswords()` | `get-passwords` | Returns all entries. |
| `savePassword(data)` | `save-password` | Adds an entry. `site`, `username`, `password` are required. |
| `updatePassword(id, updates)` | `update-password` | Merges `updates` into one entry, sets `updatedAt`. |
| `deletePassword(id)` | `delete-password` | Removes one entry. |
| `checkDuplicate(site, username)` | `check-duplicate` | Case-insensitive match on site + username. |
| `exportPasswords()` | `export-passwords` | Warns that the file is unencrypted, then save dialog, writes entries (without `id`) as JSON. |
| `importPasswords()` | `import-passwords` | Open dialog, merges a JSON array, skips duplicates. |
| `getStats()` | `get-stats` | Totals by category, reused passwords, entries older than 90 days. |
| `minimizeWindow()` / `maximizeWindow()` / `closeWindow()` | `*-window` (`send`) | Custom title bar controls. |

Adding a capability means adding it in both `main.js` and `preload.js`. Keep the API narrow: expose specific operations, never a generic "write the whole file" call.

## Data

The vault is one file in Electron's `userData` folder:

- Windows: `%APPDATA%\KYS\passwords.json`
- macOS (dev): `~/Library/Application Support/kys/passwords.json`

The file is encrypted (format v2, since 1.0.0). Details and reasoning in [security.md](security.md):

```json
{
  "format": "kys-vault",
  "version": 2,
  "keys": {
    "password": { "salt": "…", "iv": "…", "tag": "…", "data": "…" },
    "recovery": { "salt": "…", "iv": "…", "tag": "…", "data": "…" }
  },
  "vault": { "iv": "…", "tag": "…", "data": "…" }
}
```

`vault` decrypts to a JSON array of entries. Entry shape:

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

`category`, `notes`, `updatedAt`, `importedAt` are optional. Pre-1.0 entries without an `id` get one during setup.

How `vault.js` protects the file:

- **Missing file** → setup. **Plain JSON array** (pre-1.0) → setup, which encrypts the existing entries and deletes the plaintext `.bak`. **Anything else unreadable** throws; the UI shows an error screen instead of setup, so nothing overwrites it.
- **Writes are atomic**: write `passwords.json.tmp`, copy the current file to `passwords.json.bak`, rename the temp file into place.
- **Recovery**: if the vault is damaged, close KYS and rename `passwords.json.bak` to `passwords.json`. It holds the version before the last save.

On startup, `migrateOldPasswords()` copies a `passwords.json` from the app directory into `userData` if `userData` has none (legacy location from v0.1.0).

See [security.md](security.md) for how the vault is (and is not) protected.

## UI

- Navigation is plain state in `App.js` (`home` ↔ `entries`), no router.
- `App.js` asks `getVaultStatus()` on start and on every `vault-locked` event. Until the vault is unlocked, only `LockScreen` renders.
- `src/pages/LockScreen.jsx`: first-time setup, unlock, and "Forgot password?" recovery.
- `src/components/RecoveryKit.jsx`: shows a new recovery code with Print / Save as PDF; continuing requires typing its last 4 characters. Rendered by `App.js` above everything else so an auto-lock can't hide an unsaved code.
- `src/components/SecurityModal.jsx`: change master password, create a new recovery kit. Opened from the shield icon in the title bar (next to the lock icon).
- `src/pages/HomePage.jsx`: add-password form, generator, duplicate warning.
- `src/pages/EntriesPage.jsx`: list, search, edit, delete, import/export, stats.
- `src/context/LanguageContext.js`: translations (English, Spanish, Filipino). Choice saved in `localStorage` key `language`.
- Themes: `light`, `dark`, `pink`, `vaporwave`, `alpha-wolf`, cycled from the title bar. Saved in `localStorage` key `theme`.
- Styling: Tailwind CSS plus `src/App.css`.
