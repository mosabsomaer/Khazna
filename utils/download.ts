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

		const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
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
