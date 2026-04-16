import { useCallback, useEffect, useRef } from "react";
import { useUIContext } from "./useUIContext";

/**
 * Noise buffer cached at module level — generated once, reused on every knock.
 * Regenerating random noise on every call caused crackling on rapid slider moves.
 */
let noiseBufferCache: AudioBuffer | null = null;

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
	if (!noiseBufferCache || noiseBufferCache.sampleRate !== ctx.sampleRate) {
		// 300 ms of noise is more than enough for any single knock
		const length = Math.ceil(ctx.sampleRate * 0.3);
		noiseBufferCache = ctx.createBuffer(1, length, ctx.sampleRate);
		const data = noiseBufferCache.getChannelData(0);
		for (let i = 0; i < length; i++) {
			data[i] = Math.random() * 2 - 1;
		}
	}
	return noiseBufferCache;
}

/**
 * Maps a slider value to a bandpass filter frequency (Hz).
 * Low slider → dull thud (~180 Hz). High slider → lighter tap (~500 Hz).
 */
function sliderToFilterFreq(value: number, min = 100, max = 200): number {
	const t = (value - min) / (max - min);
	return 180 + t * 320; // 180 Hz → 500 Hz
}

/**
 * Synthesizes a soft wood-knock via Web Audio API.
 * Filtered white noise — no oscillators, no pitch, no ring.
 */
function synthesizeWoodKnock(
	ctx: AudioContext,
	filterFreq: number,
	volume: number,
	startTime: number,
): void {
	const attackTime = 0.005; // 5 ms — avoids onset click
	const decayTime  = 0.10;  // 100 ms — short, clean

	const noise = ctx.createBufferSource();
	noise.buffer = getNoiseBuffer(ctx);

	// Bandpass shapes the noise into a warm thud
	const filter = ctx.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.value = filterFreq;
	filter.Q.value = 1.5; // wide, warm band — not resonant

	// Lowpass rolls off harshness above 900 Hz
	const lp = ctx.createBiquadFilter();
	lp.type = "lowpass";
	lp.frequency.value = 900;

	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0, startTime);
	gain.gain.linearRampToValueAtTime(volume * 0.9, startTime + attackTime);
	gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attackTime + decayTime);

	noise.connect(filter);
	filter.connect(lp);
	lp.connect(gain);
	gain.connect(ctx.destination);

	noise.start(startTime);
	noise.stop(startTime + attackTime + decayTime + 0.01);
}

/**
 * Returns an `onSliderChange(value)` callback that plays soft wood-knock
 * sounds as the slider moves.
 *
 * @param sliderMin - Slider's min attribute (default 150)
 * @param sliderMax - Slider's max attribute (default 200)
 * @param volume    - Playback volume 0–1 (default 0.35)
 */
export function usePianoSlider(
	sliderMin = 150,
	sliderMax = 200,
	volume = 0.35,
): (value: number) => void {
	const { soundEnabled } = useUIContext();

	const audioCtxRef = useRef<AudioContext | null>(null);
	const prevValueRef = useRef<number | null>(null);
	const pendingRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	useEffect(() => {
		return () => {
			pendingRef.current.forEach(clearTimeout);
		};
	}, []);

	const onSliderChange = useCallback(
		(value: number) => {
			if (!soundEnabled) return;
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			if (!audioCtxRef.current) {
				audioCtxRef.current = new AudioContext();
			}
			const ctx = audioCtxRef.current;

			if (ctx.state === "suspended") {
				ctx.resume().catch(() => {});
			}

			const prev = prevValueRef.current;
			prevValueRef.current = value;

			if (prev === null || prev === value) {
				synthesizeWoodKnock(ctx, sliderToFilterFreq(value, sliderMin, sliderMax), volume, ctx.currentTime);
				return;
			}

			// Fire one knock per NOTE_STEP positions — wider step than piano
			// so knocks don't overlap and sound broken
			const NOTE_STEP = 6;
			const prevQ = Math.round(prev / NOTE_STEP) * NOTE_STEP;
			const currQ = Math.round(value / NOTE_STEP) * NOTE_STEP;

			if (prevQ === currQ) return;

			const dir = currQ > prevQ ? NOTE_STEP : -NOTE_STEP;
			const notes: number[] = [];
			for (let v = prevQ + dir; dir > 0 ? v <= currQ : v >= currQ; v += dir) {
				notes.push(v);
			}

			// Cap at 6 knocks per burst — noise doesn't need a glissando
			const MAX_NOTES = 6;
			const NOTE_INTERVAL_MS = 35;

			const thinned: number[] =
				notes.length <= MAX_NOTES
					? notes
					: notes.filter((_, i) => i % Math.ceil(notes.length / MAX_NOTES) === 0)
						.concat(notes[notes.length - 1]);

			pendingRef.current.forEach(clearTimeout);
			pendingRef.current = [];

			thinned.forEach((v, i) => {
				const t = setTimeout(() => {
					if (!audioCtxRef.current) return;
					const c = audioCtxRef.current;
					if (c.state === "suspended") c.resume().catch(() => {});
					synthesizeWoodKnock(c, sliderToFilterFreq(v, sliderMin, sliderMax), volume, c.currentTime);
				}, i * NOTE_INTERVAL_MS);
				pendingRef.current.push(t);
			});
		},
		[soundEnabled, sliderMin, sliderMax, volume],
	);

	return onSliderChange;
}
