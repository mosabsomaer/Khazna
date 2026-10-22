import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { build } from "../scripts/build.ts";
import { parseSvg, prefixIds } from "../scripts/svg.ts";

const REACT_DIR = join(import.meta.dir, "../dist/react");

describe("prefixIds", () => {
	test("rewrites ids and every kind of reference", () => {
		const input = `<mask id="m"/><linearGradient id='g'/><path fill="url(#g)" mask="url( '#m' )"/><use href="#m"/><use xlink:href="#g"/>`;
		expect(prefixIds(input, "p-", "t")).toBe(
			`<mask id="p-m"/><linearGradient id='p-g'/><path fill="url(#p-g)" mask="url('#p-m')"/><use href="#p-m"/><use xlink:href="#p-g"/>`,
		);
	});

	test("does not touch attributes that merely end in id", () => {
		expect(prefixIds(`<g data-id="x" id="a"/>`, "p-", "t")).toBe(`<g data-id="x" id="p-a"/>`);
	});

	test("throws on a reference to a missing id", () => {
		expect(() => prefixIds(`<path fill="url(#nope)"/>`, "p-", "t")).toThrow("missing id");
	});
});

describe("parseSvg safety checks", () => {
	const wrap = (inner: string, rootAttrs = "") =>
		`<svg viewBox="0 0 10 10" ${rootAttrs}>${inner}</svg>`;

	test("accepts local id references", () => {
		expect(() =>
			parseSvg(wrap(`<defs><path id="a"/></defs><use href="#a"/><use xlink:href="#a"/>`), "t"),
		).not.toThrow();
	});

	const rejected: [string, string][] = [
		["script element", wrap("<script>alert(1)</script>")],
		["foreignObject", wrap("<foreignObject><div/></foreignObject>")],
		["style element", wrap("<style>path{fill:red}</style>")],
		["event handler", wrap(`<path onclick="x()"/>`)],
		["javascript url", wrap(`<a xlink:href="javascript:alert(1)"/>`)],
		["external href", wrap(`<image href="https://example.com/a.png"/>`)],
		["external xlink:href", wrap(`<use xlink:href="other.svg#a"/>`)],
		["root style", wrap("<path/>", 'style="fill:red"')],
		["root class", wrap("<path/>", 'class="logo"')],
	];
	for (const [name, source] of rejected) {
		test(`rejects ${name}`, () => {
			expect(() => parseSvg(source, "bad.svg")).toThrow("bad.svg");
		});
	}
});

describe("generated components", () => {
	test("no id or reference is left without the logo prefix, and ids never collide", async () => {
		const { components } = await build();
		const seen = new Map<string, string>();

		for (const name of components) {
			const source = await readFile(join(REACT_DIR, `${name}.js`), "utf8");
			const markup = JSON.parse(/"markup":("(?:[^"\\]|\\.)*")/.exec(source)?.[1] ?? '""') as string;

			for (const [, , id] of markup.matchAll(/\sid=(["'])(.*?)\1/g)) {
				expect(id.startsWith("khz-"), `${name}: ${id}`).toBe(true);
				expect(seen.get(id), `${id} used by ${name} and ${seen.get(id)}`).toBeUndefined();
				seen.set(id, name);
			}
			for (const [, ref] of markup.matchAll(/url\(\s*["']?#([^)"']+)/g)) {
				expect(ref.startsWith("khz-"), `${name}: url(#${ref})`).toBe(true);
			}
			for (const [, ref] of markup.matchAll(/href=["']#(.*?)["']/g)) {
				expect(ref.startsWith("khz-"), `${name}: href #${ref}`).toBe(true);
			}
		}
		expect(seen.size).toBeGreaterThan(0);
	});
});
