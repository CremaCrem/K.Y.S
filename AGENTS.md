# AGENTS.md

Instructions for AI coding agents working in this repository.

## Attribution

The repository owner is the sole author. Coding agents are tools, not contributors:

- No `Co-Authored-By` trailers, "Generated with …" lines, or AI credits in commits, PRs, docs, the README, or the CHANGELOG.
- Commits are authored by the owner's configured git identity only.

## Read first

`docs/` is the single source of truth. Don't duplicate it here or in the README; link to it and update it.

- [docs/architecture.md](docs/architecture.md): processes, IPC API, data format
- [docs/development.md](docs/development.md): setup, scripts, rules, commit style
- [docs/security.md](docs/security.md): what is and isn't protected
- [docs/roadmap.md](docs/roadmap.md): planned work, in order
- [docs/releasing.md](docs/releasing.md): versioning and the release workflow

## Hard rules

- Never commit `passwords.json`, exports, or any real credentials. Test data must be obviously fake.
- Vault and profile file access happens only in `vault.js` and `profiles.js`, covered by their tests. The renderer goes through `preload.js`.
- Every new IPC operation is added in both `main.js` and `preload.js`, and documented in `docs/architecture.md`.
- Security-related randomness and crypto use Node's `crypto` / Web Crypto, never `Math.random`.
- Don't add dependencies for what the standard library or a few lines can do.
- Never force-push, rewrite published history, delete tags, or publish releases without the owner's explicit OK.

## Before finishing a change

1. `npm test` and `CI=true npm run build` pass.
2. Docs in `docs/` still match the code (update them in the same commit).
3. User-visible changes have a line in the `[Unreleased]` section of `CHANGELOG.md`.
4. When a roadmap item ships, tick it in `docs/roadmap.md`.
