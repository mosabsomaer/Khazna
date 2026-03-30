import { Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSound } from "../hooks/useSound";
import { useUIContext } from "../hooks/useUIContext";

export function ThemeToggle(): JSX.Element {
	const { theme, toggleTheme } = useUIContext();
	const { t } = useTranslation();
	const play = useSound();
	const buttonRef = useRef<HTMLButtonElement>(null);

	const isDark = theme === "dark";
	const label = isDark ? t("theme.switchToLight", "Switch to light mode") : t("theme.switchToDark", "Switch to dark mode");

	const handleClick = () => {
		play("toggle-theme");
		const rect = buttonRef.current?.getBoundingClientRect();
		toggleTheme(rect);
	};

	return (
		<button
			ref={buttonRef}
			onClick={handleClick}
			aria-label={label}
			title={label}
			className="p-2 text-muted-foreground hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
		>
			{isDark ? <Sun size={20} /> : <Moon size={20} />}
		</button>
	);
}
