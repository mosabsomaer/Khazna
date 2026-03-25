import { Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useRef } from "react";
import { useSound } from "../hooks/useSound";
import { useUIContext } from "../hooks/useUIContext";

export function ThemeToggle(): JSX.Element {
	const { theme, toggleTheme } = useUIContext();
	const play = useSound();
	const buttonRef = useRef<HTMLButtonElement>(null);

	const handleClick = () => {
		play("toggle-theme");
		const rect = buttonRef.current?.getBoundingClientRect();
		toggleTheme(rect);
	};

	return (
		<button
			ref={buttonRef}
			onClick={handleClick}
			className="p-2 text-muted-foreground hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
		>
			{theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
		</button>
	);
}
