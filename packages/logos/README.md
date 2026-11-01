# @khazna/logos

Logos of Libyan banks, payment methods and payment gateways from [Khazna](https://khazna.ly), as plain SVG files, typed metadata and React components. Brand colours are kept as published.

## Install

```bash
bun add @khazna/logos
# or: npm install @khazna/logos
```

## SVG files

Every logo is an SVG under `svg/<folder>/<id>.svg`. Banks and some payment methods also have a logomark (`bank-icons/` for banks, `payments/<id>-icon.svg` for payment methods). A few entities have a `-black` variant, drawn in solid black for light backgrounds or recolouring.

```tsx
import saharaBank from "@khazna/logos/svg/banks/sahara-bank.svg";

// With Vite or any bundler that resolves SVG imports to a URL
<img src={saharaBank} alt="Sahara Bank" />;
```

If TypeScript does not know SVG imports, add `vite/client` to your types or declare `*.svg` yourself.

## React

```tsx
import { SaharaBankLogo, SaharaBankLogomark } from "@khazna/logos/react";

<SaharaBankLogo size={32} title="Sahara Bank" />;
```

Each logo has one component per variant: `<Name>Logo`, `<Name>Logomark`, `<Name>LogoBlack` and `<Name>LogomarkBlack`, where `<Name>` is the PascalCase of the logo id. Only variants that exist are exported.

| Prop | Description |
|---|---|
| `size` | Height; the width follows the original aspect ratio. Defaults to the original size. |
| `title` | Accessible name. Without it the logo is `aria-hidden`. |
| other | Any SVG attribute, such as `className` or `style`. |

Ids inside the artwork are prefixed per logo, so different logos can share a page. Importing one component only bundles that logo.

## Metadata

```ts
import { getLogo, logos } from "@khazna/logos";

const bank = getLogo("sahara-bank");
bank.name.ar; // Arabic name
bank.colors; // brand colours
bank.svg.logo; // "svg/banks/sahara-bank.svg", import it as `@khazna/logos/${bank.svg.logo}`

const banks = logos.filter((logo) => logo.type === "bank");
```

## CDN

```
https://cdn.jsdelivr.net/npm/@khazna/logos/dist/svg/banks/sahara-bank.svg
https://unpkg.com/@khazna/logos/dist/svg/banks/sahara-bank.svg
```

Pin a version in the URL (`@khazna/logos@0.1.0`) for production use.

## License

The **source code** is released under the [MIT License](./LICENSE).

The **brand assets** (logos, logomarks) are the intellectual property of their respective companies. They are provided here solely as a reference library to assist developers and designers in building Libyan fintech products. No ownership or license over these marks is claimed or implied.
