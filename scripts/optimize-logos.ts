import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { optimize } from "svgo";

const ROOT = join(import.meta.dirname, "..", "public", "cdn", "v1", "logos");
const check = process.argv.includes("--check");

// lib/generators.ts and DetailPanel recolour logos with regexes over fill/stroke
// attributes and <mask> blocks, so only plugins that leave that structure alone are enabled.
// No id minification: several logos can be inlined on one page by the code snippets.
const PLUGINS = [
	"removeDoctype",
	"removeXMLProcInst",
	"removeComments",
	"removeMetadata",
	"removeEditorsNSData",
	"cleanupAttrs",
	"removeEmptyAttrs",
	{ name: "cleanupIds", params: { minify: false } },
	{ name: "cleanupNumericValues", params: { floatPrecision: 3 } },
	{ name: "convertPathData", params: { floatPrecision: 3 } },
	"convertTransform",
] as const;

function* svgFiles(dir: string): Generator<string> {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* svgFiles(path);
		else if (entry.name.endsWith(".svg")) yield path;
	}
}

let before = 0;
let after = 0;
const pending: string[] = [];

for (const file of svgFiles(ROOT)) {
	const source = readFileSync(file, "utf8");
	const { data } = optimize(source, {
		path: file,
		multipass: true,
		js2svg: { pretty: true, indent: "\t", eol: "lf" },
		plugins: [...PLUGINS],
	});
	before += Buffer.byteLength(source);
	if (data.length < source.length) {
		after += Buffer.byteLength(data);
		pending.push(file);
		if (!check) writeFileSync(file, data);
	} else {
		after += Buffer.byteLength(source);
	}
}

const kb = (bytes: number): string => `${(bytes / 1024).toFixed(0)} KB`;

if (check) {
	for (const file of pending) console.log(`not optimized: ${file.slice(ROOT.length + 1)}`);
	console.log(`${pending.length} files can shrink, ${kb(before)} to ${kb(after)}`);
	process.exit(pending.length > 0 ? 1 : 0);
}

console.log(`${pending.length} files rewritten, ${kb(before)} to ${kb(after)}`);
