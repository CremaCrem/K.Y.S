# Architecture

KYS is an Electron desktop app with a React (Create React App) UI.

## Processes

| Layer | File(s) | Role |
|---|---|---|
| Main process | `main.js` | Owns the window, dialogs, IPC handlers, and the in-memory vault key (lock state, auto-lock). |
| Vault storage | `vault.js` | The only code that reads, writes, encrypts, or decrypts a vault file. No Electron dependency, so it's testable with plain Node. |
| Profiles | `profiles.js` | The list of people on this computer and each one's folder. Creates, renames, and removes profiles and moves a pre-1.4 vault into the first one. No Electron dependency. |
| Preload | `preload.js` | Exposes a small, fixed API to the UI as `window.electron` via `contextBridge`. |
| Renderer | `src/` | React UI. Has no Node access (`nodeIntegration: false`, `contextIsolation: true`). |

The renderer never touches the disk. Everything goes through IPC.

In development the window loads the React dev server (`ELECTRON_START_URL`). Otherwise it loads `app://kys/index.html`, a custom protocol `main.js` serves from `build/` only (never `file://`).

## Packaging

- Every npm package is a `devDependency`. The UI is bundled into `build/` and `main.js` only uses Electron and Node built-ins, so the installer ships just `build/`, `main.js`, `preload.js`, `vault.js`, `profiles.js`, `src/utils/passwordStrength.mjs` (shared with the UI for the health check), and `package.json`. Don't add runtime `dependencies` unless `main.js` truly needs them.
- Electron fuses (`build.electronFuses` in `package.json`) are flipped in the packaged app; see [security.md](security.md). They don't apply to `npm start`.

## IPC API

All operations use `ipcRenderer.invoke` → `ipcMain.handle`. Password operations throw `The vault is locked.` unless the vault is unlocked.

### Profiles

| `window.electron.*` | Channel | Does |
|---|---|---|
| `selectProfile(id)` | `select-profile` | Switches to a profile (locked). A remembered profile unlocks right away. |
| `switchProfile()` | `switch-profile` | Locks and returns to the profile picker. |
| `createProfile(name, password)` | `create-profile` | Creates a profile with its vault and master password in one step, opens it, returns `{ ok, recoveryCode }` or `{ ok: false, error: 'nameTaken' \| 'nameInvalid' }`. |
| `renameProfile(name)` | `rename-profile` | Unlocked only. `{ ok, profile }` or a name error. |
| `deleteProfile(password)` | `delete-profile` | Unlocked only. Checks the master password, deletes the profile's folder, returns to the picker. `{ ok }` or `{ ok: false, error: 'wrongPassword' }`. |

With one profile, KYS opens it directly at launch and locking stays on its lock screen. With more than one, locking returns to the picker.

### Master password

| `window.electron.*` | Channel | Does |
|---|---|---|
| `getVaultStatus()` | `vault-status` | `{ status }`: `pick` (no profile selected; with `profiles: [{ id, name }]`), `setup` (no vault, or a pre-1.0 plaintext one; then `hasExistingPasswords: true`), `locked` (with `remembered` if this computer can unlock it), `unlocked`, or `error` (with `message`). All but `pick` include `profile: { id, name }`. |
| `setupVault(password)` | `setup-vault` | Creates the encrypted vault (migrating plaintext entries), unlocks it, returns `{ recoveryCode }`. Refuses if already encrypted. |
| `unlock(password)` | `unlock` | `{ ok }`. |
| `recover(recoveryCode, newPassword)` | `recover` | Forgot password: unlocks with the recovery code and sets a new password. `{ ok }`. |
| `lock()` | `lock` | Forgets the key and sends `vault-locked`. |
| `changePassword(current, new)` | `change-password` | `{ ok }`; `ok: false` if `current` is wrong. |
| `newRecoveryCode()` | `new-recovery-code` | Replaces the recovery code (the old one stops working), returns `{ recoveryCode }`. |
| `unlockRemembered()` | `unlock-remembered` | One-click unlock with the key remembered on this computer. `{ ok }`. |
| `getRemember()` | `get-remember` | `{ available, remembered }`. `available` is false where the OS can't protect the key (e.g. Linux without a keyring). |
| `setRemember(enabled)` | `set-remember` | Unlocked only. Stores or deletes this computer's copy of the vault key. |
| `onVaultLocked(callback)` | `vault-locked` (event) | Fires on manual lock and auto-lock. Returns an unsubscribe function. |

New passwords must be at least 8 characters; `main.js` enforces it, the UI mirrors it.

### Passwords

| `window.electron.*` | Channel | Does |
|---|---|---|
| `getPasswords()` | `get-passwords` | Returns all entries **without** their `password` field. |
| `getPassword(id)` | `get-password` | Returns one password (reveal, edit). |
| `copyPassword(id)` | `copy-password` | Copies one password in the main process, so it never reaches the UI. Cleared after 30 s, on lock, and on quit, only if the clipboard still holds it. On Windows, excluded from clipboard history and cloud clipboard. |
| `savePassword(data)` | `save-password` | Adds an entry, returns `{ success, id }`. `site`, `username`, `password` are required. |
| `updatePassword(id, updates)` | `update-password` | Merges `updates` into one entry, sets `updatedAt`, and `passwordChangedAt` when the password changed. |
| `deletePassword(id)` | `delete-password` | Removes one entry. |
| `setFavorite(id, favorite)` | `set-favorite` | Stars or unstars an entry. Not an edit: `updatedAt` and `passwordChangedAt` stay as they are. |
| `checkDuplicate(site, username)` | `check-duplicate` | Case-insensitive match on site + username. The returned entry has no `password`. |
| `exportPasswords(masterPassword, filePassword)` | `export-passwords` | Checks the master password (`{ ok: false, error: 'wrongPassword' }` if wrong), then save dialog, writes a `.kys` export encrypted with `filePassword`, or the master password if omitted. `{ ok, count }`. |
| `importPasswords()` | `import-passwords` | Open dialog. An old plain JSON export is merged right away (`{ ok, imported, skipped }`). An encrypted export stays in `main.js` and returns `{ needsPassword, fileName }`. Anything else: `{ error: 'notExportFile' }`. |
| `importWithPassword(password)` | `import-with-password` | Decrypts the pending export and merges it (`{ ok, imported, skipped }`), or `{ ok: false, error: 'wrongPassword' }`. The file's contents never reach the UI. |
| `getStats()` | `get-stats` | Password health: `{ total, weak, reused, old, issues }`, where `issues` maps entry id → `['weak' \| 'reused' \| 'old']`. Weak uses `src/utils/passwordStrength.mjs` (the meter's rules), old means no password change in 90 days. Computed here because the UI has no passwords. |
| `minimizeWindow()` / `maximizeWindow()` / `closeWindow()` | `*-window` (`send`) | Custom title bar controls. |

Adding a capability means adding it in both `main.js` and `preload.js`. Keep the API narrow: expose specific operations, never a generic "write the whole file" call.

## Data

Each profile has its own folder in Electron's `userData` folder:

```
userData/                      Windows: %APPDATA%\KYS   macOS (dev): ~/Library/Application Support/kys
  profiles.json                { profiles: [{ id, name, createdAt }] }  (names are not secret)
  profiles/<id>/passwords.json the profile's vault (+ .bak, .tmp)
  profiles/<id>/device-unlock.bin  only if "Remember on this computer" is on
```

Before 1.4 the vault was `userData/passwords.json`. On first launch, `profiles.js` moves it (with its backup and remembered key) into a profile named "Me", which can be renamed.

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
  "favorite": true,
  "createdAt": "ISO date",
  "updatedAt": "ISO date, set on edit",
  "passwordChangedAt": "ISO date, set when the password changes",
  "importedAt": "ISO date, set on import"
}
```

`category`, `notes`, `favorite`, `updatedAt`, `passwordChangedAt`, `importedAt` are optional. Pre-1.0 entries without an `id` get one during setup.

How `vault.js` protects the file:

- **Missing file** → setup. **Plain JSON array** (pre-1.0) → setup, which encrypts the existing entries and deletes the plaintext `.bak`. **Anything else unreadable** throws; the UI shows an error screen instead of setup, so nothing overwrites it.
- **Writes are atomic**: write `passwords.json.tmp`, copy the current file to `passwords.json.bak`, rename the temp file into place.
- **Recovery**: if the vault is damaged, close KYS and rename `passwords.json.bak` to `passwords.json`. It holds the version before the last save.

"Remember on this computer" stores a profile's vault key, encrypted with Electron's `safeStorage` (DPAPI on Windows, Keychain on macOS), in `device-unlock.bin` next to that profile's vault. It's separate from the vault so a copied vault doesn't carry it. A stored key that no longer opens the vault is deleted; setting up a new vault deletes it too.

On startup, `migrateOldPasswords()` copies a `passwords.json` from the app directory into `userData` if `userData` has none (legacy location from v0.1.0).

### Export file

`.kys` files are portable: encrypted with a key derived from the export password, not the vault key, so they import into KYS on any computer.

```json
{ "format": "kys-export", "version": 1, "salt": "…", "iv": "…", "tag": "…", "data": "…" }
```

`data` decrypts to the entries without `id`. On import, only known fields with the right types are kept, new ids are assigned, and entries whose site + username already exist are skipped. Plain JSON arrays (exports from before 1.3) still import.

See [security.md](security.md) for how the vault is (and is not) protected.

## UI

The look follows the [K.Y.S design system](design-system/README.md).

- Navigation is plain state in `App.js` (`vault` ↔ `form`), no router. While unlocked, a nav rail on the left has Vault, Add, Security (opens the Security dialog), and Lock.
- `App.js` asks `getVaultStatus()` on start and on every `vault-locked` event. Until the vault is unlocked, only `LockScreen` renders. It also shows the toast ("Password copied", "Item deleted"...) for 2 seconds.
- `src/pages/ProfilePicker.jsx`: "Who's using KYS?" cards and the create-profile form (name + master password). `src/components/ProfileAvatar.jsx`: initial on a color that stays the same per profile.
- `src/pages/LockScreen.jsx`: the picker (status `pick`), setup, unlock, and "Forgot password?" recovery, with the profile's name and a "Switch profile" link. The title bar shows whose profile is open.
- `src/components/RecoveryKit.jsx`: shows a new recovery code with Print / Save as PDF; continuing requires typing its last 4 characters. Rendered by `App.js` above everything else so an auto-lock can't hide an unsaved code.
- `src/components/SecurityModal.jsx`: profile name, change master password, "Remember on this computer" (turning it on needs confirming a warning), new recovery kit, delete profile.
- `src/pages/VaultPage.jsx`: search, import/export, the health tiles (Weak / Reused / Old, which filter the list), category filter chips (only categories that have entries), the list, and a detail panel for the selected entry: reveal/copy, notes, a tip per health issue, edit, favorite, delete. Favorites are listed first; the sort (name, recently added, recently changed) is saved in `localStorage` key `sortBy`.
- `src/pages/PasswordForm.jsx`: add or edit an entry, with the generator (length and symbols saved in `localStorage`), strength meter, and duplicate warning (new entries only).
- `src/components/ExportModal.jsx`, `ImportModal.jsx`: password-protected export and import. `ModalShell.jsx` is the shared dialog frame (Escape closes it).
- `src/components/ui.jsx`: the design system's components (Button, TextField, PasswordRow, Alert...) and the category list. Entries store the category's `value` (`Email`, `Bank`, `WiFi`...), so renaming a label never touches vault data.
- `src/context/LanguageContext.js`: translations (English, Spanish, Filipino). Choice saved in `localStorage` key `language`.
- Theme: light or dark, from the title bar. Saved in `localStorage` key `theme` and applied as `data-theme` on `<html>`.
- Hidden themes (`pink`, `vaporwave`, `alpha-wolf`): easter eggs, unlocked by typing a secret into the vault search (`SECRET_THEMES` in `App.js`). Unlocked ones join the title-bar theme cycle (its icon becomes a palette) and are saved in `localStorage` key `unlockedThemes`. Anyone already using one from an older version keeps it. Their colors are token overrides at the end of the theme section in `src/index.css`; Alpha Wolf's wallpaper is `src/images/awooooo.jpg`.
- Styling: design tokens (`--kys-*` CSS variables) in `src/index.css`, used through Tailwind (`tailwind.config.js` maps its colors to them) and inline styles. Fonts (Roboto Flex, Roboto Mono, Montserrat) and the icon font (a Material Symbols subset, rebuilt by `scripts/fetch-icons.sh`) are bundled from `src/fonts/`; don't load anything from a CDN, the CSP in `public/index.html` blocks it.
