import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { useUIContext } from "../hooks/useUIContext";
import type { Bank, PaymentMethod } from "../types";
import { Badge } from "./Badge";

interface LogoCardProps {
	item: Bank | PaymentMethod;
}

export function LogoCard({ item }: LogoCardProps): JSX.Element {
	const { setSelectedItem, selectedItem } = useUIContext();
	const { t } = useTranslation();

	const isSelected = selectedItem?.id === item.id;

	return (
		<div className="flex flex-col gap-3 group">
			<button
				onClick={() => setSelectedItem(item)}
				className={`
          relative w-full aspect-square flex flex-col items-center justify-center p-6
          border rounded-xl transition-all duration-200
          hover:bg-surface/50
          ${isSelected ? "border-muted-subtle ring-1 ring-muted-subtle bg-surface" : "border-border bg-background hover:border-border-subtle"}
        `}
			>
				{/* Badges */}
				<div className="absolute top-3 start-3 flex gap-2">
					{item.isNew && <Badge type="new" />}
					{item.isUpdated && !item.isNew && <Badge type="updated" />}
				</div>

				{/* Logo Container */}
				<div className="w-full h-20 flex items-center justify-center transition-all duration-300">
					<img
						src={item.logoUrl}
						alt={t(`entityNames.${item.id}`)}
						className="max-w-full max-h-full object-contain"
					/>
				</div>
			</button>

			<span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors text-center px-1">
				{t(`entityNames.${item.id}`)}
			</span>
		</div>
	);
}
