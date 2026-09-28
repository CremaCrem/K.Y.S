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

- [ ] "Remember on this computer": unlock with the Windows login (Electron `safeStorage`). Convenience, not recovery.
- [ ] Encrypted exports.

## Phase 3: Hardening

- [x] Upgrade Electron to a supported version (32 → 44). Keep it within the latest 3 majors from now on.
- [ ] Generator uses `crypto.getRandomValues`, with length and character-set options.
- [ ] Clear the clipboard ~30 s after copying if it still holds the password.
- [ ] Electron: `sandbox: true`, a Content Security Policy, block `window.open` and navigation.
- [ ] List view receives entries without passwords; reveal/copy fetch one password by id.
- [ ] Electron fuses in the packaged app (needs electron-builder 26).
- [ ] Bundle fonts locally instead of loading them from Google Fonts.
- [ ] Edit dialog hides the password behind a reveal toggle.

## Phase 4: Features

- [ ] Health view: list the reused, old, and weak entries that `get-stats` already counts.
- [ ] Import Chrome / Edge / Firefox CSV exports.
- [ ] Opt-in breach check via Have I Been Pwned (k-anonymity: only 5 hash characters leave the machine).
- [ ] Favorites and sorting.

## Not planned

- Cloud sync, browser extension, mobile app. Each needs a server or a separate app.
- TOTP storage: puts both login factors in one file.
- Password hints: stored unencrypted and usually give the password away.
- Any hidden or developer-held way into users' vaults. See [security.md](security.md#the-recovery-kit-and-helping-family).
