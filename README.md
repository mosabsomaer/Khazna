# Khazna — خزنة

A centralized brand asset library and UI gallery for the Libyan fintech ecosystem. Khazna (Arabic for "vault") provides developers and designers with a clean, always-up-to-date source for bank logos, payment method marks, and app UI references — in one place.

**Live:** [khazna.ly](https://khazna.ly) &nbsp;·&nbsp; **Figma:** [View Library](https://figma.com) &nbsp;·&nbsp; **GitHub:** [mosabsomaer/Khazna](https://github.com/mosabsomaer/Khazna)

---

## What's Inside

- **Logos** — SVG logos and logomarks for 12 Libyan banks and 13 payment providers, in branded and monochrome variants
- **App Gallery** — curated UI screenshots across onboarding, dashboard, transaction, and settings flows
- **Code Snippets** — auto-generated usage code for React, Vue, Svelte, and plain HTML
- **Downloads** — export any logo as SVG, PNG, or WebP; batch-download the full set as a ZIP
- **Arabic + English** — full RTL/LTR support with browser language detection
- **Dark / Light mode** — system-aware, with smooth View Transitions API animation

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| UI Primitives | shadcn/ui (Radix UI) |
| Animation | Framer Motion |
| i18n | i18next + react-i18next |
| Syntax Highlighting | Shiki |
| ZIP Downloads | JSZip |
| Linting | Biome |
| Package Manager | Bun |

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/mosabsomaer/Khazna.git
cd Khazna

# 2. Install dependencies (requires Bun)
bun install

# 3. Start dev server
bun dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
bun run build
bun run preview  # preview the production build locally
```

---

## Project Structure

```
Khazna/
├── components/          # React components (Navbar, DetailPanel, etc.)
│   └── ui/              # shadcn/ui base components
├── pages/               # Route-level pages (Home, Apps, Contributing)
├── hooks/               # Custom hooks (sound, language, scroll)
├── lib/                 # Utilities (download, code generation, sound engine)
├── data/                # i18n translation files (en.json, ar.json)
├── public/
│   ├── logos/
│   │   ├── banks/           # Full bank logos (SVG)
│   │   ├── bank-icons/      # Bank logomarks (SVG)
│   │   └── payment-methods/ # Payment provider logos (SVG)
│   ├── fonts/               # Ghroob Arabic font
│   └── sounds/              # UI sound effects
├── constants.ts         # Bank + payment method data, contributors
├── types.ts             # TypeScript interfaces
└── i18n.ts              # i18next configuration
```

---

## Adding a Logo

1. Add the SVG file(s) to `public/logos/banks/` or `public/logos/payment-methods/`
2. Register the entry in `constants.ts` (`BANKS` or `PAYMENT_METHODS` array)
3. Add translation keys for the entity name in both `data/en.json` and `data/ar.json`
4. Run `bun dev` to verify it renders correctly in both light and dark modes

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide and submission checklist.

---

## Contributing

Contributions are welcome — new logos, app screenshots, translations, or code improvements.  
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## License

The **source code** is released under the [MIT License](./LICENSE).

The **brand assets** (logos, logomarks, app screenshots) are the intellectual property of their respective companies. They are provided here solely as a reference library to assist developers and designers in building Libyan fintech products. No ownership or license over these marks is claimed or implied.
