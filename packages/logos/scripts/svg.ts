export interface ParsedSvg {
	viewBox: string;
	width: number;
	height: number;
	/** Root attributes other than size, viewBox and namespaces, e.g. `fill="none"`. */
	attrs: Record<string, string>;
	inner: string;
}

const ROOT_ATTRS_HANDLED_ELSEWHERE = new Set(["width", "height", "viewBox"]);

function toCamelCase(name: string): string {
	return name.replace(/[-:]([a-z])/g, (_, char: string) => char.toUpperCase());
}

const UNSAFE_PATTERNS: [RegExp, string][] = [
	[/<script(?=[\s>/])/i, "<script>"],
	[/<foreignObject(?=[\s>/])/i, "<foreignObject>"],
	[/<style(?=[\s>/])/i, "<style>"],
	[/\son\w+\s*=/i, "an event handler attribute"],
	[/javascript:/i, "a javascript: URL"],
	[
		/(?:xlink:)?href\s*=\s*(["'])(?!#|data:image\/(?:png|jpe?g|gif|webp);base64,)/i,
		"an href that is neither a local #id reference nor an embedded image",
	],
];

function assertSafe(source: string, label: string): void {
	for (const [pattern, what] of UNSAFE_PATTERNS) {
		if (pattern.test(source)) throw new Error(`${label}: contains ${what}`);
	}
}

export function parseSvg(source: string, label: string): ParsedSvg {
	assertSafe(source, label);
	const open = /<svg\b([^>]*)>/.exec(source);
	const closeAt = source.lastIndexOf("</svg>");
	if (!open || closeAt < open.index || open[1].trimEnd().endsWith("/")) {
		throw new Error(`${label}: not a well-formed <svg> document`);
	}

	const rootAttrs: Record<string, string> = {};
	for (const [, name, value] of open[1].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
		rootAttrs[name] = value;
	}

	const viewBox = rootAttrs.viewBox;
	if (!viewBox) throw new Error(`${label}: root <svg> has no viewBox`);
	const [, , vbWidth, vbHeight] = viewBox
		.trim()
		.split(/[\s,]+/)
		.map(Number);
	if (!(vbWidth > 0 && vbHeight > 0)) throw new Error(`${label}: invalid viewBox "${viewBox}"`);

	for (const name of ["style", "class"]) {
		if (name in rootAttrs) throw new Error(`${label}: root <svg> has a ${name} attribute`);
	}

	const attrs: Record<string, string> = {};
	for (const [name, value] of Object.entries(rootAttrs)) {
		if (name.startsWith("xmlns") || ROOT_ATTRS_HANDLED_ELSEWHERE.has(name)) continue;
		attrs[toCamelCase(name)] = value;
	}

	return {
		viewBox,
		width: Number.parseFloat(rootAttrs.width) || vbWidth,
		height: Number.parseFloat(rootAttrs.height) || vbHeight,
		attrs,
		inner: source.slice(open.index + open[0].length, closeAt).trim(),
	};
}

/**
 * Prefixes every id and each reference to it so two logos on one page cannot collide.
 * Throws on a reference to an id that does not exist, since it would stay broken after
 * prefixing.
 */
export function prefixIds(markup: string, prefix: string, label: string): string {
	const ids = new Set<string>();
	for (const [, , id] of markup.matchAll(/\sid=(["'])(.*?)\1/g)) ids.add(id);

	const prefixed = (id: string): string => {
		if (!ids.has(id)) throw new Error(`${label}: reference to missing id "${id}"`);
		return `${prefix}${id}`;
	};

	return markup
		.replace(/(\sid=)(["'])(.*?)\2/g, (_, head: string, quote: string, id: string) => {
			return `${head}${quote}${prefix}${id}${quote}`;
		})
		.replace(/url\(\s*(["']?)#([^)"']+)\1\s*\)/g, (_, quote: string, id: string) => {
			return `url(${quote}#${prefixed(id)}${quote})`;
		})
		.replace(/(href=)(["'])#(.*?)\2/g, (_, head: string, quote: string, id: string) => {
			return `${head}${quote}#${prefixed(id)}${quote}`;
		});
}
