import { useCallback } from "react";
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
	| "typing"
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

// Module-level cache shared across all hook instances so each sound file is
// only fetched once for the entire app lifetime.
const audioCache = new Map<string, HTMLAudioElement>();

function getOrCreateAudio(path: string, volume: number): HTMLAudioElement {
	let audio = audioCache.get(path);
	if (!audio) {
		audio = new Audio(path);
		audio.preload = "none";
		audio.volume = volume;
		audioCache.set(path, audio);
	}
	return audio;
}

/**
 * Returns a `play` function that triggers UI sound effects.
 *
 * - Respects the global `soundEnabled` setting from UIContext
 * - Respects `prefers-reduced-motion` (skips sounds)
 * - Lazily fetches each sound on first play and caches the Audio object
 *   at module scope so subsequent plays (and other components) reuse it.
 *
 * @param volume - Default volume for all sounds (0–1). Default: 0.5
 */
export function useSound(volume = 0.5): (name: SoundName, opts?: { volume?: number }) => void {
	const { soundEnabled } = useUIContext();

	return useCallback(
		(name: SoundName, opts?: { volume?: number }) => {
			if (!soundEnabled) return;

			// Respect reduced-motion preference
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			let path: string;

			if (name === "typing") {
				path = getVariantPath("tap", Math.random() > 0.5 ? 3 : 4);
			} else {
				// Pick a random variant for tap/swipe/type
				const variantCount = VARIANT_SOUNDS[name];
				if (variantCount) {
					const index = Math.floor(Math.random() * variantCount) + 1;
					path = getVariantPath(name, index);
				} else {
					path = getSoundPath(name);
				}
			}

			const audio = getOrCreateAudio(path, volume);
			audio.volume = opts?.volume ?? volume;
			audio.currentTime = 0;
			audio.play().catch(() => {});
		},
		[soundEnabled, volume],
	);
}
