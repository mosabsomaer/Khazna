import { beforeAll, describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type ComponentType, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "../scripts/build.ts";

const DIST = join(import.meta.dir, "../dist");
const SOURCE_SVG = join(import.meta.dir, "../../../public/cdn/v1/logos");

type Logos = Record<string, ComponentType<Record<string, unknown>>>;

let logos: Logos;

beforeAll(async () => {
	await build();
	logos = await import(join(DIST, "react/index.js"));
});

function viewBoxOf(svg: string): string | undefined {
	return /<svg\b[^>]*\sviewBox="([^"]*)"/.exec(svg)?.[1];
}

function render(name: string, props: Record<string, unknown> = {}): string {
	return renderToStaticMarkup(createElement(logos[name], props));
}

describe("react components", () => {
	test("render an inline svg with the original viewBox and artwork", async () => {
		const html = render("SaharaBankLogo");
		const original = await readFile(join(SOURCE_SVG, "banks/sahara-bank.svg"), "utf8");

		expect(html.startsWith("<svg")).toBe(true);
		expect(viewBoxOf(html)).toBe(viewBoxOf(original));
		const firstPath = /\sd="([^"]*)"/.exec(original)?.[1];
		expect(firstPath).toBeTruthy();
		expect(html).toContain(`d="${firstPath}"`);
		expect(html).toContain('aria-hidden="true"');
		expect(html).not.toContain("<title>");
	});

	test("title adds a <title> and role=img instead of aria-hidden", () => {
		const html = render("SaharaBankLogo", { title: "Sahara Bank" });
		expect(html).toContain("<title>Sahara Bank</title>");
		expect(html).toContain('role="img"');
		expect(html).not.toContain("aria-hidden");
	});

	test("title is escaped", () => {
		expect(render("SaharaBankLogo", { title: "<b>&" })).toContain("<title>&lt;b&gt;&amp;</title>");
	});

	test("size sets the height and derives the width from the aspect ratio", () => {
		const html = render("SaharaBankLogo", { size: 100 });
		expect(html).toContain('height="100"');
		expect(html).toContain('width="378"');
	});

	test("without size the original dimensions are kept", () => {
		const html = render("SaharaBankLogo");
		expect(html).toContain('width="189"');
		expect(html).toContain('height="50"');
	});

	test("svg props are forwarded and win over defaults", () => {
		const html = render("SaharaBankLogo", { className: "logo", width: 10, height: 20 });
		expect(html).toContain('class="logo"');
		expect(html).toContain('width="10"');
		expect(html).toContain('height="20"');
	});

	test("black and logomark variants exist only where the site has them", () => {
		expect(logos.BcdBankLogoBlack).toBeDefined();
		expect(logos.BcdBankLogomarkBlack).toBeDefined();
		expect(logos.SaharaBankLogomark).toBeDefined();
		expect(logos.SaharaBankLogoBlack).toBeUndefined();
	});

	test("every component renders and keeps the viewBox of its source file", async () => {
		const { logos: meta } = await import(join(DIST, "index.js"));
		let checked = 0;

		for (const logo of meta) {
			const pascal = logo.id
				.split("-")
				.map((part: string) => part[0].toUpperCase() + part.slice(1))
				.join("");
			for (const [variant, path] of Object.entries<string>(logo.svg)) {
				const name = `${pascal}${variant[0].toUpperCase()}${variant.slice(1)}`;
				const original = await readFile(join(SOURCE_SVG, path.replace("svg/", "")), "utf8");
				expect(viewBoxOf(render(name)), name).toBe(viewBoxOf(original));
				checked++;
			}
		}
		expect(checked).toBe(Object.keys(logos).length);
	});

	test("two different logos on one page share no ids", () => {
		const html = renderToStaticMarkup(
			createElement(
				"div",
				null,
				createElement(logos.SaharaBankLogo),
				createElement(logos.BcdBankLogo),
				createElement(logos.BcdBankLogoBlack),
			),
		);
		const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
