## Changelog

All notable changes to this project will be documented in this file.

### [Unreleased]

#### Added
- Profiles for shared computers: KYS opens with a "Who's using KYS?" screen with a card for each person. Each profile has its own master password, recovery kit, and passwords. Add, rename, and delete profiles (deleting needs that profile's master password). The title bar shows whose profile is open.
- Turning on "Remember on this computer" now shows a warning to accept first, explaining that anyone using the same Windows login could open that profile.

#### Changed
- Your existing passwords move into a first profile named "Me" automatically. Rename it in Security settings.

### [1.3.0] - 2026-09-28

#### Added
- Password health dashboard: the Weak, Reused, and Old tiles on the passwords page show exactly which entries need attention, with a badge on each and a short tip on how to fix it.
- Favorites: star an entry to keep it at the top, or show only favorites. Sort by name, recently added, or recently changed.
- Password-protected export and import. Export asks for your master password and saves a `.kys` file protected by it (or by a password you choose). On another computer, Import asks for that password and adds the entries it doesn't already have. Old unencrypted `.json` exports can still be imported.

#### Removed
- Unencrypted export.

### [1.2.0] - 2026-09-28

#### Added
- "Remember on this computer" (Security settings, off by default): KYS opens without asking for your master password, and the lock screen gets a one-click unlock. Only your Windows account on that computer can use it.

#### Changed
- The strength meter now judges length and guessability instead of counting character types: common passwords and patterns like `Password1!`, `aaaa`, or `1234` show as weak, and long passwords show as strong even without symbols.

### [1.1.0] - 2026-09-28

Security hardening.

#### Added
- Password generator options: length (12–32, default 20) and symbols on/off, remembered between sessions.
- Copied passwords are cleared from the clipboard after 30 seconds, when KYS locks, and when it closes (unless you've copied something else since). On Windows they're kept out of clipboard history (Win+V) and cloud clipboard.

#### Changed
- The password generator uses the operating system's secure random source instead of `Math.random`.
- The edit dialog hides the password until you click the eye icon.
- The password list no longer loads every password into the window; each one is fetched only when you reveal, copy, or edit it.
- Updated Electron from 32 to 44. Electron 32 no longer received security fixes.
- Import and export dialogs now open in your Downloads folder.
- Smaller, locked-down installer: npm packages are no longer bundled into the app (211 MB → 3 MB of app code), Electron fuses block running KYS as plain Node or attaching a debugger, and the UI loads from a private `app://` protocol instead of `file://`.
- KYS no longer connects to the internet at all: fonts are bundled instead of loaded from Google Fonts, and a Content Security Policy blocks any outside connection, pop-up, or navigation. Headings now show in Montserrat as intended.
- Your theme and language choice reset once after updating (they're stored per app origin, which changed).

### [1.0.0] - 2026-09-28

The first release that encrypts your passwords.

#### Added
- Mandatory master password. The vault is encrypted with AES-256-GCM and a key derived from the password with scrypt.
- Recovery kit: a code shown at setup (print or save as PDF) that lets you set a new password if you forget the old one. Setup can't be finished without confirming it.
- Lock button, and auto-lock after 5 minutes idle, on screen lock, and on sleep.
- Security settings: change the master password, create a new recovery kit.
- Warning before exporting, since export files are not encrypted.

#### Changed
- Existing 0.2.x passwords are encrypted automatically when you set your master password. The unencrypted backup file is deleted.

#### Note
- A 1.0 vault can't be opened by 0.2.x versions.

### [0.2.3] - 2026-09-28

#### Fixed
- A damaged vault file no longer shows as empty and gets overwritten on the next save. KYS now shows an error on startup instead.

#### Added
- Saves are atomic, and the previous version of the vault is kept as `passwords.json.bak`.
- Windows installer is built and published to GitHub Releases automatically when a version tag is pushed.
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

