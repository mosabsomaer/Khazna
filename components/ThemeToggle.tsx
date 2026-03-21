import { Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useUIContext } from "../hooks/useUIContext";

export function ThemeToggle(): JSX.Element {
	const { theme, toggleTheme } = useUIContext();

	return (
		<button
			onClick={toggleTheme}
			className="p-2 text-muted-foreground hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
		>
			{theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
		</button>
	);
}
