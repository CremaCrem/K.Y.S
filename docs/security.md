# Security

An honest description of what KYS protects today. Update this file whenever that changes.

## Current state

| Area | Status |
|---|---|
| Vault encryption | ❌ **None.** `passwords.json` is plain JSON. Anyone or anything that can read your user folder can read every password. |
| Master password / lock | ❌ None. |
| Exports | ❌ Plain JSON. Treat export files like the passwords themselves. |
| Renderer isolation | ✅ `contextIsolation: true`, `nodeIntegration: false`. The UI can only call the operations in `preload.js`. |
| Password generator | ⚠️ Uses `Math.random`, which is not cryptographically secure. |
| Clipboard | ⚠️ Copied passwords are never cleared automatically. |
| Vault integrity | ✅ Atomic writes, one `.bak` of the previous version, and an unreadable vault is never overwritten. |

Until encryption ships, KYS is only as safe as your OS account.

## Rules for contributors

- Never commit a real `passwords.json`, export file, or screenshot containing real credentials.
- Use Node's built-in `crypto` for anything security-related. No `Math.random` for secrets.
- Secrets stay in the main process where possible. The renderer gets only what it needs to display.
- Any change to storage or crypto needs a runnable check (round-trip, wrong-password failure).

Planned fixes are tracked in [roadmap.md](roadmap.md).
