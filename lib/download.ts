export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

// Patch the SVG with explicit dimensions so Chrome/Safari render it at the
// correct size instead of defaulting to 300×150 and stretching on drawImage.
function prepareSvgForCanvas(svgString: string, width: number, height: number): string {
	return svgString.replace(/<svg([^>]*)>/, (_match, attrs: string) => {
		const cleaned = attrs
			.replace(/\s+width="[^"]*"/g, "")
			.replace(/\s+height="[^"]*"/g, "")
			.replace(/\s+preserveAspectRatio="[^"]*"/g, "");
		return `<svg${cleaned} width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">`;
	});
}

export function convertSvgToImage(
	svgString: string,
	width: number,
	height: number,
	format: "image/png" | "image/webp",
): Promise<string> {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		canvas.width = width;
		canvas.height = height;

		const patchedSvg = prepareSvgForCanvas(svgString, width, height);
		const svgBlob = new Blob([patchedSvg], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(svgBlob);

		img.onload = () => {
			if (!ctx) {
				reject(new Error("Could not get canvas context"));
				return;
			}

			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(img, 0, 0, width, height);
			const dataUrl = canvas.toDataURL(format);
			URL.revokeObjectURL(url);
			resolve(dataUrl);
		};

		img.onerror = (e) => {
			URL.revokeObjectURL(url);
			reject(e);
		};

		img.src = url;
	});
}
