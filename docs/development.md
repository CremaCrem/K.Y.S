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
| `npm test` | Runs `vault.test.js`, `profiles.test.js`, and `src/utils/*.test.mjs` with Node's built-in test runner. |
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
vault.js         Vault file read/write/encryption (+ vault.test.js)
profiles.js      Profiles list and folders (+ profiles.test.js)
preload.js       Bridge exposing window.electron to the UI
src/             React UI (pages/, components/, context/)
public/          CRA static files
assets/          App icon used by electron-builder
scripts/         fetch-icons.sh: rebuilds the bundled icon font
docs/            Project documentation (this folder)
docs/design-system/  The K.Y.S design system (tokens, components, guidelines)
```

Details: [architecture.md](architecture.md).

## Rules

- **Never commit real passwords.** `passwords.json` is git-ignored; keep it that way. Use obviously fake data (`test@example.com`) when testing.
- Vault and profile file access happens only in `vault.js` and `profiles.js`, and changes to them come with tests.
- New UI text goes into every language in `LanguageContext.js`.
- UI follows the [design system](design-system/README.md): build screens from the components in `src/components/ui.jsx` and the `--kys-*` tokens, not new colors or sizes. A token or component change goes into both `src/` and `docs/design-system/`.
- Icons are [Material Symbols](https://fonts.google.com/icons?icon.style=Rounded) names (`<Icon name="lock" />`). The app bundles only the ones it uses: add a new name to `scripts/fetch-icons.sh`, run `sh scripts/fetch-icons.sh`, and commit the updated font. An icon missing from the font shows up as its name in plain text.
- Don't add a dependency for something a few lines or Node's standard library can do.

## Commits

- Imperative subject, 72 characters max: `Fix vault wipe on corrupted file`, not `Fixed stuff`.
- Body (optional) explains *why*, wrapped at 72 characters.
- One logical change per commit.
- User-visible changes also get a line in the `[Unreleased]` section of [CHANGELOG.md](../CHANGELOG.md).
