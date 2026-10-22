import { existsSync, readdirSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..", "public", "screenshots");
const THUMB_WIDTH = 480;
const DISPLAY_WIDTH = 1080;
const force = process.argv.includes("--force");

const kb = (bytes: number): string => `${(bytes / 1024).toFixed(0)} KB`;

let written = 0;
let skipped = 0;
let pngBytes = 0;
let thumbBytes = 0;

for (const bank of readdirSync(ROOT, { withFileTypes: true })) {
	if (!bank.isDirectory()) continue;
	const dir = join(ROOT, bank.name);

	for (const file of readdirSync(dir)) {
		if (!file.endsWith(".png")) continue;
		const name = file.slice(0, -".png".length);
		const png = join(dir, file);
		const display = join(dir, `${name}.webp`);
		const thumb = join(dir, "thumbs", `${name}.webp`);
		pngBytes += statSync(png).size;

		if (!existsSync(display)) {
			await sharp(png)
				.resize({ width: DISPLAY_WIDTH, withoutEnlargement: true })
				.webp({ quality: 80, effort: 6 })
				.toFile(display);
			written++;
			console.log(`display  ${bank.name}/${name}.webp`);
		}

		if (existsSync(thumb) && !force) {
			skipped++;
		} else {
			await mkdir(join(dir, "thumbs"), { recursive: true });
			await sharp(png)
				.resize({ width: THUMB_WIDTH, withoutEnlargement: true })
				.webp({ quality: 75, effort: 6 })
				.toFile(thumb);
			written++;
		}
		thumbBytes += statSync(thumb).size;
	}
}

console.log(
	`${written} written, ${skipped} already there. PNG originals ${kb(pngBytes)}, thumbs ${kb(thumbBytes)}`,
);
