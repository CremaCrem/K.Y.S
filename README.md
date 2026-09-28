# KYS – Keep Yourself Safe

A desktop password manager built with Electron and React. Your passwords stay on your computer, no account or cloud involved.

> ⚠️ **The vault is not encrypted yet.** Passwords are stored as plain JSON in your user folder. Encryption is the next major milestone; see [docs/security.md](docs/security.md).

## Download

Get the latest Windows installer (`.exe`) from the [Releases](../../releases) page.

## Features

- Categories: Email, Games, Socials, Apps, Bank, Shopping, Work, Entertainment
- Password generator, strength indicator, and duplicate detection
- Notes per entry, search, edit, delete
- Stats: totals, reused passwords, passwords older than 90 days
- JSON import/export
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
| [Security](docs/security.md) | What is and isn't protected today |
| [Roadmap](docs/roadmap.md) | Planned work, in order |
| [Changelog](CHANGELOG.md) | Changes per version |
