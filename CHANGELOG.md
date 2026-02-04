## Changelog

All notable changes to this project will be documented in this file.

### [0.2.0] - 2026-02-04

#### Added
- MacOS-inspired UI with custom title bar, themes, and modern layout.
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

