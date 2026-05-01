import { Figma, Github, LayoutGrid, Mail, Menu, Smartphone, X } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { SOCIAL_LINKS } from "../constants";
import { useLanguage } from "../hooks/useLanguage";
import { useSound } from "../hooks/useSound";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar(): JSX.Element {
	const { t } = useTranslation();
	const { currentLanguage, toggleLanguage } = useLanguage();
	const play = useSound();
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const isAppsPage = location.pathname.includes("/apps");
	const isHomePage = location.pathname === "/";

	function handleMobileNav(): void {
		setIsMobileMenuOpen(false);
	}

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
			<div className="max-w-[1600px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
				{/* Left: Brand & Desktop Nav */}
				<div className="flex items-center gap-8">
					<Link to="/" className="z-50" onClick={() => play("tap")}>
						<img
							src={currentLanguage === "ar" ? "/ar-logo.svg" : "/en-logo.svg"}
							alt="Khazna"
							className="h-6 invert dark:invert-0"
						/>
					</Link>

					<nav className="hidden md:flex items-center gap-1">
						<Link
							to="/"
							onClick={() => play("tap")}
							className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isHomePage ? "bg-surface-hover text-primary" : "text-muted-foreground hover:text-primary hover:bg-surface"}`}
						>
							<LayoutGrid size={16} />
							{t("navbar.logos")}
						</Link>
						<Link
							to="/apps"
							onClick={() => play("tap")}
							className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isAppsPage ? "bg-surface-hover text-primary" : "text-muted-foreground hover:text-primary hover:bg-surface"}`}
						>
							<Smartphone size={16} />
							{t("navbar.apps")}
						</Link>
						<Link
							to="/about"
							onClick={() => play("tap")}
							className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === "/about" ? "bg-surface-hover text-primary" : "text-muted-foreground hover:text-primary hover:bg-surface"}`}
						>
							{t("navbar.about")}
						</Link>
					</nav>
				</div>

				{/* Right: Actions (Desktop) */}
				<div className="hidden md:flex items-center gap-2">
					<a
						href={SOCIAL_LINKS.github}
						target="_blank"
						rel="noreferrer"
						className="p-2 text-muted-foreground hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
						title="GitHub"
					>
						<Github size={20} />
					</a>
					<a
						href={SOCIAL_LINKS.figma}
						target="_blank"
						rel="noreferrer"
						className="p-2 text-muted-foreground hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
						title="Figma Community"
					>
						<Figma size={20} />
					</a>
					<div className="w-px h-4 bg-border mx-1" />
					<SoundToggle />
					<ThemeToggle />
					<button
						type="button"
						onClick={() => {
							play("slider");
							toggleLanguage();
						}}
						className="px-3 py-1.5 text-xs font-bold rounded-full border border-border text-muted-foreground hover:text-primary hover:bg-surface-hover transition-colors"
					>
						{currentLanguage === "ar" ? "EN" : "AR"}
					</button>
					<div className="w-px h-4 bg-border mx-1" />
					<a
						href={SOCIAL_LINKS.email}
						className="flex items-center gap-2 px-4 py-2 bg-accent-bg hover:opacity-90 text-accent-text text-sm font-semibold rounded-full transition-colors"
					>
						<Mail size={16} />
						<span className="hidden lg:inline">{t("navbar.contribute")}</span>
					</a>
				</div>

				{/* Mobile Menu Toggle */}
				<div className="md:hidden flex items-center gap-2">
					<SoundToggle />
					<ThemeToggle />
					<button
						type="button"
						onClick={() => {
							play("slider");
							toggleLanguage();
						}}
						className="px-2.5 py-1 text-xs font-bold rounded-full border border-border text-muted-foreground hover:text-primary transition-colors"
					>
						{currentLanguage === "ar" ? "EN" : "AR"}
					</button>
					<button
						type="button"
						onClick={() => {
							play("slider");
							setIsMobileMenuOpen(!isMobileMenuOpen);
						}}
						className="p-2 text-muted-foreground hover:text-primary rounded-md"
					>
						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile Menu Dropdown */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t border-border bg-background absolute start-0 end-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 flex flex-col gap-6 animate-in slide-in-from-top-4 fade-in duration-200 shadow-2xl">
					{/* Mobile Nav Links */}
					<nav className="flex flex-col gap-2">
						<Link
							to="/"
							onClick={() => {
								play("tap");
								handleMobileNav();
							}}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isHomePage ? "bg-surface-hover text-primary" : "text-muted-foreground hover:bg-surface hover:text-primary"}`}
						>
							<LayoutGrid size={20} />
							{t("navbar.logos")}
						</Link>
						<Link
							to="/apps"
							onClick={() => {
								play("tap");
								handleMobileNav();
							}}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isAppsPage ? "bg-surface-hover text-primary" : "text-muted-foreground hover:bg-surface hover:text-primary"}`}
						>
							<Smartphone size={20} />
							{t("navbar.apps")}
						</Link>
						<Link
							to="/about"
							onClick={() => {
								play("tap");
								handleMobileNav();
							}}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${location.pathname === "/about" ? "bg-surface-hover text-primary" : "text-muted-foreground hover:bg-surface hover:text-primary"}`}
						>
							{t("navbar.about")}
						</Link>
					</nav>

					<hr className="border-border" />

					{/* Mobile Socials & Contribute */}
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between px-2">
							<span className="text-sm font-medium text-muted-subtle">{t("common.community")}</span>
							<div className="flex items-center gap-2">
								<a
									href={SOCIAL_LINKS.github}
									target="_blank"
									rel="noreferrer"
									className="p-3 bg-surface text-muted-foreground hover:text-primary rounded-lg border border-border"
								>
									<Github size={20} />
								</a>
								<a
									href={SOCIAL_LINKS.figma}
									target="_blank"
									rel="noreferrer"
									className="p-3 bg-surface text-muted-foreground hover:text-primary rounded-lg border border-border"
								>
									<Figma size={20} />
								</a>
							</div>
						</div>

						<a
							href={SOCIAL_LINKS.email}
							className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-accent-bg active:opacity-90 text-accent-text text-base font-bold rounded-xl transition-colors mt-2"
						>
							<Mail size={18} />
							{t("navbar.contribute")}
						</a>
					</div>
				</div>
			)}
		</header>
	);
}
