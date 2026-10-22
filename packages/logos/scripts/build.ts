import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { BANKS, PAYMENT_GATEWAYS, PAYMENT_METHODS } from "../../../constants.ts";
import ar from "../../../data/ar.json";
import en from "../../../data/en.json";
import { parseSvg, prefixIds } from "./svg.ts";

const PACKAGE_ROOT = resolve(import.meta.dir, "..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const PUBLIC_DIR = join(REPO_ROOT, "public");
const URL_PREFIX = "/cdn/v1/logos/";
const DIST = join(PACKAGE_ROOT, "dist");

type EntityType = "bank" | "payment_method" | "payment_gateway";

interface Entity {
	id: string;
	type: EntityType;
	colors: string[];
	website?: string;
	logoUrl: string;
	logomarkUrl?: string;
	logoUrlBlack?: string;
	logomarkUrlBlack?: string;
}

const VARIANTS = [
	{ key: "logo", suffix: "Logo", url: "logoUrl" },
	{ key: "logomark", suffix: "Logomark", url: "logomarkUrl" },
	{ key: "logoBlack", suffix: "LogoBlack", url: "logoUrlBlack" },
	{ key: "logomarkBlack", suffix: "LogomarkBlack", url: "logomarkUrlBlack" },
] as const;

type VariantKey = (typeof VARIANTS)[number]["key"];

export interface BuiltLogo {
	id: string;
	type: EntityType;
	name: { en: string; ar: string };
	colors: string[];
	website?: string;
	svg: Partial<Record<VariantKey, string>>;
}

export interface BuildResult {
	logos: BuiltLogo[];
	components: string[];
}

function pascalCase(id: string): string {
	return id
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function assertUnique(values: string[], what: string): void {
	const seen = new Set<string>();
	for (const value of values) {
		if (seen.has(value)) throw new Error(`duplicate ${what}: ${value}`);
		seen.add(value);
	}
}

function relativeSvgPath(url: string): string {
	if (!url.startsWith(URL_PREFIX)) throw new Error(`unexpected logo url: ${url}`);
	return `svg/${url.slice(URL_PREFIX.length)}`;
}

function lookupName(names: Record<string, string>, id: string, lang: string): string {
	const name = names[id];
	if (!name) throw new Error(`no ${lang} entityNames entry for "${id}"`);
	return name;
}

function componentModule(name: string, spec: unknown): string {
	return `import { createLogo } from "./create-logo.js";

export const ${name} = /* @__PURE__ */ createLogo(${JSON.stringify(name)}, ${JSON.stringify(spec)});
`;
}

export async function build(): Promise<BuildResult> {
	const entities: Entity[] = [...BANKS, ...PAYMENT_METHODS, ...PAYMENT_GATEWAYS];
	assertUnique(
		entities.map((entity) => entity.id),
		"entity id",
	);

	await rm(DIST, { recursive: true, force: true });
	await mkdir(join(DIST, "react"), { recursive: true });

	const logos: BuiltLogo[] = [];
	const components: string[] = [];
	const moduleNames: string[] = [];

	for (const entity of entities) {
		const svg: BuiltLogo["svg"] = {};

		for (const variant of VARIANTS) {
			const url = entity[variant.url];
			if (!url) continue;

			const relative = relativeSvgPath(url);
			const label = `${entity.id} ${variant.key} (${url})`;
			let source: string;
			try {
				source = await readFile(join(PUBLIC_DIR, url), "utf8");
			} catch {
				throw new Error(`${label}: file is missing from public/`);
			}

			const parsed = parseSvg(source, label);
			await mkdir(dirname(join(DIST, relative)), { recursive: true });
			await cp(join(PUBLIC_DIR, url), join(DIST, relative));
			svg[variant.key] = relative;

			const name = `${pascalCase(entity.id)}${variant.suffix}`;
			if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) throw new Error(`invalid component name: ${name}`);
			components.push(name);

			const idPrefix = `khz-${entity.id}-${variant.key}-`;
			const markup = prefixIds(parsed.inner, idPrefix, label);
			await writeFile(
				join(DIST, "react", `${name}.js`),
				componentModule(name, {
					viewBox: parsed.viewBox,
					width: parsed.width,
					height: parsed.height,
					attrs: parsed.attrs,
					markup,
				}),
			);
			moduleNames.push(name);
		}

		logos.push({
			id: entity.id,
			type: entity.type,
			name: {
				en: lookupName(en.entityNames, entity.id, "en"),
				ar: lookupName(ar.entityNames, entity.id, "ar"),
			},
			colors: entity.colors,
			...(entity.website ? { website: entity.website } : {}),
			svg,
		});
	}

	assertUnique(components, "component name");

	await cp(join(PACKAGE_ROOT, "src/create-logo.js"), join(DIST, "react/create-logo.js"));
	await writeFile(
		join(DIST, "react/index.js"),
		`${moduleNames.map((name) => `export { ${name} } from "./${name}.js";`).join("\n")}\n`,
	);
	await writeFile(join(DIST, "react/index.d.ts"), reactTypes(components));
	await writeFile(join(DIST, "index.js"), metadataModule(logos));
	await writeFile(join(DIST, "index.d.ts"), metadataTypes(logos));

	return { logos, components };
}

function reactTypes(components: string[]): string {
	return `import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "title"> {
	/** Height of the logo; the width follows the original aspect ratio. A number is in pixels. */
	size?: number | string;
	/** Accessible name. Without it the logo is hidden from assistive technology. */
	title?: string;
}

export type LogoComponent = ForwardRefExoticComponent<LogoProps & RefAttributes<SVGSVGElement>>;

${components.map((name) => `export declare const ${name}: LogoComponent;`).join("\n")}
`;
}

function metadataModule(logos: BuiltLogo[]): string {
	return `export const logos = ${JSON.stringify(logos, null, "\t")};

const byId = new Map(logos.map((logo) => [logo.id, logo]));

export function getLogo(id) {
	return byId.get(id);
}
`;
}

function metadataTypes(logos: BuiltLogo[]): string {
	return `export type LogoType = "bank" | "payment_method" | "payment_gateway";

export type LogoId =
${logos.map((logo) => `\t| ${JSON.stringify(logo.id)}`).join("\n")};

export interface LogoFiles {
	/** Path inside the package \`dist\` folder, e.g. \`svg/banks/sahara-bank.svg\`. */
	logo: string;
	logomark?: string;
	logoBlack?: string;
	logomarkBlack?: string;
}

export interface Logo<Id extends string = LogoId> {
	id: Id;
	type: LogoType;
	name: { en: string; ar: string };
	/** Brand colours as hex values. */
	colors: string[];
	website?: string;
	svg: LogoFiles;
}

export declare const logos: readonly Logo[];

export declare function getLogo<Id extends LogoId>(id: Id): Logo<Id>;
export declare function getLogo(id: string): Logo | undefined;
`;
}

if (import.meta.main) {
	const { logos, components } = await build();
	console.log(`built ${logos.length} logos, ${components.length} components`);
}
