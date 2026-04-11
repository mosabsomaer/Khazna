import { useCallback, useEffect, useRef } from "react";
import { useUIContext } from "./useUIContext";

/** Piano has 88 keys. A4 (key 49) = 440 Hz. */
function pianoKeyToFrequency(key: number): number {
	return 440 * Math.pow(2, (key - 49) / 12);
}

/**
 * Maps a slider value (100–200) to a piano key (1–88).
 * Low slider → bass notes. High slider → treble notes.
 */
function sliderToPianoKey(value: number, min = 100, max = 200): number {
	const t = (value - min) / (max - min);
	return Math.round(t * 87) + 1;
}

/**
 * Synthesizes a single piano-like note via Web Audio API.
 * Uses a triangle oscillator (warm, piano-ish) with a fast
 * attack and exponential decay — no sustain, like a hammer strike.
 */
function synthesizePianoNote(
	ctx: AudioContext,
	frequency: number,
	volume: number,
	startTime: number,
): void {
	const attackTime = 0.005; // 5 ms
	const decayTime = 0.28;   // 280 ms decay

	// Primary oscillator — triangle for warm tone
	const osc1 = ctx.createOscillator();
	const gain1 = ctx.createGain();
	osc1.type = "triangle";
	osc1.frequency.value = frequency;
	osc1.connect(gain1);
	gain1.connect(ctx.destination);

	// Second oscillator — sine at 2× frequency (octave harmonic) for brightness
	const osc2 = ctx.createOscillator();
	const gain2 = ctx.createGain();
	osc2.type = "sine";
	osc2.frequency.value = frequency * 2;
	osc2.connect(gain2);
	gain2.connect(ctx.destination);

	// Volume envelope — instant attack, exponential decay
	gain1.gain.setValueAtTime(0, startTime);
	gain1.gain.linearRampToValueAtTime(volume * 0.28, startTime + attackTime);
	gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + attackTime + decayTime);

	gain2.gain.setValueAtTime(0, startTime);
	gain2.gain.linearRampToValueAtTime(volume * 0.08, startTime + attackTime);
	gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + attackTime + decayTime);

	const stopTime = startTime + attackTime + decayTime + 0.01;
	osc1.start(startTime);
	osc1.stop(stopTime);
	osc2.start(startTime);
	osc2.stop(stopTime);
}

/**
 * Returns an `onSliderChange(value)` callback that plays piano notes
 * as the slider moves. Fills in skipped values for fast swipes,
 * producing a glissando effect.
 *
 * @param sliderMin - Slider's min attribute (default 100)
 * @param sliderMax - Slider's max attribute (default 200)
 * @param volume    - Playback volume 0–1 (default 0.35)
 */
export function usePianoSlider(
	sliderMin = 100,
	sliderMax = 200,
	volume = 0.35,
): (value: number) => void {
	const { soundEnabled } = useUIContext();

	const audioCtxRef = useRef<AudioContext | null>(null);
	const prevValueRef = useRef<number | null>(null);
	const pendingRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	// Clean up pending timeouts on unmount
	useEffect(() => {
		return () => {
			pendingRef.current.forEach(clearTimeout);
		};
	}, []);

	const onSliderChange = useCallback(
		(value: number) => {
			if (!soundEnabled) return;
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			// Lazy-init AudioContext (must happen inside a user gesture)
			if (!audioCtxRef.current) {
				audioCtxRef.current = new AudioContext();
			}
			const ctx = audioCtxRef.current;

			// Resume if suspended (browser autoplay policy)
			if (ctx.state === "suspended") {
				ctx.resume().catch(() => {});
			}

			const prev = prevValueRef.current;
			prevValueRef.current = value;

			// On very first interaction just play the current note
			if (prev === null || prev === value) {
				const key = sliderToPianoKey(value, sliderMin, sliderMax);
				synthesizePianoNote(ctx, pianoKeyToFrequency(key), volume, ctx.currentTime);
				return;
			}

			// Build the list of values to play (from prev+step toward value, inclusive)
			const step = value > prev ? 1 : -1;
			const notes: number[] = [];
			for (let v = prev + step; step > 0 ? v <= value : v >= value; v += step) {
				notes.push(v);
			}

			// For large jumps, thin out notes so the glissando stays under ~400 ms.
			// Max 20 notes at 20 ms each = 400 ms cap.
			const MAX_NOTES = 20;
			const NOTE_INTERVAL_MS = 20;

			const thinned: number[] =
				notes.length <= MAX_NOTES
					? notes
					: notes.filter((_, i) => i % Math.ceil(notes.length / MAX_NOTES) === 0)
						.concat(notes[notes.length - 1]); // always include the final value

			// Cancel any pending notes from a previous burst that haven't fired yet
			pendingRef.current.forEach(clearTimeout);
			pendingRef.current = [];

			// Schedule each note
			thinned.forEach((v, i) => {
				const delayMs = i * NOTE_INTERVAL_MS;
				const t = setTimeout(() => {
					if (!audioCtxRef.current) return;
					const c = audioCtxRef.current;
					if (c.state === "suspended") c.resume().catch(() => {});
					const key = sliderToPianoKey(v, sliderMin, sliderMax);
					synthesizePianoNote(c, pianoKeyToFrequency(key), volume, c.currentTime);
				}, delayMs);
				pendingRef.current.push(t);
			});
		},
		[soundEnabled, sliderMin, sliderMax, volume],
	);

	return onSliderChange;
}
