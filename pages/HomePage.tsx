import { Stamp, Type } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/Badge";
import { BANKS, PAYMENT_METHODS } from "../constants";
import { useSound } from "../hooks/useSound";
import { useUIContext } from "../hooks/useUIContext";
import type { Bank, PaymentMethod } from "../types";

type Filter = "all" | "banks" | "payment_methods";

export function HomePage(): JSX.Element {
	const { setSelectedItem, selectedItem, logoStyle, setLogoStyle, getLogoUrl } = useUIContext();
	const { t } = useTranslation();
	const play = useSound();
	const [logoSize, setLogoSize] = useState(150);
	const [filter, setFilter] = useState<Filter>("all");

	const filters: { key: Filter; labelKey: string; count: number }[] = [
		{ key: "all", labelKey: "home.all", count: BANKS.length + PAYMENT_METHODS.length },
		{ key: "banks", labelKey: "home.banks", count: BANKS.length },
		{ key: "payment_methods", labelKey: "home.paymentMethods", count: PAYMENT_METHODS.length },
	];

	const allItems: (Bank | PaymentMethod)[] =
		filter === "banks"
			? BANKS
			: filter === "payment_methods"
				? PAYMENT_METHODS
				: [...BANKS, ...PAYMENT_METHODS];

	function renderGrid(items: (Bank | PaymentMethod)[]) {
		return (
			<div className="border border-border rounded-xl overflow-hidden">
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{items.map((item) => {
						const isSelected = selectedItem?.id === item.id;
						const cellBg = isSelected ? "bg-surface-hover" : "bg-surface hover:bg-surface-hover";
						return (
							<button
								type="button"
								key={item.id}
								onClick={() => {
									play("swipe");
									setSelectedItem(item);
								}}
								className={`
                  relative flex flex-col items-center justify-center gap-3
                  border-e border-b border-border
                  p-6 transition-all duration-150 cursor-pointer
                  ${cellBg}
                  ${isSelected ? "ring-1 ring-inset ring-muted-subtle" : ""}
                `}
								style={{ aspectRatio: "1 / 1" }}
							>
								{(item.isNew || item.isUpdated) && (
									<div className="absolute top-3 start-3 flex gap-1">
										{item.isNew && <Badge type="new" />}
										{item.isUpdated && !item.isNew && <Badge type="updated" />}
									</div>
								)}

								<img
									src={getLogoUrl(item)}
									alt={t(`entityNames.${item.id}`)}
									className="object-contain transition-all duration-200"
									style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
								/>

								<span className="text-xs text-muted-subtle font-medium truncate w-full text-center">
									{t(`entityNames.${item.id}`)}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div className="pb-8">
			<div className="py-12 border-b border-border/50">
				<h1 className="text-3xl font-bold text-primary mb-2">{t("home.title")}</h1>
				<p className="text-muted-foreground max-w-2xl">{t("home.description")}</p>
			</div>

			{/* Toolbar — responsive: slider left, controls right (wraps on small screens) */}
			<div className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4 border-b border-border">
				{/* Size Slider */}
				<div className="flex items-center gap-2.5 shrink-0">
					<span className="text-sm font-bold text-muted-foreground">{t("home.size")}</span>
					<input
						type="range"
						min="150"
						max="200"
						value={logoSize}
						onChange={(e) => setLogoSize(Number(e.target.value))}
						className="range-slider w-32 sm:w-40"
					/>
					<span className="text-sm font-bold text-muted-foreground tabular-nums w-7 text-end">
						{logoSize}
					</span>
				</div>

				{/* Controls — pushed right on wide, wraps below on narrow */}
				<div className="flex items-center gap-2 ms-auto shrink-0">
					{/* Logo style toggle: Stamp = logomark, Type = branded */}
					<button
						type="button"
						onClick={() => {
							play("tap");
							setLogoStyle(logoStyle === "branded" ? "logomark" : "branded");
						}}
						title={logoStyle === "branded" ? t("home.logomark") : t("home.branded")}
						className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
							logoStyle === "logomark"
								? "bg-surface-hover border-border-subtle text-primary"
								: "bg-surface border-border text-muted-foreground hover:text-primary hover:bg-surface-hover"
						}`}
					>
						{logoStyle === "logomark" ? <Stamp size={15} /> : <Type size={15} />}
					</button>

					{/* Divider */}
					<div className="h-5 w-px bg-border" />

					{/* Filter tabs */}
					<div className="flex items-center bg-surface rounded-lg border border-border p-1">
						{filters.map((f) => (
							<button
								type="button"
								key={f.key}
								onClick={() => {
									play("tap");
									setFilter(f.key);
								}}
								className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
									filter === f.key
										? "bg-surface-hover text-primary shadow-sm"
										: "text-muted-foreground hover:text-primary"
								}`}
							>
								{t(f.labelKey)}
								<span
									className={`text-[10px] tabular-nums ${
										filter === f.key ? "text-muted-foreground" : "text-muted-subtle"
									}`}
								>
									{f.count}
								</span>
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="mt-6">{renderGrid(allItems)}</div>
		</div>
	);
}
