# Security

An honest description of what KYS protects today. Update this file whenever that changes.

## Current state

| Area | Status |
|---|---|
| Vault encryption | ✅ AES-256-GCM, key unlocked by a master password (since 1.0.0). |
| Master password | ✅ Mandatory, at least 8 characters. Never stored; only used to derive a key. |
| Shared computers | ✅ Each profile is a separate vault with its own master password and recovery kit. One person's password can't open another's profile. Profile names are visible to everyone on the picker. Deleting a profile needs its master password. |
| Forgotten password | ✅ Recovery kit (a one-time code shown at setup). Without the password *or* the code, the data is gone for good. |
| Lock | ✅ Manual lock button; auto-lock after 5 minutes idle, on screen lock, and on sleep. |
| Remember on this computer | ⚠️ Off by default, per profile. Turning it on shows a warning that must be accepted. When on, that profile's vault key is stored encrypted by the Windows account (DPAPI), so it opens without the master password. On a shared Windows login that means **anyone using the computer** can open that profile. On macOS (development) the key is in the Keychain instead, and macOS may ask for your **Mac login password** to let KYS (or "Electron" under `npm start`) use it; that password goes to macOS, never to KYS. |
| Vault integrity | ✅ Atomic writes, one `.bak` of the previous version, tampering detected by GCM, an unreadable vault is never overwritten. |
| Renderer isolation | ✅ `contextIsolation: true`, `nodeIntegration: false`. The vault key never leaves the main process. |
| What the UI can load or contact | ✅ Content Security Policy: only the app's own scripts, styles, fonts, and images; no outside connections. Pop-ups and navigating away are blocked. Fonts are bundled, so the app makes no network requests at all. |
| Local file access from the UI | ✅ The UI is served from `app://kys/` (only files in `build/`), not `file://`, so it can't read other files on disk. |
| Packaged app (Electron fuses) | ✅ Can't be run as plain Node (`ELECTRON_RUN_AS_NODE`), no `NODE_OPTIONS` or `--inspect` debugger, loads only its own integrity-checked `app.asar`, no extra `file://` privileges. |
| Shipped code | ✅ Only the app's own files (~3 MB). No npm packages are bundled into the installer. |
| Exports | ✅ Encrypted `.kys` files (scrypt + AES-256-GCM, same as the vault) protected by the master password or a password you choose. Exporting requires typing the master password, even when unlocked or remembered. Importing decrypts in the main process; the UI never sees the file. |
| Password generator | ✅ `crypto.getRandomValues` with rejection sampling (no bias); 12–32 characters, always includes each enabled character type. |
| Clipboard | ✅ Copied in the main process and cleared after 30 s, on lock, and on quit (only if it still holds that password). On Windows it's marked to stay out of clipboard history (Win+V) and cloud clipboard. |
| Unlocked renderer | ⚠️ While unlocked, the UI holds site names, usernames, and notes. Passwords are fetched one at a time only when revealed or edited. |

## How the encryption works

```
master password ──scrypt──► key A ──┐
                                    ├── each decrypts a copy of ──► vault key ──AES-256-GCM──► entries
recovery code ────scrypt──► key B ──┘
```

- **Vault key**: 32 random bytes, generated at setup. It encrypts the entries and never changes, so changing the password or recovery code only re-encrypts the small key copies.
- **Key derivation**: `scrypt` with N=2¹⁷, r=8, p=1 (~128 MB, a few hundred ms), a fresh 16-byte salt per copy. This makes guessing passwords slow.
- **Encryption**: AES-256-GCM with a fresh 12-byte IV on every write. GCM's tag doubles as the wrong-password check: a wrong key fails authentication instead of producing garbage.
- **Recovery code**: 24 characters from Crockford base32 (120 random bits), shown as `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`. Case, dashes, spaces, and O/0, I/L/1 mix-ups are ignored when typing it.
- Everything uses Node's built-in `crypto`. No third-party crypto code.

## What it protects against

- ✅ Someone copying `passwords.json` (stolen laptop, cloud backup, malware that grabs files): they get ciphertext and have to guess the master password at scrypt speed.
- ✅ Someone at your unlocked-then-idle computer, after the auto-lock. **Unless "Remember on this computer" is on**: then anyone signed in to your Windows account can open KYS, and locking only hides the list.
- ✅ With "Remember on this computer" on, a copied vault file still needs the master password: the remembered key is in a separate file that only your Windows account on that PC can decrypt.
- ❌ Malware running as you while KYS is unlocked (keyloggers, memory readers). No desktop password manager can fully stop that.
- ❌ A weak master password. scrypt slows guessing; it can't save `password1`.

## The recovery kit, and helping family

There is no server and no "reset by email". Nobody (including the developer) can open a vault without the master password or the recovery code. That is deliberate: any hidden way in would work for attackers too.

To be able to help someone who might forget their password: when you set KYS up for them, keep a copy of *their* recovery kit (with their knowledge). If they forget, open KYS on their computer, click **Forgot password?**, type the code, and set a new password with them.

## Known limits

- Upgrading from 0.2.x replaces the plaintext file with the encrypted one and deletes the plaintext `.bak`, but the old bytes may remain on disk until overwritten (normal for SSDs; full-disk encryption like BitLocker covers this).
- A 1.0 vault can't be opened by 0.2.x. Downgrading means starting over.

## Rules for contributors

- Never commit a real `passwords.json`, export file, recovery code, or screenshot containing real credentials.
- Use Node's built-in `crypto` for anything security-related. No `Math.random` for secrets.
- The vault key stays in the main process. The renderer gets only what it needs to display.
- Any change to storage or crypto needs a test in `vault.test.js` (round-trip, wrong-secret failure).
- Changing the file format means bumping `version` in `vault.js` and migrating old files.

Planned fixes are tracked in [roadmap.md](roadmap.md).
