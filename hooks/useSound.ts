import { useCallback, useEffect, useRef } from "react";
import { useUIContext } from "./useUIContext";

/**
 * All available sound names.
 * Variant sounds (tap, swipe, type) randomly pick from their numbered files.
 */
export type SoundName =
	| "select"
	| "tap"
	| "swipe"
	| "type"
	| "toggle_on"
	| "toggle_off"
	| "toggle-theme"
	| "transition_up"
	| "transition_down"
	| "notification"
	| "caution"
	| "celebration"
	| "disabled"
	| "delete"
	| "download"
	| "copy-svg"
	| "add-to-folder"
	| "slider"
	| "tunning"
	| "tunning2"
	| "open-icon"
	| "progress_loop"
	| "ringtone_loop";

/** Sounds that have numbered variants (01–05) */
const VARIANT_SOUNDS: Record<string, number> = {
	tap: 5,
	swipe: 5,
	type: 5,
};

/** Sounds that use a non-wav extension */
const SOUND_EXTENSIONS: Record<string, string> = {
	"open-icon": "m4a",
};

function getSoundPath(name: string): string {
	const ext = SOUND_EXTENSIONS[name] ?? "wav";
	return `/sounds/${name}.${ext}`;
}

function getVariantPath(base: string, index: number): string {
	const padded = String(index).padStart(2, "0");
	return `/sounds/${base}_${padded}.wav`;
}

/**
 * Returns a `play` function that triggers UI sound effects.
 *
 * - Respects the global `soundEnabled` setting from UIContext
 * - Respects `prefers-reduced-motion` (skips sounds)
 * - Pre-caches Audio objects for instant playback
 * - Randomly picks variants for tap/swipe/type sounds
 *
 * @param volume - Default volume for all sounds (0–1). Default: 0.5
 */
export function useSound(volume = 0.5): (name: SoundName, opts?: { volume?: number }) => void {
	const { soundEnabled } = useUIContext();
	const cacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

	// Pre-cache all sound files on mount
	useEffect(() => {
		const cache = cacheRef.current;

		const allPaths: string[] = [
			"select",
			"toggle_on",
			"toggle_off",
			"toggle-theme",
			"transition_up",
			"transition_down",
			"notification",
			"caution",
			"celebration",
			"disabled",
			"delete",
			"download",
			"copy-svg",
			"add-to-folder",
			"slider",
			"tunning",
			"tunning2",
			"open-icon",
			"progress_loop",
			"ringtone_loop",
		].map(getSoundPath);

		// Add variant paths
		for (const [base, count] of Object.entries(VARIANT_SOUNDS)) {
			for (let i = 1; i <= count; i++) {
				allPaths.push(getVariantPath(base, i));
			}
		}

		for (const path of allPaths) {
			if (!cache.has(path)) {
				const audio = new Audio(path);
				audio.preload = "auto";
				audio.volume = volume;
				cache.set(path, audio);
			}
		}
	}, [volume]);

	const play = useCallback(
		(name: SoundName, opts?: { volume?: number }) => {
			if (!soundEnabled) return;

			// Respect reduced-motion preference
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			let path: string;

			// Pick a random variant for tap/swipe/type
			const variantCount = VARIANT_SOUNDS[name];
			if (variantCount) {
				const index = Math.floor(Math.random() * variantCount) + 1;
				path = getVariantPath(name, index);
			} else {
				path = getSoundPath(name);
			}

			const cache = cacheRef.current;
			const cached = cache.get(path);

			if (cached) {
				cached.volume = opts?.volume ?? volume;
				cached.currentTime = 0;
				cached.play().catch(() => {});
			} else {
				// Fallback: create on the fly if cache miss
				const audio = new Audio(path);
				audio.volume = opts?.volume ?? volume;
				audio.play().catch(() => {});
				cache.set(path, audio);
			}
		},
		[soundEnabled, volume],
	);

	return play;
}
