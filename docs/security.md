# Security

An honest description of what KYS protects today. Update this file whenever that changes.

## Current state

| Area | Status |
|---|---|
| Vault encryption | ✅ AES-256-GCM, key unlocked by a master password (since 1.0.0). |
| Master password | ✅ Mandatory, at least 8 characters. Never stored; only used to derive a key. |
| Forgotten password | ✅ Recovery kit (a one-time code shown at setup). Without the password *or* the code, the data is gone for good. |
| Lock | ✅ Manual lock button; auto-lock after 5 minutes idle, on screen lock, and on sleep. |
| Vault integrity | ✅ Atomic writes, one `.bak` of the previous version, tampering detected by GCM, an unreadable vault is never overwritten. |
| Renderer isolation | ✅ `contextIsolation: true`, `nodeIntegration: false`. The vault key never leaves the main process. |
| Exports | ⚠️ Plain JSON, behind a warning dialog. Treat export files like the passwords themselves. |
| Password generator | ⚠️ Uses `Math.random`, which is not cryptographically secure. |
| Clipboard | ⚠️ Copied passwords are never cleared automatically. |
| Unlocked renderer | ⚠️ While unlocked, the UI holds decrypted entries in memory. |

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
- ✅ Someone at your unlocked-then-idle computer, after the auto-lock.
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
