# Development

## Setup

Requires Node.js 18+ and npm.

```bash
npm install
npm run start
```

`start` runs the React dev server on `http://localhost:3000` and opens Electron once it is up. DevTools open automatically in dev.

## Scripts

| Script | Does |
|---|---|
| `npm run start` | Dev mode: React dev server + Electron. |
| `npm run build` | Production React build into `build/`. |
| `npm run electron-dev` | Electron only, loading `build/`. Run `build` first. |
| `npm run package` | Builds the Windows installer (`.exe`) into `dist/` with electron-builder. |

Before committing, make sure this passes (warnings count as errors, same as CI):

```bash
CI=true npm run build
```

## Project layout

```
main.js          Electron main process: window, IPC, vault file
preload.js       Bridge exposing window.electron to the UI
src/             React UI (pages/, components/, context/)
public/          CRA static files
assets/          App icon used by electron-builder
docs/            Project documentation (this folder)
```

Details: [architecture.md](architecture.md).

## Rules

- **Never commit real passwords.** `passwords.json` is git-ignored; keep it that way. Use obviously fake data (`test@example.com`) when testing.
- Vault reads and writes happen only in `main.js`.
- New UI text goes into every language in `LanguageContext.js`.
- Don't add a dependency for something a few lines or Node's standard library can do.

## Commits

- Imperative subject, 72 characters max: `Fix vault wipe on corrupted file`, not `Fixed stuff`.
- Body (optional) explains *why*, wrapped at 72 characters.
- One logical change per commit.
- User-visible changes also get a line in the `[Unreleased]` section of [CHANGELOG.md](../CHANGELOG.md).
