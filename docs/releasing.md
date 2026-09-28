# Releasing

Releases are built by GitHub Actions ([.github/workflows/release.yml](../.github/workflows/release.yml)). You pick the version and push a tag; the workflow builds the Windows installer and publishes the GitHub Release.

## Versioning

KYS uses [semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

| Change | Bump | Example |
|---|---|---|
| Bug fixes only | PATCH | `0.2.2` → `0.2.3` |
| New features, or a change to the vault file format | MINOR | `0.2.3` → `0.3.0` |
| First release you'd call stable/safe (planned: once the vault is encrypted) | MAJOR | `0.x` → `1.0.0` |
| A redesign that changes how the whole app looks and works | MAJOR | `1.4.0` → `2.0.0` |

The version lives in one place: `"version"` in `package.json`. Git tags are `v` + that version.

## Steps

1. Make sure `master` is clean and `npm test` and `CI=true npm run build` pass.
2. In [CHANGELOG.md](../CHANGELOG.md), rename `### [Unreleased]` to `### [X.Y.Z] - YYYY-MM-DD` and add a fresh empty `### [Unreleased]` above it.
3. Bump the version, commit, and tag:
   ```bash
   npm version X.Y.Z --no-git-tag-version   # updates package.json + package-lock.json
   git commit -am "Release vX.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   ```
4. Push the commit and the tag:
   ```bash
   git push origin master --follow-tags
   ```
5. Watch the **Actions** tab. When the workflow finishes, the release with `KYS Setup X.Y.Z.exe` appears on the **Releases** page. Its notes are that version's CHANGELOG section.

## If the workflow fails

- **"Tag does not match package.json version"**: the tag and `package.json` disagree. Delete the tag (`git push origin :refs/tags/vX.Y.Z` and `git tag -d vX.Y.Z`), fix, and tag again.
- **Tests or build fail**: fix on `master`, then move the tag to the fixed commit the same way.
- Nothing is published unless every step passes.

## Notes

- The installer is unsigned, so Windows SmartScreen will warn on first run ("More info" → "Run anyway"). Code signing needs a paid certificate; add it only if that warning becomes a problem.
- `npm run package` still builds the installer locally into `dist/` for testing.
