import { ChevronLeft, ChevronRight } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { BANKS, MOCK_SCREENSHOTS } from "../constants";
import { useSound } from "../hooks/useSound";
import type { Bank } from "../types";

function AppCard({ app }: { app: Bank }): JSX.Element {
	const { t } = useTranslation();
	const play = useSound();
	const screenshots = MOCK_SCREENSHOTS[app.id] || [];
	const screenCount = screenshots.length;
	const hasScreens = screenCount > 0;
	const [currentSlide, setCurrentSlide] = useState(0);

	function nextSlide(e: React.MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();
		play("swipe");
		setCurrentSlide((prev) => (prev + 1) % screenshots.length);
	}

	function prevSlide(e: React.MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();
		play("swipe");
		setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
	}

	return (
		<Link
			to={`/apps/${app.id}`}
			onClick={() => play("select")}
			className="group flex flex-col gap-3"
		>
			{/* Card Preview Container */}
			<div className="relative aspect-9/19 w-full bg-surface border border-border rounded-3xl overflow-hidden group-hover:border-border-subtle transition-all duration-300 shadow-sm hover:shadow-md">
				{hasScreens ? (
					<div className="w-full h-full relative bg-surface">
						<div className="absolute inset-0 transition-opacity duration-300">
							<img
								src={screenshots[currentSlide].url}
								alt={`${t(`entityNames.${app.id}`)} ${currentSlide + 1}`}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
						</div>

						{screenCount > 1 && (
							<>
								<button
									onClick={prevSlide}
									className="absolute start-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
								>
									<ChevronLeft size={16} className="rtl:rotate-180" />
								</button>
								<button
									onClick={nextSlide}
									className="absolute end-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
								>
									<ChevronRight size={16} className="rtl:rotate-180" />
								</button>

								{/* Dots Indicator */}
								<div className="absolute bottom-3 start-0 end-0 z-20 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
									{screenshots.slice(0, 5).map((_, idx) => (
										<div
											key={idx}
											className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentSlide ? "bg-white" : "bg-white/40"}`}
										/>
									))}
									{screenshots.length > 5 && (
										<div className="w-1.5 h-1.5 rounded-full bg-white/40" />
									)}
								</div>
							</>
						)}
					</div>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center bg-surface p-6 text-center">
						<img
							src={app.logomarkUrl || app.logoUrl}
							className="w-16 h-16 rounded-xl opacity-20 grayscale mb-4"
							alt=""
						/>
						<span className="text-xs text-dim">{t("common.noScreenshots")}</span>
					</div>
				)}

				{/* Badges */}
				<div className="absolute top-3 start-3 z-30">
					{app.isUpdated && <Badge type="updated" />}
				</div>
			</div>

			{/* Meta Info */}
			<div className="flex items-center gap-3 px-1">
				<div className="rounded-xl bg-surface border border-border overflow-hidden flex-shrink-0 p-2">
					<img
						src={app.logomarkUrl || app.logoUrl}
						alt={t(`entityNames.${app.id}`)}
						className="w-8 h-8 object-contain"
					/>
				</div>
				<div className="flex flex-col">
					<h3 className="text-sm font-semibold text-primary leading-tight group-hover:underline decoration-border-subtle underline-offset-4">
						{t(`entityNames.${app.id}`)}
					</h3>
					<span className="text-xs text-muted-subtle mt-0.5">
						{screenCount} {t("common.screens")}
					</span>
				</div>
			</div>
		</Link>
	);
}

export function AppsPage(): JSX.Element {
	const { t } = useTranslation();

	const apps = BANKS.filter((bank) => bank.hasScreenshots);

	return (
		<div className="pb-20">
			<div className="py-12 border-b border-border/50">
				<h1 className="text-3xl font-bold text-primary mb-2">{t("apps.title")}</h1>
				<p className="text-muted-foreground max-w-2xl">{t("apps.description")}</p>
			</div>

			<section className="py-10">
				{apps.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-12">
						{apps.map((app) => (
							<AppCard key={app.id} app={app} />
						))}
					</div>
				) : (
					<div className="py-20 text-center">
						<p className="text-muted-subtle">{t("apps.noAppsFound")}</p>
					</div>
				)}
			</section>
		</div>
	);
}
