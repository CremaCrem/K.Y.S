# Development

## Setup

Requires Node.js 18+ and npm.

```bash
npm install
npm run start
```

`start` runs the React dev server on `http://localhost:3000` and opens Electron once it is up. DevTools open automatically in dev.

Electron (42+) downloads its binary the first time it runs, not during `npm install`, so the first start takes a bit longer.

Electron only ships security fixes for its latest 3 major versions. Check `npm view electron version` every few months and upgrade (read Electron's [breaking changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) first).

## Scripts

| Script | Does |
|---|---|
| `npm run start` | Dev mode: React dev server + Electron. |
| `npm run build` | Production React build into `build/`. |
| `npm test` | Runs `vault.test.js` with Node's built-in test runner. |
| `npm run electron-dev` | Electron only, loading `build/`. Run `build` first. |
| `npm run package` | Builds the Windows installer (`.exe`) into `dist/` with electron-builder. |

Before committing, make sure both pass (the build treats warnings as errors, as in the release workflow):

```bash
npm test
CI=true npm run build
```

## Project layout

```
main.js          Electron main process: window, dialogs, IPC
vault.js         Vault file read/write (+ vault.test.js)
preload.js       Bridge exposing window.electron to the UI
src/             React UI (pages/, components/, context/)
public/          CRA static files
assets/          App icon used by electron-builder
docs/            Project documentation (this folder)
```

Details: [architecture.md](architecture.md).

## Rules

- **Never commit real passwords.** `passwords.json` is git-ignored; keep it that way. Use obviously fake data (`test@example.com`) when testing.
- Vault reads and writes happen only in `vault.js`, and changes to it come with a test in `vault.test.js`.
- New UI text goes into every language in `LanguageContext.js`.
- Don't add a dependency for something a few lines or Node's standard library can do.

## Commits

- Imperative subject, 72 characters max: `Fix vault wipe on corrupted file`, not `Fixed stuff`.
- Body (optional) explains *why*, wrapped at 72 characters.
- One logical change per commit.
- User-visible changes also get a line in the `[Unreleased]` section of [CHANGELOG.md](../CHANGELOG.md).
