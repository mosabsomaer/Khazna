import type { JSX } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/Badge";
import { BANKS, PAYMENT_METHODS } from "../constants";
import { usePianoSlider } from "../hooks/usePianoSlider";
import { useSound } from "../hooks/useSound";
import { useUIContext } from "../hooks/useUIContext";
import type { Bank, LogoVariant, PaymentMethod } from "../types";

export function HomePage(): JSX.Element {
	const { setSelectedItem, selectedItem, logoVariant, setLogoVariant, getLogoUrl } = useUIContext();
	const { t } = useTranslation();
	const play = useSound();
	const onPianoSliderChange = usePianoSlider();
	const [logoSize, setLogoSize] = useState(100);

	const variants: { key: LogoVariant; labelKey: string }[] = [
		{ key: "mono", labelKey: "home.mono" },
		{ key: "branded", labelKey: "home.branded" },
		{ key: "logomark", labelKey: "home.logomark" },
	];

	const sections: { labelKey: string; count: number; items: (Bank | PaymentMethod)[] }[] = [
		{ labelKey: "home.banks", count: BANKS.length, items: BANKS },
		{ labelKey: "home.paymentMethods", count: PAYMENT_METHODS.length, items: PAYMENT_METHODS },
	];

	function renderGrid(items: (Bank | PaymentMethod)[]) {
		return (
			<div className="border border-border rounded-xl overflow-hidden">
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{items.map((item) => {
						const isSelected = selectedItem?.id === item.id;
						return (
							<button
								key={item.id}
								onClick={() => { play("transition_up"); setSelectedItem(item); }}
								className={`
                  relative flex flex-col items-center justify-center gap-3
                  border-e border-b border-border
                  p-6 transition-all duration-150 cursor-pointer
                  ${
										isSelected
											? "bg-surface ring-1 ring-inset ring-muted-subtle"
											: "bg-background hover:bg-surface/60"
									}
                `}
								style={{ aspectRatio: "1 / 1" }}
							>
								{/* Badges */}
								{(item.isNew || item.isUpdated) && (
									<div className="absolute top-3 start-3 flex gap-1">
										{item.isNew && <Badge type="new" />}
										{item.isUpdated && !item.isNew && <Badge type="updated" />}
									</div>
								)}

								{/* Logo */}
								<img
									src={getLogoUrl(item)}
									alt={t(`entityNames.${item.id}`)}
									className={`object-contain transition-all duration-200 ${
										logoVariant === "mono" ? "brightness-0 dark:invert" : ""
									}`}
									style={{
										width: `${logoSize}px`,
										height: `${logoSize}px`,
									}}
								/>

								{/* Name */}
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

			{/* Toolbar: Size Slider | Style Toggle */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-border">
				{/* Size Slider */}
				<div className="flex items-center gap-3">
					<span className="text-sm font-bold text-muted-foreground">{t("home.size")}</span>
					<input
						type="range"
						min="100"
						max="200"
						value={logoSize}
						onChange={(e) => { const v = Number(e.target.value); setLogoSize(v); onPianoSliderChange(v); }}
						className="range-slider w-48"
					/>
					<span className="text-sm font-bold text-muted-foreground tabular-nums w-8 text-end">
						{logoSize}
					</span>
				</div>

				{/* Style Toggle */}
				<div className="flex items-center bg-surface rounded-lg border border-border p-1 self-start sm:self-auto">
					{variants.map((v) => (
						<button
							key={v.key}
							onClick={() => { play("tap"); setLogoVariant(v.key); }}
							className={`
                px-4 py-1.5 text-sm font-medium rounded-md transition-all
                ${
									logoVariant === v.key
										? "bg-surface-hover text-primary shadow-sm"
										: "text-muted-foreground hover:text-primary"
								}
              `}
						>
							{t(v.labelKey)}
						</button>
					))}
				</div>
			</div>

			{/* Sections */}
			{sections.map((section) => (
				<div key={section.labelKey} className="mt-8">
					<div className="flex items-center gap-3 mb-4">
						<h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
							{t(section.labelKey)}
						</h2>
						<span className="text-xs px-2 py-0.5 rounded-md font-medium bg-surface-hover text-muted-foreground">
							{section.count}
						</span>
					</div>
					{renderGrid(section.items)}
				</div>
			))}
		</div>
	);
}
