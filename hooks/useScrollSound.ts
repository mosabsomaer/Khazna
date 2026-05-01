import { useEffect, useRef } from "react";
import { scroll003Sound } from "@/lib/scroll-003";
import { decodeAudioData, getAudioContext } from "@/lib/sound-engine";
import { useUIContext } from "./useUIContext";

const SCROLL_THRESHOLD = 50; // pixels of scroll to trigger one tick
const TICK_DURATION = 0.05; // seconds of audio per tick (~one click in the file)
const MIN_TICK_INTERVAL = 50; // ms — cap so fast scrolling never exceeds normal playback speed

export function useScrollSound(volume = 0.1) {
	const { soundEnabled } = useUIContext();
	const bufferRef = useRef<AudioBuffer | null>(null);
	const accumulatorRef = useRef(0);
	const offsetRef = useRef(0);
	const lastScrollYRef = useRef(0);
	const lastTickTimeRef = useRef(0);

	// Decode audio buffer once on mount
	useEffect(() => {
		decodeAudioData(scroll003Sound.dataUri).then((buffer) => {
			bufferRef.current = buffer;
		});
	}, []);

	useEffect(() => {
		if (!soundEnabled) return;

		lastScrollYRef.current = window.scrollY;

		const playTick = () => {
			const buffer = bufferRef.current;
			if (!buffer) return;

			const ctx = getAudioContext();
			if (ctx.state === "suspended") ctx.resume();

			const source = ctx.createBufferSource();
			const gain = ctx.createGain();

			source.buffer = buffer;
			gain.gain.value = volume;

			source.connect(gain);
			gain.connect(ctx.destination);

			const offset = offsetRef.current % buffer.duration;
			source.start(0, offset, TICK_DURATION);

			// Advance offset so next tick picks up where this one left off
			offsetRef.current = (offsetRef.current + TICK_DURATION) % buffer.duration;
		};

		const handleScroll = () => {
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			const currentY = window.scrollY;
			const delta = Math.abs(currentY - lastScrollYRef.current);
			lastScrollYRef.current = currentY;

			accumulatorRef.current += delta;

			const now = performance.now();

			// Fire ticks but never faster than MIN_TICK_INTERVAL apart
			while (accumulatorRef.current >= SCROLL_THRESHOLD) {
				if (now - lastTickTimeRef.current < MIN_TICK_INTERVAL) {
					// Cap the accumulator so it doesn't build up unbounded
					accumulatorRef.current = SCROLL_THRESHOLD;
					break;
				}
				accumulatorRef.current -= SCROLL_THRESHOLD;
				lastTickTimeRef.current = now;
				playTick();
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [soundEnabled, volume]);
}
