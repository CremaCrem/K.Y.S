## KYS – Keep Yourself Safe Password Manager

KYS is a desktop password manager built with **Electron + React**.  
It stores your passwords locally in a human‑readable JSON file and gives you a **macOS‑inspired UI**, category filters, password strength indicators, and more.

### Download

- **Latest Windows installer**: see the **Releases** page on GitHub.
- **All versions / old installers**: go to the **Releases** tab to pick a specific version.

When you publish a new version, create a GitHub Release (tag like `v0.2.0`) and upload the `.exe` from `dist/`. The “latest” release will always be used as the recommended download.

### Features

- **Local storage**: passwords are saved to `passwords.json` under Electron's `userData` folder (in your AppData), so they survive updates.
- **Categorized entries**: Email, Games, Socials, Apps, Bank, Work, Entertainment, and more.
- **Modern UI**: macOS‑style title bar, custom themes, and responsive layout.
- **Password tools**:
  - Strength indicator for new passwords.
  - Duplicate detection to avoid re‑creating the same entry.
  - Notes field per password.
- **Import/Export**:
  - Export all passwords to a JSON backup file.
  - Import from a JSON file with duplicate detection.
- **Internationalization**:
  - Language selector with English, Spanish, and Filipino.

### Development

- **Start in development mode**

```bash
npm install
npm run start
```

This runs:

- `react-scripts start` on `http://localhost:3000`
- Electron, which waits for the dev server and then loads it

### Building and Packaging

- **Build the React app**

```bash
npm run build
```

- **Build the Windows installer**

```bash
npm run package
```

This uses `electron-builder` to create a Windows installer (`.exe`) in the `dist/` folder.

For a release, you typically:

1. Update the version in `package.json` (e.g. `0.2.0` → `0.2.1`).
2. Update [`CHANGELOG.md`](./CHANGELOG.md).
3. Run `npm run build` then `npm run package`.
4. Create a Git tag (e.g. `v0.2.1`) and GitHub Release.
5. Upload the new `.exe` from `dist/` to that Release.

### Scripts

- **`npm run start`** – start React dev server and Electron together (dev mode).
- **`npm run build`** – build React into the `build/` folder (used in production).
- **`npm run test`** – run tests via `react-scripts test`.
- **`npm run package`** – build a Windows installer with `electron-builder`.

### Data Location

KYS stores data in Electron's `userData` directory, not inside the repo:

- `passwords.json` is created under `%APPDATA%`/`kys` (or the platform’s equivalent).
- Updates and reinstalls do **not** wipe your saved passwords unless you manually delete that file.

If you ever corrupt the file during development, you can delete the `passwords.json` inside the app's `userData` folder and let the app recreate or migrate it again.

### Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for a list of changes per version.
