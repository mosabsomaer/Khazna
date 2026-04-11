import type { JSX } from "react";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Contributors } from "./components/Contributors";
import { DetailPanel } from "./components/DetailPanel";
import { Navbar } from "./components/Navbar";
import { useScrollSound } from "./hooks/useScrollSound";
import { useUIContext } from "./hooks/useUIContext";
import { AboutPage } from "./pages/AboutPage";
import { AppDetailPage } from "./pages/AppDetailPage";
import { AppsPage } from "./pages/AppsPage";
import { ContributingPage } from "./pages/ContributingPage";
import { HomePage } from "./pages/HomePage";
import type { BaseEntity, LogoVariant, SelectedItem, Theme, UIContextType } from "./types";

export const UIContext = createContext<UIContextType | null>(null);

// Matches --background values from index.css for each theme (used by fallback animation)
const THEME_BG: Record<Theme, string> = { dark: "#080808", light: "#ffffff" };

function Layout({ children }: { children: React.ReactNode }): JSX.Element {
	const { closeSidebar } = useUIContext();
	const _location = useLocation();
	const { t } = useTranslation();

	useScrollSound();

	useEffect(() => {
		closeSidebar();
	}, [closeSidebar]);

	return (
		<div className="min-h-screen bg-background text-primary">
			<Navbar />
			<div className="relative transition-all duration-300 flex-1 flex flex-col">
				<main className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
					{children}
				</main>
				<Contributors />
				<footer className="border-t border-border/30 py-6 px-4 flex flex-col items-center gap-3">
					{/* Built by badge */}
					<Link
						to="/about#team"
						className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
					>
						<span className="group-hover:underline underline-offset-2">{t('footer.builtBy')}</span>
						<div className="flex items-center">
							<img
								src="/founders/Sara.webp"
								alt="Sara"
								className="w-7 h-7 rounded-full object-cover border-2 border-background ring-1 ring-border"
							/>
							<img
								src="/founders/Mosab.webp"
								alt="Mosab"
								className="w-7 h-7 rounded-full object-cover border-2 border-background ring-1 ring-border -ms-2"
							/>
							<img
								src="/founders/Moo.webp"
								alt="Moaad"
								className="w-7 h-7 rounded-full object-cover border-2 border-background ring-1 ring-border -ms-2"
							/>
						</div>
					</Link>

					{/* Hosted by */}
					<a
						href="https://binary.ly"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						{t('footer.hostedBy')}
						<img src="/binary-logo.svg" alt="Binary" className="h-4 w-4 dark:invert" />
						<span className="font-medium">Binary</span>
					</a>
				</footer>
			</div>
			<DetailPanel />
		</div>
	);
}

function ScrollToTop(): null {
	const { pathname, hash } = useLocation();

	useEffect(() => {
		if (hash) {
			// Wait for the page to render, then scroll to the element
			const id = hash.slice(1);
			requestAnimationFrame(() => {
				const el = document.getElementById(id);
				if (el) {
					el.scrollIntoView({ behavior: "smooth" });
				}
			});
		} else {
			window.scrollTo(0, 0);
		}
	}, [pathname, hash]);

	return null;
}

function App(): JSX.Element {
	const [selectedItem, setSelectedItemState] = useState<SelectedItem>(null);
	const [logoVariant, setLogoVariant] = useState<LogoVariant>("branded");
	const [theme, setTheme] = useState<Theme>(() => {
		const stored = localStorage.getItem("khazna-theme") as Theme | null;
		if (stored) return stored;
		return window.matchMedia?.("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	});

	const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
		return localStorage.getItem("khazna-sound") === "true";
	});

	// Track whether the user has explicitly chosen a theme (vs auto-detected from system)
	const hasExplicitChoice = useRef(!!localStorage.getItem("khazna-theme"));
	const isAnimating = useRef(false);

	const isSidebarOpen = !!selectedItem;

	const setSelectedItem = useCallback((item: SelectedItem) => {
		setSelectedItemState(item);
	}, []);

	const closeSidebar = useCallback(() => {
		setSelectedItemState(null);
	}, []);

	const getLogoUrl = useCallback(
		(item: BaseEntity): string => {
			if (logoVariant === "logomark" && item.logomarkUrl) return item.logomarkUrl;
			return item.logoUrl;
		},
		[logoVariant],
	);

	// Sync theme class to <html>. Only persist to localStorage if the user
	// explicitly toggled (not auto-detected from system preference), so that
	// subsequent visits re-check the OS preference.
	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		if (hasExplicitChoice.current) {
			localStorage.setItem("khazna-theme", theme);
		}
	}, [theme]);

	const toggleSound = useCallback(() => {
		setSoundEnabled((prev) => {
			const next = !prev;
			localStorage.setItem("khazna-sound", String(next));
			return next;
		});
	}, []);

	const toggleTheme = useCallback(
		(originRect?: DOMRect) => {
			if (isAnimating.current) return;

			const nextTheme = theme === "dark" ? "light" : "dark";
			hasExplicitChoice.current = true;

			// Respect prefers-reduced-motion: instant switch, no animation
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				setTheme(nextTheme);
				return;
			}

			isAnimating.current = true;

			// Calculate circle origin from button center, fallback to top-right
			const x = originRect
				? originRect.left + originRect.width / 2
				: window.innerWidth - 48;
			const y = originRect
				? originRect.top + originRect.height / 2
				: 32;

			// Maximum radius needed to cover the entire viewport from the origin
			const maxRadius = Math.hypot(
				Math.max(x, window.innerWidth - x),
				Math.max(y, window.innerHeight - y),
			);

			// --- View Transitions API path (Chrome 111+, Edge 111+, Safari 18+) ---
			if (document.startViewTransition) {
				const transition = document.startViewTransition(() => {
					// flushSync ensures React renders synchronously so the
					// View Transitions API captures the correct "after" snapshot
					// without any intermediate flash.
					flushSync(() => {
						setTheme(nextTheme);
					});
				});

				transition.ready
					.then(() => {
						document.documentElement.animate(
							{
								clipPath: [
									`circle(0px at ${x}px ${y}px)`,
									`circle(${maxRadius}px at ${x}px ${y}px)`,
								],
							},
							{
								duration: 600,
								easing: "cubic-bezier(0.4, 0, 0.2, 1)",
								pseudoElement: "::view-transition-new(root)",
							},
						);
					})
					.catch(() => {});

				transition.finished.finally(() => {
					isAnimating.current = false;
				});

				return;
			}

			// --- Fallback: overlay div with clip-path + Web Animations API ---
			if (typeof Element.prototype.animate === "function") {
				const overlay = document.createElement("div");
				overlay.style.cssText = `
					position: fixed;
					inset: 0;
					z-index: 9999;
					background: ${THEME_BG[nextTheme]};
					pointer-events: none;
					clip-path: circle(0px at ${x}px ${y}px);
				`;
				document.body.appendChild(overlay);

				const animation = overlay.animate(
					{
						clipPath: [
							`circle(0px at ${x}px ${y}px)`,
							`circle(${maxRadius}px at ${x}px ${y}px)`,
						],
					},
					{
						duration: 600,
						easing: "cubic-bezier(0.4, 0, 0.2, 1)",
						fill: "forwards",
					},
				);

				// Switch theme when the circle covers ~40% of the viewport
				setTimeout(() => {
					flushSync(() => {
						setTheme(nextTheme);
					});
				}, 250);

				animation.finished.finally(() => {
					overlay.remove();
					isAnimating.current = false;
				});

				return;
			}

			// --- Ultimate fallback: instant switch ---
			setTheme(nextTheme);
			isAnimating.current = false;
		},
		[theme],
	);

	const contextValue = useMemo<UIContextType>(
		() => ({
			selectedItem,
			setSelectedItem,
			isSidebarOpen,
			closeSidebar,
			logoVariant,
			setLogoVariant,
			getLogoUrl,
			theme,
			toggleTheme,
			soundEnabled,
			toggleSound,
		}),
		[
			selectedItem,
			isSidebarOpen,
			setSelectedItem,
			closeSidebar,
			logoVariant,
			getLogoUrl,
			theme,
			toggleTheme,
			soundEnabled,
			toggleSound,
		],
	);

	return (
		<UIContext.Provider value={contextValue}>
			<BrowserRouter>
				<ScrollToTop />
				<Layout>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/apps" element={<AppsPage />} />
						<Route path="/apps/:bankId" element={<AppDetailPage />} />
						<Route path="/contributing" element={<ContributingPage />} />
					<Route path="/about" element={<AboutPage />} />
					</Routes>
				</Layout>
			</BrowserRouter>
		</UIContext.Provider>
	);
}

export default App;
