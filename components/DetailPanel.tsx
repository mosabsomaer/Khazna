import {
	Check,
	Circle,
	Contrast,
	Copy,
	Download,
	FileCode,
	Image as ImageIcon,
	LayoutGrid,
	Loader2,
	Palette,
	Stamp,
	Type,
	X,
} from "lucide-react";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSound } from "../hooks/useSound";
import { useUIContext } from "../hooks/useUIContext";
import { convertSvgToImage, downloadBlob } from "@/lib/download";
import { generateCode } from "@/lib/generators";
import { FigmaLink } from "./FigmaLink";
import { CodeBlock } from "./ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const FORMAT_TO_LANG: Record<string, string> = {
	React: "tsx",
	Vue: "vue",
	Svelte: "svelte",
	HTML: "html",
};

const MOCK_SVG_CONTENT = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function ColorPill({ color }: { color: string }): JSX.Element {
	const [copied, setCopied] = useState(false);
	const { t } = useTranslation();
	const play = useSound();

	function handleCopy(): void {
		play("notification");
		navigator.clipboard.writeText(color);
		setCopied(true);
		setTimeout(() => setCopied(false), 600);
	}

	const isLight = useMemo(() => {
		const hex = color.replace("#", "");
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 155;
	}, [color]);

	return (
		<button
			onClick={handleCopy}
			className="flex items-center justify-center px-4 py-2 rounded-full border border-black/10 dark:border-white/10 shadow-sm transition-all hover:scale-105 active:scale-95"
			style={{ backgroundColor: color }}
			title={t("common.clickToCopy")}
		>
			<span
				dir="ltr"
				className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? "text-black/80" : "text-white"}`}
			>
				{copied ? t("common.copied") : color}
			</span>
		</button>
	);
}

function makeWhiteSvg(svg: string): string {
	return svg
		.replace(/fill="(?!none)[^"]*"/g, 'fill="white"')
		.replace(/stroke="(?!none)[^"]*"/g, 'stroke="white"');
}

function makeBlackSvg(svg: string): string {
	return svg
		.replace(/fill="(?!none)[^"]*"/g, 'fill="black"')
		.replace(/stroke="(?!none)[^"]*"/g, 'stroke="black"');
}

export function DetailPanel(): JSX.Element | null {
	const {
		selectedItem,
		isSidebarOpen,
		closeSidebar,
		colorMode,
		setColorMode,
		logoStyle,
		setLogoStyle,
		getPreviewLogoUrl,
		hasMonoAsset,
	} = useUIContext();
	const { t } = useTranslation();
	const play = useSound();
	const [codeFormat, setCodeFormat] = useState("React");
	const [copied, setCopied] = useState(false);
	const [cdnCopied, setCdnCopied] = useState<"branded" | "logomark" | null>(null);
	const [svgContent, setSvgContent] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState<string | null>(null);

	const resolvedUrl = selectedItem ? getPreviewLogoUrl(selectedItem) : "";
	const usingMonoAsset = !!selectedItem && hasMonoAsset(selectedItem) && colorMode !== "colored";
	const cdnBrandedUrl = selectedItem ? `https://khazna.ly${selectedItem.logoUrl}` : "";
	const cdnLogomarkUrl = selectedItem?.logomarkUrl ? `https://khazna.ly${selectedItem.logomarkUrl}` : "";

	useEffect(() => {
		async function fetchSvg(): Promise<void> {
			if (!resolvedUrl) return;

			try {
				if (resolvedUrl.endsWith(".svg")) {
					const response = await fetch(resolvedUrl);
					const text = await response.text();
					setSvgContent(text);
				} else {
					setSvgContent(MOCK_SVG_CONTENT);
				}
			} catch (err) {
				console.error("Failed to fetch SVG", err);
				setSvgContent(MOCK_SVG_CONTENT);
			}
		}

		fetchSvg();
		setCopied(false);
		setIsProcessing(null);
	}, [resolvedUrl]);

	// When switching to an item that doesn't support mono, drop back to colored
	// so the preview doesn't render a forced black/white version.
	useEffect(() => {
		if (selectedItem?.disableMono && colorMode !== "colored") {
			setColorMode("colored");
		}
	}, [selectedItem, colorMode, setColorMode]);

	const activeSvg = useMemo(() => {
		if (!svgContent) return "";
		// With a hand-crafted black asset, the fetched SVG is already pure black.
		// Invert to white when needed; otherwise use as-is.
		if (usingMonoAsset) {
			return colorMode === "white" ? makeWhiteSvg(svgContent) : svgContent;
		}
		// Fallback: regex-transform a colored SVG. Works for solid-color logos;
		// may look hollow on logos with internal white fills.
		if (colorMode === "white") return makeWhiteSvg(svgContent);
		if (colorMode === "black") return makeBlackSvg(svgContent);
		return svgContent;
	}, [svgContent, colorMode, usingMonoAsset]);

	const generatedCode = useMemo(() => {
		if (!activeSvg || !selectedItem) return "";
		return generateCode(codeFormat, activeSvg, selectedItem.name);
	}, [activeSvg, codeFormat, selectedItem]);

	function handleCdnCopy(variant: "branded" | "logomark"): void {
		play("notification");
		navigator.clipboard.writeText(variant === "logomark" ? cdnLogomarkUrl : cdnBrandedUrl);
		setCdnCopied(variant);
		setTimeout(() => setCdnCopied(null), 1500);
	}

	function handleCopy(): void {
		play("notification");
		navigator.clipboard.writeText(generatedCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 600);
	}

	async function handleDownload(format: string): Promise<void> {
		if (!selectedItem || !activeSvg || isProcessing) return;

		play("celebration");
		setIsProcessing(format);

		const colorSuffix = colorMode !== "colored" ? `-${colorMode}` : "";
		const styleSuffix = logoStyle === "logomark" ? "-logomark" : "";
		const variantSuffix = `${colorSuffix}${styleSuffix}`;
		const filename = `${selectedItem.id}-${selectedItem.name.toLowerCase().replace(/\s+/g, "-")}${variantSuffix}`;

		try {
			if (format === "SVG") {
				const blob = new Blob([activeSvg], { type: "image/svg+xml" });
				downloadBlob(blob, `${filename}.svg`);
			} else {
				const mimeType = format === "PNG" ? "image/png" : "image/webp";
				const dataUrl = await convertSvgToImage(activeSvg, 1024, 1024, mimeType);
				const res = await fetch(dataUrl);
				const blob = await res.blob();
				downloadBlob(blob, `${filename}.${format.toLowerCase()}`);
			}
		} catch (e) {
			console.error("Download failed", e);
			alert(t("sidebar.downloadFailed"));
		} finally {
			setIsProcessing(null);
		}
	}

	if (!isSidebarOpen) return null;

	return (
		<aside
			className={`
      fixed inset-y-0 end-0 z-50
      w-full md:w-[400px]
      bg-background border-s border-border
      transform transition-transform duration-300 ease-in-out
      flex flex-col shadow-2xl shadow-black/20 dark:shadow-black
      ${isSidebarOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"}
    `}
		>
			{/* Header */}
			<div className="h-16 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur z-10">
				<h2 className="text-sm font-semibold text-dim uppercase tracking-wider flex items-center gap-2">
					<LayoutGrid size={14} /> {t("sidebar.details")}
				</h2>
				<button
					onClick={() => { play("swipe"); closeSidebar(); }}
					className="p-2 text-muted-subtle hover:text-primary hover:bg-surface-hover rounded-full transition-colors outline-none focus:bg-surface-hover"
				>
					<X size={20} />
				</button>
			</div>

			{selectedItem ? (
				<div className="flex-1 overflow-y-auto">
					{/* Preview Area — background adapts to keep logos always visible */}
					<div className={`relative aspect-square w-full border-b border-border flex items-center justify-center p-12 overflow-hidden group ${
						colorMode === "black" ? "bg-white" :
						colorMode === "white" ? "bg-zinc-900" :
						"bg-surface"
					}`}>
						<div
							className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.03] dark:invert"
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1' fill='%23000'/%3E%3Ccircle cx='13' cy='13' r='1' fill='%23000'/%3E%3C/g%3E%3C/svg%3E")`,
							}}
						/>

						<img
							src={resolvedUrl}
							alt={t(`entityNames.${selectedItem.id}`)}
							className={`relative z-10 w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 ${
								usingMonoAsset
									? colorMode === "white" ? "invert" : ""
									: colorMode === "black" ? "brightness-0"
									: colorMode === "white" ? "brightness-0 invert"
									: ""
							}`}
						/>
					</div>

					<div className="p-6 space-y-8">
						{/* Info Header */}
						<div>
							<div className="flex items-center gap-2 mb-4">
								<h1 className="text-2xl font-bold text-primary me-1">
									{t(`entityNames.${selectedItem.id}`)}
								</h1>
								{selectedItem.figmaUrl && (
									<FigmaLink
										href={selectedItem.figmaUrl}
										tooltipPosition="bottom"
										className="bg-surface-hover/50"
									/>
								)}
								<div className="flex items-center gap-1 ms-auto">
									{/* Logo style: Stamp = logomark, Type = branded */}
									<button
										onClick={() => { play("tap"); setLogoStyle(logoStyle === "branded" ? "logomark" : "branded"); }}
										title={logoStyle === "branded" ? t("home.logomark") : t("home.branded")}
										className={`w-7 h-7 flex items-center justify-center rounded-md border transition-all ${
											logoStyle === "logomark"
												? "bg-surface-hover border-border-subtle text-primary"
												: "bg-surface border-border text-muted-foreground hover:text-primary hover:bg-surface-hover"
										}`}
									>
										{logoStyle === "logomark" ? <Stamp size={13} /> : <Type size={13} />}
									</button>
									{/* Color mode cycle: colored → black → white → colored */}
									{!selectedItem.disableMono && (
									<button
										onClick={() => { play("tap"); setColorMode(colorMode === "colored" ? "black" : colorMode === "black" ? "white" : "colored"); }}
										title={colorMode === "colored" ? t("home.bw") : colorMode === "black" ? t("home.white") : t("home.colored")}
										className={`w-7 h-7 flex items-center justify-center rounded-md border transition-all ${
											colorMode !== "colored"
												? "bg-surface-hover border-border-subtle text-primary"
												: "bg-surface border-border text-muted-foreground hover:text-primary hover:bg-surface-hover"
										}`}
									>
										{colorMode === "black" ? <Contrast size={13} /> : colorMode === "white" ? <Circle size={13} /> : <Palette size={13} />}
									</button>
									)}
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								{selectedItem.colors.map((color, idx) => (
									<ColorPill key={idx} color={color} />
								))}
							</div>
						</div>

						{/* Tabs */}
						<Tabs defaultValue="download">
							<TabsList className="w-full rounded-none border-b border-border bg-transparent p-0 h-auto">
								<TabsTrigger
									value="download"
									onClick={() => play("type")}
									className="cursor-pointer flex-1 rounded-none border-b-2 border-transparent pb-3 pt-0 px-0 text-sm font-medium text-muted-subtle shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-muted-foreground gap-2"
								>
									<ImageIcon size={16} /> {t("sidebar.assets")}
								</TabsTrigger>
								<TabsTrigger
									value="code"
									onClick={() => play("type")}
									className="cursor-pointer flex-1 rounded-none border-b-2 border-transparent pb-3 pt-0 px-0 text-sm font-medium text-muted-subtle shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-muted-foreground gap-2"
								>
									<FileCode size={16} /> {t("sidebar.code")}
								</TabsTrigger>
							</TabsList>

							<TabsContent value="download" className="mt-6">
								<div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
									{["SVG", "PNG", "WebP"].map((fmt) => (
										<button
											key={fmt}
											onClick={() => handleDownload(fmt)}
											disabled={!!isProcessing}
											className="group w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-surface/30 hover:bg-surface hover:border-border-subtle active:scale-[0.98] transition-all duration-200 outline-none focus:ring-1 focus:ring-ring"
										>
											<span className="text-sm font-medium text-dim group-hover:text-primary transition-colors">
												{fmt}
											</span>

											<div className="text-dim group-hover:text-primary transition-colors">
												{isProcessing === fmt ? (
													<Loader2 size={18} className="animate-spin" />
												) : (
													<Download size={18} />
												)}
											</div>
										</button>
									))}
								</div>
							</TabsContent>

							<TabsContent value="code" className="mt-6">
								<div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
									<div className="grid grid-cols-4 gap-2">
										{["React", "Vue", "Svelte", "HTML"].map((fmt) => (
											<button
												key={fmt}
												onClick={() => { play("tap"); setCodeFormat(fmt); }}
												className={`
                          cursor-pointer py-2 text-[10px] sm:text-xs font-medium rounded-lg border transition-all duration-200
                          ${
													codeFormat === fmt
														? "bg-accent-bg text-accent border-accent-bg shadow-lg"
														: "bg-transparent text-dim border-border hover:border-border-subtle hover:bg-surface"
												}
                        `}
											>
												{fmt}
											</button>
										))}
									</div>

									<div
										className="relative group cursor-pointer overflow-hidden rounded-lg border border-border bg-elevated"
										onClick={handleCopy}
									>
										<CodeBlock
											code={generatedCode}
											language={FORMAT_TO_LANG[codeFormat]}
											className="p-4 font-mono text-xs overflow-x-auto h-64 leading-relaxed grayscale"
										/>

										<div
											className={`
                        absolute inset-0 bg-elevated/80 backdrop-blur-[2px]
                        flex items-center justify-center gap-2
                        transition-opacity duration-200
                        ${copied ? "opacity-100 bg-primary/10" : "opacity-0 group-hover:opacity-100"}
                    `}
										>
											{copied ? (
												<>
													<Check size={20} className="text-primary" />
													<span className="text-primary font-semibold">
														{t("common.copied")}
													</span>
												</>
											) : (
												<>
													<Copy size={20} className="text-primary" />
													<span className="text-primary font-semibold">
														{t("common.clickToCopy")}
													</span>
												</>
											)}
										</div>
									</div>

									{/* CDN URL block */}
									<div className="rounded-xl border border-border overflow-hidden">
										<div className="px-3 py-2 border-b border-border bg-surface/50">
											<span className="text-[10px] font-semibold text-dim uppercase tracking-widest">
												{t("sidebar.cdnUrl")}
											</span>
										</div>
										{(() => {
											const variant = logoStyle === "logomark" ? "logomark" : "branded";
											const url = variant === "logomark" ? cdnLogomarkUrl : cdnBrandedUrl;
											const label = variant === "logomark" ? t("home.logomark") : t("home.branded");

											return url ? (
												<button
													onClick={() => handleCdnCopy(variant)}
													title={t("common.clickToCopy")}
													className="w-full flex items-center gap-3 px-3 py-2.5 bg-surface/30 hover:bg-surface active:scale-[0.99] transition-all duration-200 outline-none focus:bg-surface group border-t border-border"
												>
													<span className="text-[10px] font-medium text-dim shrink-0 w-14 text-start">
														{label}
													</span>
													<span dir="ltr" className="flex-1 text-left text-xs font-mono text-muted-foreground truncate group-hover:text-primary transition-colors">
														{url}
													</span>
													<span className="shrink-0 text-dim group-hover:text-primary transition-colors">
														{cdnCopied === variant ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
													</span>
												</button>
											) : null;
										})()}
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			) : (
				<div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-subtle">
					<div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 ring-1 ring-border">
						<LayoutGrid size={24} className="opacity-50" />
					</div>
					<p className="text-sm font-medium text-muted">{t("sidebar.noLogoSelected")}</p>
					<p className="text-xs text-dim mt-1">{t("sidebar.selectFromGrid")}</p>
				</div>
			)}
		</aside>
	);
}
