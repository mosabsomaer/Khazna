import { createElement, forwardRef } from "react";

export function createLogo(displayName, { viewBox, width, height, attrs, markup }) {
	const ratio = width / height;

	const Logo = forwardRef(({ size, title, ...props }, ref) => {
		let dimensions = { width, height };
		if (typeof size === "number") {
			dimensions = { width: Math.round(size * ratio * 100) / 100, height: size };
		} else if (size !== undefined) {
			dimensions = { width: "auto", height: size };
		}

		return createElement(
			"svg",
			{
				xmlns: "http://www.w3.org/2000/svg",
				viewBox,
				...attrs,
				...dimensions,
				...(title ? { role: "img" } : { "aria-hidden": true }),
				ref,
				...props,
			},
			title ? createElement("title", null, title) : null,
			// biome-ignore lint/security/noDangerouslySetInnerHtml: markup is generated at build time from the repo svg files
			createElement("g", { dangerouslySetInnerHTML: { __html: markup } }),
		);
	});
	Logo.displayName = displayName;
	return Logo;
}
