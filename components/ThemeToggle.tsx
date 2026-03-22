import { Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useRef } from "react";
import { useUIContext } from "../hooks/useUIContext";

export function ThemeToggle(): JSX.Element {
	const { theme, toggleTheme } = useUIContext();
	const buttonRef = useRef<HTMLButtonElement>(null);

	const handleClick = () => {
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
