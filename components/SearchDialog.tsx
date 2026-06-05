import { Search, X } from "lucide-react";
import type { ChangeEvent, JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BANKS, PAYMENT_METHODS } from "../constants";
import { useSound } from "../hooks/useSound";
import { useUIContext } from "../hooks/useUIContext";
import type { Bank, PaymentMethod } from "../types";

type SearchResult =
	| {
			id: string;
			kind: "logo";
			item: Bank | PaymentMethod;
	  }
	| {
			id: string;
			kind: "app";
			item: Bank;
	  };

const SEARCHABLE_ITEMS: SearchResult[] = [
	...BANKS.map((item) => ({ id: `logo-${item.id}`, kind: "logo" as const, item })),
	...PAYMENT_METHODS.map((item) => ({ id: `logo-${item.id}`, kind: "logo" as const, item })),
	...BANKS.filter((item) => item.hasScreenshots).map((item) => ({
		id: `app-${item.id}`,
		kind: "app" as const,
		item,
	})),
];

function normalizeSearchValue(value: string): string {
	return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function SearchDialog(): JSX.Element | null {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const play = useSound(0.35);
	const { closeSearch, getLogoUrl, isSearchOpen, openSearch, setSelectedItem } = useUIContext();
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent): void {
			const isSearchShortcut = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);

			if (isSearchShortcut) {
				event.preventDefault();
				if (!isSearchOpen) play("tap");
				openSearch();
				return;
			}

			if (event.key === "Escape" && isSearchOpen) {
				event.preventDefault();
				closeSearch();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [closeSearch, isSearchOpen, openSearch, play]);

	useEffect(() => {
		if (!isSearchOpen) {
			setQuery("");
			return;
		}

		const frame = requestAnimationFrame(() => inputRef.current?.focus());
		return () => cancelAnimationFrame(frame);
	}, [isSearchOpen]);

	const results = useMemo(() => {
		const normalizedQuery = normalizeSearchValue(query);
		if (!normalizedQuery) return SEARCHABLE_ITEMS.slice(0, 12);

		return SEARCHABLE_ITEMS.filter((result) => {
			const translatedName = t(`entityNames.${result.item.id}`);
			const searchText = normalizeSearchValue(
				[result.item.name, translatedName, result.item.id, result.kind].join(" "),
			);
			return searchText.includes(normalizedQuery);
		}).slice(0, 12);
	}, [query, t]);

	function handleClose(): void {
		play("tap");
		closeSearch();
	}

	function handleChange(event: ChangeEvent<HTMLInputElement>): void {
		setQuery(event.target.value);
		play("typing", { volume: 0.22 });
	}

	function handleSelect(result: SearchResult): void {
		play("select");
		closeSearch();

		if (result.kind === "app") {
			navigate(`/apps/${result.item.id}`);
			return;
		}

		navigate("/");
		window.setTimeout(() => {
			setSelectedItem(result.item);
		}, 0);
	}

	if (!isSearchOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 pt-20 backdrop-blur-md sm:pt-24">
			<button
				type="button"
				aria-label={t("search.close")}
				className="absolute inset-0 cursor-default"
				onClick={handleClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="search-dialog-title"
				className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
			>
				<div className="flex items-center gap-3 border-b border-border px-4 py-3">
					<Search size={20} className="text-muted-foreground" />
					<div className="flex-1">
						<h2 id="search-dialog-title" className="sr-only">
							{t("search.title")}
						</h2>
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={handleChange}
							placeholder={t("search.placeholder")}
							aria-label={t("search.title")}
							className="w-full bg-transparent text-base text-primary outline-none placeholder:text-muted-foreground"
						/>
					</div>
					<button
						type="button"
						onClick={handleClose}
						aria-label={t("search.close")}
						className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary"
					>
						<X size={18} />
					</button>
				</div>

				<div className="max-h-[60vh] overflow-y-auto p-2">
					{results.length > 0 ? (
						<ul className="space-y-1">
							{results.map((result) => (
								<li key={result.id}>
									<button
										type="button"
										onClick={() => handleSelect(result)}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start transition-colors hover:bg-surface-hover focus:bg-surface-hover focus:outline-none"
									>
										<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-2">
											<img
												src={getLogoUrl(result.item)}
												alt=""
												className="max-h-full max-w-full object-contain"
											/>
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-semibold text-primary">
												{t(`entityNames.${result.item.id}`)}
											</span>
											<span className="block text-xs text-muted-foreground">
												{result.kind === "app" ? t("search.appResult") : t("search.logoResult")}
											</span>
										</span>
									</button>
								</li>
							))}
						</ul>
					) : (
						<div className="px-4 py-10 text-center text-sm text-muted-foreground">
							{t("search.noResults")}
						</div>
					)}
				</div>

				<div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
					<span>{t("search.shortcutHint")}</span>
					<kbd className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-semibold">
						Esc
					</kbd>
				</div>
			</div>
		</div>
	);
}
