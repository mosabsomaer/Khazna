# Contributing to Khazna

Thank you for your interest in contributing to Khazna! This guide covers how to get started, understand the project structure, and submit your changes.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mosabsomaer/Khazna.git
cd Khazna

# Install dependencies (uses Bun)
bun install

# Start the dev server
bun run dev
```

## Project Structure

```
Khazna/
├── App.tsx              # Root component, UIContext provider
├── index.tsx            # Entry point
├── index.html           # HTML shell, CSS variables, FOUC prevention
├── index.css            # Global styles, theme toggle animation
├── constants.ts         # BANKS, PAYMENT_METHODS, MOCK_SCREENSHOTS, SOCIAL_LINKS
├── types.ts             # TypeScript interfaces (Bank, PaymentMethod, etc.)
├── i18n.ts              # i18next configuration
├── components/
│   ├── ui/              # shadcn/ui base components
│   └── *.tsx            # Custom components (Navbar, LogoCard, etc.)
├── pages/
│   ├── HomePage.tsx         # Logo gallery
│   ├── AppsPage.tsx         # App UI gallery
│   ├── AppDetailPage.tsx    # App detail / screenshots
│   ├── AboutPage.tsx        # About page
│   └── ContributingPage.tsx # Contributing page (rendered from this file)
├── hooks/               # Custom React hooks
├── lib/                 # Shared helpers (e.g. cn())
├── data/
│   ├── en.json          # English translations
│   └── ar.json          # Arabic translations
└── public/
    └── cdn/v1/logos/
        ├── banks/       # Full bank logos (SVG)
        ├── bank-icons/  # Bank logomarks (SVG)
        └── payments/    # Payment method logos (SVG)
```

## Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting. Biome is installed as a dev dependency — run it via `bunx`:

```bash
# Check for lint and format issues
bunx biome check .

# Auto-fix formatting and safe lint issues
bunx biome check --write .
```

Always run the formatter before committing. The project uses tabs for indentation and a 100-character line width (see `biome.json`).

## i18n

Khazna defaults to Arabic (RTL). When working on UI:

- Add translation keys to **both** `data/en.json` and `data/ar.json`
- Use logical CSS properties instead of physical ones:
  - `start`/`end` instead of `left`/`right`
  - `ms-*`/`me-*` instead of `ml-*`/`mr-*`
  - `ps-*`/`pe-*` instead of `pl-*`/`pr-*`
  - `border-s-*`/`border-e-*` instead of `border-l-*`/`border-r-*`

## Theming

The project uses CSS variables for light/dark mode. Use semantic tokens in your styles:

- `var(--color-background)`, `var(--color-surface)`, `var(--color-elevated)`
- `var(--color-primary)`, `var(--color-muted)`, `var(--color-dim)`
- `var(--color-border)`, `var(--color-border-subtle)`
- `var(--color-accent-bg)`, `var(--color-accent-text)`

Do **not** hardcode raw color values. Always use the semantic tokens so both themes work correctly.

## Components

- **shadcn/ui** base components live in `components/ui/` — avoid modifying these directly
- Custom components go in `components/`
- Use the `cn()` helper from `lib/utils.ts` for conditional class merging

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b your-feature-name`
3. Make your changes
4. Run `bunx biome check --write .` to fix formatting
5. Run `bunx biome check .` to verify no lint errors
6. Commit with a clear message describing the change
7. Push and open a Pull Request

---

## Adding New Logos

This section covers how to add a new bank or payment method logo to Khazna.

### 1. Prepare Your SVG Files

Each entity needs SVG logo files following these specs:

| Requirement | Value |
|-------------|-------|
| Format | SVG only |
| Naming | `kebab-case.svg` (e.g., `my-bank.svg`) |
| Colors | Use the original brand colors (no monochrome conversion needed) |
| Clean SVG | No embedded fonts, no JavaScript, no external references |

**Banks** need two SVG files:
- **Full logo** — the complete logo with wordmark
- **Logomark** — the icon/symbol only

**Payment methods** need one SVG file:
- **Full logo** — the complete logo

### 2. Add SVG Files

Place your files in the correct `public/cdn/v1/logos/` subdirectory:

```
public/cdn/v1/logos/
├── banks/           # Full bank logos
│   └── my-bank.svg
├── bank-icons/      # Bank logomarks (icon only)
│   └── my-bank.svg
└── payments/        # Payment method logos
    └── my-payment.svg
```

If the brand has an alternate dark-background variant, add a sibling file
with the `-black` suffix (e.g. `my-bank-black.svg`) and wire it up via
`logoUrlBlack` / `logomarkUrlBlack` in the next step.

The filename must match the `id` you'll use in the next step.

### 3. Add the Entry to `constants.ts`

Open `constants.ts` and add your entry to the appropriate array.

**For a bank**, add to the `BANKS` array:

```ts
{
  id: "my-bank",               // kebab-case, matches SVG filename
  name: "My Bank",             // Display name
  logoUrl: "/cdn/v1/logos/banks/my-bank.svg",
  logomarkUrl: "/cdn/v1/logos/bank-icons/my-bank.svg",
  colors: ["#034694", "#27AAE2"],  // 1-3 brand colors (hex)
  hasScreenshots: false,
  type: "bank",
},
```

Optional `Bank` fields (see `types.ts`):

- `logoUrlBlack` / `logomarkUrlBlack` — alternate asset for dark backgrounds
- `website` — external brand site
- `figmaUrl` — link to the Figma source
- `isNew` / `isUpdated` — badges in the gallery
- `disableMono` — hide black/white color modes for this entry
```

**For a payment method**, add to the `PAYMENT_METHODS` array:

```ts
{
  id: "my-payment",            // kebab-case, matches SVG filename
  name: "My Payment",          // Display name
  logoUrl: "/cdn/v1/logos/payments/my-payment.svg",
  colors: ["#034694"],         // 1-3 brand colors (hex)
  type: "payment_method",
},
```

### 4. Add Translations

Add the display name to **both** translation files if the name differs between languages:

- `data/en.json`
- `data/ar.json`

### 5. Verify

```bash
bun run dev
```

Check that your logo appears correctly in:
- The logo grid on the home page
- The detail panel when clicked
- Both light and dark themes
- Both mono and branded variants

### Checklist

- [ ] SVG files are clean (no fonts, no JS, no external refs)
- [ ] Filenames are `kebab-case` and match the `id` in `constants.ts`
- [ ] Banks have both a full logo and a logomark
- [ ] `colors` array contains 1-3 hex values from the brand
- [ ] Logo renders correctly in light and dark mode
- [ ] `bunx biome check .` passes
