import { Volume2, VolumeOff } from "lucide-react";
import type { JSX } from "react";
import { useCallback, useRef } from "react";
import { useUIContext } from "../hooks/useUIContext";

export function SoundToggle(): JSX.Element {
	const { soundEnabled, toggleSound } = useUIContext();
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handleClick = useCallback(() => {
		// Play the toggle sound directly (bypassing useSound since we're toggling the enable state)
		if (!soundEnabled) {
			// About to enable — play a confirmation sound
			if (!audioRef.current) {
				audioRef.current = new Audio("/sounds/toggle_on.wav");
			}
			audioRef.current.volume = 0.5;
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch(() => {});
		}
		toggleSound();
	}, [soundEnabled, toggleSound]);

	return (
		<button
			onClick={handleClick}
			className="p-2 text-muted-foreground hover:text-primary hover:bg-surface-hover rounded-full transition-colors"
			title={soundEnabled ? "Mute sounds" : "Enable sounds"}
		>
			{soundEnabled ? <Volume2 size={20} /> : <VolumeOff size={20} />}
		</button>
	);
}
