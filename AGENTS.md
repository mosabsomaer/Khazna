# Khazna — Agent Guide

Khazna is a brand asset library and UI gallery for the Libyan fintech ecosystem. It's a React + TypeScript SPA built with Vite. This file gives AI coding assistants the context needed to work effectively in this codebase.

---

## Commands

```bash
bun dev          # start dev server (localhost:5173)
bun run build    # production build
bun run preview  # preview production build locally
bun check        # lint + type-check (Biome)
bun format       # auto-fix lint + formatting
```

**Always use `bun`, never `npm` or `yarn`.** Run `bun format` before finishing any task.

---

## Architecture

### Global State — `UIContext`

Almost every component reads from `UIContext` (defined in `App.tsx`, consumed via `hooks/useUIContext.ts`). It holds:

| Key | Type | Purpose |
|---|---|---|
| `selectedItem` | `Bank \| PaymentMethod \| null` | Opens the detail sidebar when set |
| `isSidebarOpen` | `boolean` | Derived from `!!selectedItem` |
| `logoVariant` | `"branded" \| "mono" \| "logomark"` | Controls which SVG variant renders |
| `theme` | `"light" \| "dark"` | Current color scheme |
| `soundEnabled` | `boolean` | Sound effects on/off |
| `getLogoUrl(item)` | function | Returns correct logo URL for current variant |

Always use `useUIContext()` to access these — never reach into `UIContext` directly.

### Routing

```
/                  → HomePage       (logo grid)
/apps              → AppsPage       (app UI gallery)
/apps/:bankId      → AppDetailPage  (individual app screenshots)
/contributing      → ContributingPage
/about             → AboutPage
```

### Data Flow

1. `constants.ts` — source of truth for all banks, payment methods, screenshots, and contributor data
2. `types.ts` — TypeScript interfaces (`Bank`, `PaymentMethod`, `Screenshot`, `UIContextType`, etc.)
3. `data/en.json` + `data/ar.json` — all UI strings; accessed via `useTranslation()` hook

---

## Key Files

| File | What it does |
|---|---|
| `App.tsx` | Root component, `UIContext` provider, theme toggle logic, router |
| `constants.ts` | `BANKS`, `PAYMENT_METHODS`, `MOCK_SCREENSHOTS`, `CONTRIBUTORS`, `SOCIAL_LINKS` |
| `types.ts` | All TypeScript interfaces and union types |
| `i18n.ts` | i18next setup, language detection (localStorage → browser → fallback `en`) |
| `index.css` | CSS variables for theming, global styles, theme transition animation |
| `lib/download.ts` | SVG → PNG/WebP conversion, single and batch ZIP downloads |
| `lib/generators.ts` | Code snippet generation for React, Vue, Svelte, HTML |
| `lib/sound-engine.ts` | Web Audio API sound effects |
| `lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |

---

## Code Style

- **Formatter/linter:** Biome (`biome.json`)
- **Indentation:** tabs
- **Line width:** 100 characters
- **Imports:** auto-organized by Biome — don't manually sort
- **No `console.log`** left in committed code
- Use the `cn()` helper from `lib/utils.ts` for all conditional className merging

---

## i18n Rules

The app supports English (LTR) and Arabic (RTL). Arabic is the primary audience.

**Always add keys to both files:**
- `data/en.json`
- `data/ar.json`

**Use logical CSS properties — never physical left/right:**

| Avoid | Use instead |
|---|---|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `border-l-*` / `border-r-*` | `border-s-*` / `border-e-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |

Language preference is persisted in `localStorage` under the key `khazna-lang`.

---

## Theming

Light/dark mode uses CSS variables. **Never hardcode raw color values.**

Always use semantic tokens:

```css
var(--color-background)
var(--color-surface)
var(--color-elevated)
var(--color-primary)
var(--color-muted)
var(--color-dim)
var(--color-border)
var(--color-border-subtle)
var(--color-accent-bg)
var(--color-accent-text)
```

Theme is toggled via `toggleTheme(originRect?)` in `UIContext`. It uses the View Transitions API (Chrome/Safari) with a clip-path circle animation, falling back to a Web Animations API overlay, then an instant switch. Don't replicate this logic — just call `toggleTheme`.

Theme preference is persisted in `localStorage` under `khazna-theme`. Sound preference uses `khazna-sound`.

---

## Components

- `components/ui/` — shadcn/ui base components (Radix UI). **Do not modify these.**
- `components/` — custom components. Use `cn()` for class merging.
- Pages live in `pages/` and are registered as routes in `App.tsx`
- Custom hooks live in `hooks/`

---

## Contributing

For adding logos, screenshots, translations, or submitting PRs, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## What to Avoid

- Don't use `npm` or `yarn` — this project uses Bun
- Don't hardcode color values — use CSS variable tokens
- Don't use physical CSS properties (`left`, `right`, `ml-*`, `mr-*`) — use logical equivalents
- Don't modify `components/ui/` (shadcn base components)
- Don't add translation keys to only one language file
- Don't call `UIContext` directly — use `useUIContext()` from `hooks/useUIContext.ts`
