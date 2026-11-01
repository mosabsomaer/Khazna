import { beforeAll, expect, test } from "bun:test";
import { join } from "node:path";
import { build } from "../scripts/build.ts";

let files: string[];

beforeAll(async () => {
	await build();
	const run = Bun.spawnSync(["npm", "pack", "--dry-run", "--json", "--ignore-scripts"], {
		cwd: join(import.meta.dir, ".."),
		stdout: "pipe",
		stderr: "pipe",
	});
	expect(run.exitCode, run.stderr.toString()).toBe(0);
	const [pack] = JSON.parse(run.stdout.toString()) as { files: { path: string }[] }[];
	files = pack.files.map((file) => file.path);
});

test("the tarball ships dist, the readme, the licence and the manifest", () => {
	for (const path of [
		"package.json",
		"README.md",
		"LICENSE",
		"dist/index.js",
		"dist/index.d.ts",
		"dist/react/index.js",
		"dist/react/index.d.ts",
		"dist/svg/banks/sahara-bank.svg",
	]) {
		expect(files).toContain(path);
	}
});

test("the tarball leaves out sources, scripts and tests", () => {
	const allowed = /^(dist\/|package\.json$|README\.md$|LICENSE$)/;
	expect(files.filter((path) => !allowed.test(path))).toEqual([]);
});
