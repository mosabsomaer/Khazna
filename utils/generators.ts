interface SvgInfo {
	viewBox: string;
	content: string;
}

function extractSvgInfo(svgString: string): SvgInfo {
	const parser = new DOMParser();
	const doc = parser.parseFromString(svgString, "image/svg+xml");
	const svg = doc.querySelector("svg");

	if (!svg) return { viewBox: "0 0 24 24", content: "" };

	const viewBox = svg.getAttribute("viewBox") || "0 0 24 24";
	const content = svg.innerHTML.trim();

	return { viewBox, content };
}

function replaceNonNoneFills(content: string, replacement: string): string {
	return content.replace(/fill="[^"]*"/g, (match) =>
		match.includes("none") ? match : replacement,
	);
}

export function generateCode(
	format: string,
	svgString: string,
	componentName: string = "Icon",
): string {
	const { viewBox, content } = extractSvgInfo(svgString);
	const pascalName = componentName.replace(/[^a-zA-Z0-9]/g, "");

	switch (format) {
		case "React": {
			const cleanContent = replaceNonNoneFills(content, "fill={color}")
				.replace(/fill-opacity="[^"]*"/g, "")
				.replace(/class=/g, "className=");

			return `export const ${pascalName} = ({ size = 24, color = "#000000" }) => {
  return (
    <svg width={size} height={size} viewBox="${viewBox}" fill={color} xmlns="http://www.w3.org/2000/svg">
      ${cleanContent}
    </svg>
  );
};`;
		}

		case "Vue": {
			const vueContent = replaceNonNoneFills(content, ':fill="color"');

			return `<script setup>
  defineProps({ size: { type: Number, default: 24 }, color: { type: String, default: "#000000" } });
</script>

<template>
  <svg :width="size" :height="size" viewBox="${viewBox}" :fill="color" xmlns="http://www.w3.org/2000/svg">
    ${vueContent}
  </svg>
</template>`;
		}

		case "Svelte": {
			const svelteContent = replaceNonNoneFills(content, "fill={color}");

			return `<script>
  export let size = 24;
  export let color = "#000000";
</script>

<svg width="{size}" height="{size}" viewBox="${viewBox}" fill={color} xmlns="http://www.w3.org/2000/svg">
  ${svelteContent}
</svg>`;
		}

		default:
			return `<svg width="24" height="24" viewBox="${viewBox}" fill="#000000" xmlns="http://www.w3.org/2000/svg">
  ${content}
</svg>`;
	}
}
