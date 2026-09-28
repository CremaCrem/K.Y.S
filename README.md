# KYS – Keep Yourself Safe

A desktop password manager built with Electron and React. Your passwords stay on your computer, encrypted with a master password. No account, no cloud. Made for families that share one computer: everyone gets their own profile.

## Download

Get the latest Windows installer (`.exe`) from the [Releases](../../releases) page.

## Your master password and recovery kit

- The first time you open KYS, you choose a **master password**. It encrypts everything, and you type it each time you open KYS.
- Right after, KYS shows your **recovery kit**: a code like `7F3Q-M9XA-…`. **Print it or write it down, and keep it safe.** If you forget your master password, click **Forgot password?** and type the code.
- If you lose both the password and the recovery kit, **nobody can get your passwords back**, not even the developer.
- Setting KYS up for a parent or friend? Keep a copy of their recovery kit so you can help them if they forget.

## Sharing a computer

When KYS opens, pick your profile (like on Netflix) or click **Add person**. Each profile has its own master password, recovery kit, and passwords, and nobody can open someone else's without their password. Locking goes back to the profile screen so the next person can pick theirs.

Details: [docs/security.md](docs/security.md).

## Features

- Profiles for everyone who shares the computer
- Master password with encrypted storage, auto-lock, and a printable recovery kit
- Categories: Email, Games, Socials, Apps, Bank, Shopping, Work, Entertainment
- Password generator, strength indicator, and duplicate detection
- Notes per entry, search, edit, delete, favorites, and sorting
- Password health dashboard: see which passwords are weak, reused, or old, with a tip on how to fix each
- Password-protected export/import: move your passwords to another computer on a USB flash drive
- Themes and languages (English, Spanish, Filipino)

## Quick start (development)

```bash
npm install
npm run start
```

## Documentation

| Doc | Covers |
|---|---|
| [Development](docs/development.md) | Setup, scripts, project rules, commit style |
| [Architecture](docs/architecture.md) | How the app is built, IPC API, data format and location |
| [Security](docs/security.md) | How the encryption works, what it does and doesn't protect |
| [Roadmap](docs/roadmap.md) | Planned work, in order |
| [Releasing](docs/releasing.md) | Versioning and publishing a new version |
| [Changelog](CHANGELOG.md) | Changes per version |
