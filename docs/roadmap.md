# Roadmap

Ordered by risk: stop data loss, then encrypt, then add features. Tick items off as they ship and note the version.

## Phase 1: Don't lose data (v0.2.3)

- [ ] Only treat a missing vault file as empty. Any other read error must fail loudly instead of returning `[]` (which the next save would write over the real vault).
- [ ] Atomic writes: write `passwords.json.tmp`, then rename over the real file.
- [ ] Keep `passwords.json.bak` (the previous version) on every write.
- [ ] Automated Windows builds and GitHub Releases on version tags.

## Phase 2: Encrypt the vault (v0.3.0 or v1.0.0)

- [ ] Master password on first run, unlock screen afterwards.
- [ ] `scrypt` key derivation + `aes-256-gcm` encryption (Node `crypto`, no new dependency). File stores `{ version, salt, iv, tag, data }`.
- [ ] Key lives only in the main process.
- [ ] Migrate the existing plaintext vault, then remove the plaintext file.
- [ ] Auto-lock after idle time and on minimize.
- [ ] Encrypted exports (plaintext export behind a warning).
- [ ] UI states clearly that a forgotten master password cannot be recovered.
- [ ] Runnable check: round-trip works, wrong password fails.

## Phase 3: Hardening

- [ ] Generator uses `crypto.getRandomValues`, with length and character-set options.
- [ ] Clear the clipboard ~30 s after copying if it still holds the password.
- [ ] Electron: `sandbox: true`, a Content Security Policy, block `window.open` and navigation.
- [ ] List view receives entries without passwords; reveal/copy fetch one password by id.

## Phase 4: Features

- [ ] Health view: list the reused, old, and weak entries that `get-stats` already counts.
- [ ] Import Chrome / Edge / Firefox CSV exports.
- [ ] Opt-in breach check via Have I Been Pwned (k-anonymity: only 5 hash characters leave the machine).
- [ ] Favorites and sorting.

## Not planned

Cloud sync, browser extension, mobile app, TOTP storage (puts both login factors in one file).
