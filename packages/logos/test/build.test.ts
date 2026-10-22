import { beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { BANKS, PAYMENT_GATEWAYS, PAYMENT_METHODS } from "../../../constants.ts";
import { type BuildResult, build } from "../scripts/build.ts";

const DIST = join(import.meta.dir, "../dist");
const entities = [...BANKS, ...PAYMENT_METHODS, ...PAYMENT_GATEWAYS];

let result: BuildResult;

beforeAll(async () => {
	result = await build();
});

describe("build output", () => {
	test("every entity is present with all of its referenced files", () => {
		expect(result.logos.map((logo) => logo.id)).toEqual(entities.map((entity) => entity.id));

		for (const entity of entities) {
			const urls = [
				entity.logoUrl,
				entity.logomarkUrl,
				entity.logoUrlBlack,
				entity.logomarkUrlBlack,
			].filter((url): url is string => Boolean(url));

			for (const url of urls) {
				const path = join(DIST, url.replace("/cdn/v1/logos/", "svg/"));
				expect(existsSync(path), `${entity.id}: ${path}`).toBe(true);
			}
		}
	});

	test("ids are unique", () => {
		const ids = result.logos.map((logo) => logo.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	test("component names are unique valid identifiers, one per svg variant", () => {
		const variantCount = result.logos.reduce((sum, logo) => sum + Object.keys(logo.svg).length, 0);
		expect(result.components.length).toBe(variantCount);
		expect(new Set(result.components).size).toBe(result.components.length);
		for (const name of result.components) {
			expect(name).toMatch(/^[A-Z][A-Za-z0-9]*$/);
			expect(existsSync(join(DIST, "react", `${name}.js`))).toBe(true);
		}
	});

	test("metadata carries both names and the svg paths", async () => {
		const { getLogo, logos } = await import(join(DIST, "index.js"));
		expect(logos.length).toBe(entities.length);

		const sahara = getLogo("sahara-bank");
		expect(sahara.type).toBe("bank");
		expect(sahara.name.en).toBe("Sahara Bank");
		expect(sahara.name.ar).toBeTruthy();
		expect(sahara.svg.logo).toBe("svg/banks/sahara-bank.svg");
		expect(getLogo("does-not-exist")).toBeUndefined();
	});

	test("variants without a source file are not generated", () => {
		const aman = result.logos.find((logo) => logo.id === "aman-bank");
		expect(aman?.svg.logomark).toBeUndefined();
		expect(result.components).not.toContain("AmanBankLogomark");
	});
});
