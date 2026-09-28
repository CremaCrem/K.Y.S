# Roadmap

Ordered by risk: stop data loss, then encrypt, then add features. Tick items off as they ship and note the version.

## Phase 1: Don't lose data ✅ v0.2.3

- [x] Only treat a missing vault file as empty. Any other read error must fail loudly instead of returning `[]` (which the next save would write over the real vault).
- [x] Atomic writes: write `passwords.json.tmp`, then rename over the real file.
- [x] Keep `passwords.json.bak` (the previous version) on every write.
- [x] Automated Windows builds and GitHub Releases on version tags.

## Phase 2: Encrypt the vault ✅ v1.0.0

- [x] Mandatory master password on first run, unlock screen afterwards.
- [x] `scrypt` key derivation + AES-256-GCM (Node `crypto`, no new dependency).
- [x] Recovery kit: a code that also unlocks the vault, confirmed at setup by typing its last 4 characters. "Forgot password?" uses it to set a new password.
- [x] Change master password; create a new recovery kit.
- [x] Key lives only in the main process.
- [x] Migrate the existing plaintext vault and delete the plaintext backup.
- [x] Auto-lock after 5 minutes idle, on screen lock, and on sleep.
- [x] Warning before plaintext export.
- [x] Tests: round-trip, wrong password / code, recovery, tampering.

### Later

- [x] "Remember on this computer": unlock with the Windows login (Electron `safeStorage`). Convenience, not recovery.
- [x] Encrypted exports and imports (moved to Phase 4, shipped there).

## Phase 3: Hardening ✅ v1.1.0

- [x] Upgrade Electron to a supported version (32 → 44). Keep it within the latest 3 majors from now on.
- [x] Generator uses `crypto.getRandomValues`, with length and character-set options.
- [x] Clear the clipboard ~30 s after copying if it still holds the password; keep it out of Windows clipboard history.
- [x] Electron: `sandbox: true`, a Content Security Policy, block `window.open` and navigation.
- [x] List view receives entries without passwords; reveal/copy fetch one password by id.
- [x] Electron fuses in the packaged app (needs electron-builder 26); UI served from `app://` instead of `file://`; npm packages no longer shipped.
- [x] Bundle fonts locally instead of loading them from Google Fonts.
- [x] Edit dialog hides the password behind a reveal toggle.

## Phase 4: Features ✅ v1.3.0

- [x] Password-protected export and import (`.kys` files) for moving passwords to another computer.
- [x] Password health dashboard: Weak / Reused / Old tiles filter the list, with a badge on each affected entry and a tip on how to fix it.
- [x] Favorites and sorting.

## Phase 5: Shared computers

- [x] Profiles: a picker with one card per person, each with its own vault, master password, recovery kit, and "Remember" setting.
- [x] Move the existing vault into a first profile on upgrade.
- [x] "Remember on this computer" asks for confirmation with a shared-login warning.
- [x] Rename and delete profiles (delete needs the master password).

## Not planned

- Cloud sync, browser extension, mobile app. Each needs a server or a separate app.
- TOTP storage: puts both login factors in one file.
- Breach checks (Have I Been Pwned) and site icons: both need network access, and KYS makes none.
- Importing browser (Chrome / Edge / Firefox) CSV exports.
- Password hints: stored unencrypted and usually give the password away.
- Any hidden or developer-held way into users' vaults. See [security.md](security.md#the-recovery-kit-and-helping-family).
