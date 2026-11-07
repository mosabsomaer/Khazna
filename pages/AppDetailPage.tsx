import { ArrowLeft, DownloadCloud, Landmark, Loader2, ZoomIn } from "lucide-react";
import type { JSX } from "react";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useParams } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { saveFile } from "@/lib/download";
import { thumbUrl } from "@/lib/screenshots";
import { showToast } from "@/lib/toast";
import { FallbackImage, ScreenPlaceholder } from "../components/FallbackImage";
import { FigmaLink } from "../components/FigmaLink";
import { ScreenViewer, type ScreenViewerHandle } from "../components/ScreenViewer";
import { BANKS, MOCK_SCREENSHOTS } from "../constants";
import { useBackToClose } from "../hooks/useBackToClose";
import { useSound } from "../hooks/useSound";
import type { Screenshot } from "../types";

function findThumbnail(screen: Screenshot): HTMLElement | null {
	return document.querySelector(`[data-screen-id="${screen.id}"]`);
}

export function AppDetailPage(): JSX.Element {
	const { bankId } = useParams<{ bankId: string }>();
	const { t } = useTranslation();
	const play = useSound();
	const [viewer, setViewer] = useState<{ bankId: string; index: number } | null>(null);
	const [isDownloadingAll, setIsDownloadingAll] = useState(false);
	const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);
	const viewerRef = useRef<ScreenViewerHandle>(null);

	const bank = BANKS.find((b) => b.id === bankId);
	const screenshots = bankId ? MOCK_SCREENSHOTS[bankId] || [] : [];
	const closeViewer = useCallback(() => setViewer(null), []);
	useBackToClose(!!viewer, () => {
		if (viewerRef.current) viewerRef.current.close();
		else setViewer(null);
	});

	const handleDownloadSingle = useCallback(
		async (screen: Screenshot) => {
			if (!bank) return;
			// The full-size PNGs aren't kept on the device.
			if (!navigator.onLine) {
				showToast(t("pwa.needsConnection"), { icon: "offline" });
				return;
			}
			try {
				play("celebration");
				setIsDownloadingSingle(true);
				const response = await fetch(screen.downloadUrl);
				const blob = await response.blob();
				const filename = `${bank.name.toLowerCase().replace(/\s+/g, "-")}-${screen.label.toLowerCase().replace(/\s+/g, "-")}.png`;
				await saveFile(blob, filename);
				trackEvent("screen_download", {
					bank_id: bank.id,
					bank_name: bank.name,
					screen_label: screen.label,
				});
			} catch (error) {
				console.error("Download failed:", error);
				showToast(t("sidebar.downloadImageFailed"), { icon: "error" });
			} finally {
				setIsDownloadingSingle(false);
			}
		},
		[bank, t, play],
	);

	const handleDownloadAll = useCallback(async () => {
		if (!bank || screenshots.length === 0) return;
		if (!navigator.onLine) {
			showToast(t("pwa.needsConnection"), { icon: "offline" });
			return;
		}

		try {
			play("celebration");
			setIsDownloadingAll(true);
			const { default: JSZip } = await import("jszip");
			const zip = new JSZip();
			const folder = zip.folder(bank.name.replace(/\s+/g, "-"));

			const promises = screenshots.map(async (screen) => {
				try {
					const response = await fetch(screen.downloadUrl);
					const blob = await response.blob();
					const filename = screen.downloadUrl.slice(screen.downloadUrl.lastIndexOf("/") + 1);
					folder?.file(filename, blob);
				} catch (err) {
					console.warn(`Failed to fetch ${screen.url}`, err);
				}
			});

			await Promise.all(promises);

			const content = await zip.generateAsync({ type: "blob" });
			const zipName = `${bank.name.toLowerCase().replace(/\s+/g, "-")}-ui-kit.zip`;
			await saveFile(content, zipName);
			trackEvent("ui_kit_download_all", {
				bank_id: bank.id,
				bank_name: bank.name,
				screen_count: screenshots.length,
			});
		} catch (error) {
			console.error("Batch download failed:", error);
			showToast(t("sidebar.zipFailed"), { icon: "error" });
		} finally {
			setIsDownloadingAll(false);
		}
	}, [bank, screenshots, t, play]);

	if (!bank) {
		return <Navigate to="/apps" replace />;
	}

	return (
		<div className="pb-20">
			{/* Header */}
			<div className="py-8 border-b border-border">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<Link
							to="/apps"
							onClick={() => play("select")}
							className="w-10 h-10 flex items-center justify-center rounded-full border border-border hover:bg-surface-hover transition-colors text-muted-foreground hover:text-primary"
						>
							<ArrowLeft size={20} className="rtl:rotate-180" />
						</Link>
						<div className="flex items-center gap-3">
							<FallbackImage
								src={bank.logomarkUrl || bank.logoUrl}
								alt={t(`entityNames.${bank.id}`)}
								className="w-10 h-10 rounded-lg bg-surface object-cover"
								fallback={
									<span className="flex w-10 h-10 items-center justify-center rounded-lg bg-surface text-muted-subtle">
										<Landmark size={18} />
									</span>
								}
							/>
							<div>
								<div className="flex items-center gap-3">
									<h1 className="text-xl font-bold text-primary">{t(`entityNames.${bank.id}`)}</h1>
									{bank.figmaUrl && (
										<FigmaLink href={bank.figmaUrl} tooltipPosition="top" className="bg-surface" />
									)}
								</div>
								<div className="flex items-center gap-2 text-xs text-muted-subtle mt-1">
									<span>
										{screenshots.length} {t("common.screens")}
									</span>

									{screenshots.length > 0 && (
										<>
											<span>&bull;</span>
											<button
												type="button"
												onClick={handleDownloadAll}
												disabled={isDownloadingAll}
												className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
											>
												{isDownloadingAll ? (
													<Loader2 size={10} className="animate-spin" />
												) : (
													<DownloadCloud size={12} />
												)}
												{isDownloadingAll ? t("sidebar.zipping") : t("sidebar.downloadAll")}
											</button>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Gallery */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
				{screenshots.length > 0 ? (
					screenshots.map((screen, index) => (
						<div key={screen.id} className="group flex flex-col gap-3">
							<button
								type="button"
								data-screen-id={screen.id}
								onClick={() => {
									play("select");
									setViewer({ bankId: bank.id, index });
								}}
								className="relative aspect-9/19 w-full rounded-2xl overflow-hidden border border-border bg-surface cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							>
								<FallbackImage
									src={thumbUrl(screen)}
									decoding="async"
									alt={t(`screenshotLabels.${screen.label}`)}
									className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									loadingClassName="bg-surface-hover motion-safe:animate-pulse"
									loading="lazy"
									fallback={<ScreenPlaceholder label={t(`screenshotLabels.${screen.label}`)} />}
								/>

								<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
									<div className="p-3 bg-black/60 rounded-full text-white shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300">
										<ZoomIn size={20} />
									</div>
								</div>
							</button>
							<div className="text-center">
								<h3 className="text-sm font-medium text-muted-foreground">
									{t(`screenshotLabels.${screen.label}`)}
								</h3>
								<p className="text-[10px] text-muted-subtle uppercase tracking-wider mt-0.5">
									{t(`screenshotCategories.${screen.category}`)}
								</p>
							</div>
						</div>
					))
				) : (
					<div className="col-span-full py-20 text-center text-muted-subtle">
						{t("apps.noScreenshotsBank")}
					</div>
				)}
			</div>

			{viewer && viewer.bankId === bankId && (
				<ScreenViewer
					ref={viewerRef}
					screens={screenshots}
					initialIndex={viewer.index}
					isDownloading={isDownloadingSingle}
					onDownload={handleDownloadSingle}
					onClose={closeViewer}
					getThumbnail={findThumbnail}
				/>
			)}
		</div>
	);
}
