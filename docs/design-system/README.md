# K.Y.S — Keep Yourself Safe · Design System

K.Y.S is an **offline-first desktop password manager**. Everything is encrypted and stored on the user's device; nothing syncs. The product is a single desktop app (Electron-style window) with two core surfaces: the **Vault** (browse, search, filter, copy) and **Add Password** (form + built-in generator).

**Sources:** two screenshots of the pre-redesign app (Add Password form; empty Vault with stats, search, category filters) and a redesigned vault explored in a design canvas. No Figma or logo files.

**This folder is the spec; the app implements it.** Open any `.html` here in a browser to see it (the previews load React and fonts from CDNs, which the app itself never does). See [In the app](#in-the-app) for where each part lives in `src/`.

## Index
- `styles.css` — entry point (imports only). Link this one file.
- `tokens/` — `colors.css` (brand, neutrals, status, semantic, dark theme), `categories.css` (19 password-category colors), `typography.css`, `spacing.css` (space, radii, controls, shadows, motion), `fonts.css`, `base.css` (body reset, `.kys-icon`, hover/press/focus helpers).
- `components/` — React primitives:
  - `core/` Button, IconButton, Icon
  - `forms/` TextField, SearchField, Select, Checkbox, Slider
  - `vault/` CategoryIcon (+ `CATEGORIES` map), FilterChip, PasswordRow, SecretField, StatCard
  - `navigation/` TitleBar, NavRail
  - `feedback/` Toast, Alert
- `ui_kits/desktop/` — click-through app: Vault + Add Password.
- `guidelines/` — foundation specimen cards.
- `ds-fallback.js` — loads the components in the browser for the previews.
- `SKILL.md` — Agent Skill entry.

**Intentional additions** (no source counterpart): `Icon` (wrapper for the Material Symbols font), `CategoryIcon` specialty categories (Wi‑Fi, Servers & SSH, API keys, Licenses, Crypto, Identity, Smart home, Recovery codes, Dev tools, etc. — requested by the user), `Toast`, `Alert`, `NavRail`.

## Content fundamentals
- **Voice:** calm, plain, reassuring. The tagline sets the tone: *Keep Yourself Safe.* Never alarmist; risks are stated as facts ("Reused on Amazon", "Weak password").
- **Person:** speak to the user implicitly — labels and verbs, rarely "you". Never "we".
- **Casing:** Title Case for screen titles and primary buttons ("Add Password", "Total Passwords"); sentence case for everything else ("Search passwords", "Notes (optional)", "Offline · Encrypted on this device").
- **Field labels** mirror the source: "Website/Application", "Username/Email", "Password", "Category". Placeholders start with "Enter …".
- **Confirmations:** past tense, 2–3 words — "Password copied", "Item deleted", "Vault locked".
- **Empty states:** one short line — "No passwords found."
- **Offline promise** is repeated quietly, never as marketing: "Offline · Encrypted on this device".
- **No emoji.** Middle dot (·) separates metadata. Symbols listed literally when useful: "Symbols (!@#$%^&*)".

## Visual foundations
- **Color:** one loud brand color — K.Y.S orange `#E3740D` — used as solid fills (title bar, primary buttons, selected chip, active nav pill). Everything else is warm off-white neutrals (`#F7F5F2` app bg, white panels). Vibrancy comes from **category tiles**: 19 saturated solid colors, each with a white filled glyph. No pastels for brand elements; tints only for selection (`--kys-state-selected`) and status containers.
- **Type:** Roboto Flex for UI (400/500/600/800), Roboto Mono for secrets, key strings and numeric readouts, Montserrat 800 for the "K.Y.S" wordmark only. Titles are heavy and tight; body stays 14–16px.
- **Backgrounds:** flat. No gradients, textures, images or illustrations. Depth is created by white panels sitting on the warm-gray app background.
- **Cards/panels:** white, radius 24, no border, no shadow. Stat cards: muted fill, radius 20. Form card: white, radius 24, `--kys-shadow-1`.
- **Corners:** generous everywhere — fields & rows 16, panels 24, buttons/chips/search fully pill, checkbox 6, tiles ≈32% of size.
- **Borders:** 1px `--kys-border-strong` on inputs and outline buttons only. Focus → orange border + 3px orange ring.
- **Shadows:** mostly flat. Orange glow (`--kys-shadow-primary`) on the primary button; `--kys-shadow-3` on toasts.
- **Hover:** transparent controls get a 6% ink wash; filled controls darken ~5% (`filter: brightness(.95)`). **Press:** scale 0.98. No bounce.
- **Motion:** short and functional — 120–200ms, `cubic-bezier(.2,0,0,1)`. Toasts fade in, auto-dismiss after 2s.
- **Transparency/blur:** none, except the 25% white dot inside a selected chip.
- **Layout:** fixed orange title bar on top; 84px nav rail on the left; content = header (wordmark, search, Add) → filter chips → list panel + 360px detail panel. Only one primary button per view.
- **Dark theme:** `[data-theme="dark"]` on any ancestor swaps semantic tokens (moon icon in title bar). Light and dark are the brand's themes. The app also hides three easter-egg themes (Pink, Vaporwave, Alpha Wolf) that override the same tokens; they're deliberately off-brand and not part of this spec.

## Iconography
- **Material Symbols Rounded** (Google Fonts icon font, via `tokens/fonts.css`) for all UI icons. Outline by default; **filled** for active/selected states, favorites, category glyphs and status icons. Use the `Icon` component or `<span class="kys-icon">name</span>`.
- **Brand logos:** the previews can show logos from the Simple Icons CDN on the brand's color. The app makes no network requests, so it always uses the category glyph.
- **No logo file provided:** the brand mark is type-only — "K.Y.S" in Montserrat 800, and a bold "K" in the title bar. Don't draw a mark.
- No emoji; no unicode-as-icon except "·" as separator and "•" for masked secrets.

## Categories
Everyday: Games, Email, Web, Apps, Banking, Wi‑Fi, Social, Shopping, Streaming, Work.
Specialty: Dev tools, Servers & SSH, API keys, Licenses, Crypto, Identity, Smart home, Recovery codes, Other.
Each has a `--kys-cat-*` color and a Material Symbols glyph (see `components/vault/CategoryIcon.jsx`). Filter chips should show only categories the user has items in.

## In the app

| Spec | Implementation |
|---|---|
| `tokens/*.css` | `src/index.css` (`:root` and `[data-theme="dark"]`). Spacing uses Tailwind's 4px scale, which matches `--kys-space-*`. `tailwind.config.js` maps colors (`bg-surface`, `text-muted`...) and radii (`rounded-kys-xl`) to the tokens. |
| `tokens/fonts.css` | Bundled woff2 files in `src/fonts/` with their licenses. Google Fonts is blocked by the app's CSP. |
| Material Symbols | `src/fonts/material-symbols-rounded-subset.woff2`, only the icons in use. To add one: add its name to `scripts/fetch-icons.sh` and run it. |
| `components/**` | `src/components/ui.jsx`, same names and props, plus `TextArea`, `NavItem`, `Wordmark`, and `Card` (the white form card). |
| `CategoryIcon` `CATEGORIES` | `CATEGORIES` in `ui.jsx`. Keyed by the value stored in the vault (`Bank`, `Socials`, `Entertainment`, `WiFi`...), so entries saved before the redesign keep their category. Labels are translation keys. |
| `SecretField` | Controlled (`shown`, `onToggle`): the vault page fetches a password only when it's revealed, and forgets it when another entry is selected. |
| `TitleBar` | `src/components/TitleBar.jsx`: theme, language, and window controls. Security and Lock live in the nav rail instead, as in the vault design. |
| `ui_kits/desktop/VaultScreen.jsx` | `src/pages/VaultPage.jsx`, plus the health tiles (`StatCard`) above the filter chips. |
| `ui_kits/desktop/AddPasswordScreen.jsx` | `src/pages/PasswordForm.jsx`, used for both Add and Edit. |

Additions made while implementing, now part of the spec:
- Dark values for the warning, success, and info containers (`tokens/colors.css`).
- `Generate` is a `tonal` button, so each form has one primary button.
- Visible keyboard focus: a 2px orange outline on buttons, the orange ring on fields, and on checkboxes.
- Escape closes dialogs. Dialog backdrop: `rgba(20, 18, 16, 0.45)`, no blur.
