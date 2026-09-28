## Changelog

All notable changes to this project will be documented in this file.

### [Unreleased]

#### Fixed
- A damaged vault file no longer shows as empty and gets overwritten on the next save. KYS now shows an error on startup instead.

#### Added
- Saves are atomic, and the previous version of the vault is kept as `passwords.json.bak`.
- Project documentation in `docs/` (architecture, development, security, roadmap) and `AGENTS.md` for coding agents.

#### Removed
- Unused bulk-overwrite IPC call (`update-passwords`), unused dependencies, and Create React App leftovers.

### [0.2.2] - 2026-02-09

#### Changed
- Replaced macOS-style traffic light window controls with Windows-style minimize, maximize, and close buttons.
- Updated README to remove macOS-inspired UI references.

### [0.2.1] - 2026-02-04

#### Fixed
- Correctly package and load the custom KYS icon for the app window and installer.
- Updated electron-builder configuration to use `assets/KYS.ico` in both dev and production.

### [0.2.0] - 2026-02-04

#### Added
- Modern UI with custom title bar, themes, and responsive layout.
- Category-based password organization (Email, Games, Socials, Apps, Bank, Work, Entertainment, etc.).
- Password statistics (total, by category, reused, and old passwords).
- Import/export passwords to and from JSON, with duplicate detection.
- Password strength indicator component for new entries.
- Duplicate detection when saving a password (by site + username).
- Notes field for each password entry.
- Language selector and internationalization (English, Spanish, Filipino).

#### Changed
- Switched to modern Electron IPC using `ipcMain.handle` / `ipcRenderer.invoke`.
- Moved `passwords.json` storage to Electron's `userData` directory for safer upgrades.
- Implemented ID-based entries using `crypto.randomUUID()`.
- Improved error handling and migration for existing `passwords.json` formats.
- Updated development startup so Electron waits for the React dev server.

### [0.1.0] - Initial version

#### Added
- Basic Electron + React integration using Create React App.
- Local password storage via `passwords.json`.
- Simple UI for adding and viewing password entries.

