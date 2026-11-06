import i18n from "../i18n";
import { getPwaState, IS_IOS } from "./pwa";
import { showToast } from "./toast";

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

/**
 * Downloads a file, except in the installed iOS app: there a download opens a preview with no
 * way back, so the share sheet saves it instead (Save Image, Save to Files).
 */
export async function saveFile(blob: Blob, filename: string): Promise<void> {
	const file = new File([blob], filename, { type: blob.type });
	if (!IS_IOS || !getPwaState().standalone || !navigator.canShare?.({ files: [file] })) {
		downloadBlob(blob, filename);
		return;
	}
	try {
		await navigator.share({ files: [file] });
	} catch (error) {
		// Making the file can outlast the tap that asked for it, so ask for one more.
		if ((error as DOMException).name === "NotAllowedError") {
			showToast(i18n.t("pwa.fileReady"), {
				action: {
					label: i18n.t("pwa.save"),
					onClick: () => {
						navigator.share({ files: [file] }).catch(() => {});
					},
				},
			});
		}
	}
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

export const CAN_ENCODE_WEBP = (() => {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 1;
	return canvas.toDataURL("image/webp").startsWith("data:image/webp");
})();

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
