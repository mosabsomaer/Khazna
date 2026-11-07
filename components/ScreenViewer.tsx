import { ChevronLeft, ChevronRight, Download, Loader2, X } from "lucide-react";
import type { JSX, KeyboardEvent, PointerEvent, Ref } from "react";
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { thumbUrl } from "@/lib/screenshots";
import { cn } from "@/lib/utils";
import { useLanguage } from "../hooks/useLanguage";
import { useScrollLock } from "../hooks/useScrollLock";
import { useSound } from "../hooks/useSound";
import type { Screenshot } from "../types";
import { ScreenPlaceholder } from "./FallbackImage";

type Point = { x: number; y: number };
type Size = { w: number; h: number };
type Zoom = { scale: number; x: number; y: number };
type Sample = Point & { t: number };

type Gesture = {
	mode: "pending" | "swipe" | "dismiss" | "pan" | "pinch";
	pointerId: number;
	pointerType: string;
	start: Point;
	startTime: number;
	samples: Sample[];
	origin: Zoom;
	pinch?: { distance: number; mid: Point };
};

const IDENTITY: Zoom = { scale: 1, x: 0, y: 0 };
const SLIDE_GAP = 24;
const SLOP = 6;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 320;
const MAX_SCALE = 4;
const TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 280;
const FLICK_SPEED = 0.4;

const preloaded = new Set<string>();

function preload(url: string): void {
	if (preloaded.has(url)) return;
	preloaded.add(url);
	new Image().src = url;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

// The iOS rubber band: resistance grows with distance and the overshoot never reaches `dimension`.
function rubberBand(overflow: number, dimension: number): number {
	return (overflow * dimension * 0.55) / (dimension + 0.55 * Math.abs(overflow));
}

function soften(value: number, min: number, max: number, dimension: number): number {
	if (value < min) return min + rubberBand(value - min, dimension);
	if (value > max) return max + rubberBand(value - max, dimension);
	return value;
}

function midpoint(a: Point, b: Point): Point {
	return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function center(view: Size): Point {
	return { x: view.w / 2, y: view.h / 2 };
}

function sizeOf(el: HTMLElement): Size {
	return { w: el.clientWidth, h: el.clientHeight };
}

function velocity(samples: Sample[]): Point {
	const last = samples[samples.length - 1];
	const first = samples.find((s) => last.t - s.t <= 100) ?? last;
	const dt = last.t - first.t;
	return dt > 0 ? { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt } : { x: 0, y: 0 };
}

/** Rescales `from` so the content that sat under `anchor` ends up under `to`. */
function zoomAround(from: Zoom, scale: number, anchor: Point, to: Point, origin: Point): Zoom {
	const k = scale / from.scale;
	return {
		scale,
		x: to.x - origin.x - k * (anchor.x - origin.x - from.x),
		y: to.y - origin.y - k * (anchor.y - origin.y - from.y),
	};
}

/** Pans that keep a zoomed image covering the view, or centred when it is smaller than the view. */
function clampZoom(zoom: Zoom, img: HTMLImageElement, view: Size): Zoom {
	const axis = (value: number, offset: number, size: number, viewSize: number): number => {
		const fromCenter = offset + size / 2 - viewSize / 2;
		const extent = (size * zoom.scale) / 2;
		const edge = Math.abs(viewSize / 2 - extent);
		const lo = -edge - zoom.scale * fromCenter;
		const hi = edge - zoom.scale * fromCenter;
		return clamp(extent * 2 >= viewSize ? value : fromCenter * (1 - zoom.scale), lo, hi);
	};
	return {
		scale: zoom.scale,
		x: axis(zoom.x, img.offsetLeft, img.offsetWidth, view.w),
		y: axis(zoom.y, img.offsetTop, img.offsetHeight, view.h),
	};
}

function panLimits(zoom: Zoom, img: HTMLImageElement, view: Size) {
	const far = clampZoom({ ...zoom, x: -1e6, y: -1e6 }, img, view);
	const near = clampZoom({ ...zoom, x: 1e6, y: 1e6 }, img, view);
	return { minX: far.x, maxX: near.x, minY: far.y, maxY: near.y };
}

function toTransform(zoom: Zoom): string {
	return `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`;
}

function animate(el: HTMLElement | null, property: string, value: string, duration = 0): void {
	if (!el) return;
	el.style.transition = duration ? `${property} ${duration}ms ${EASE}` : "none";
	el.style.setProperty(property, value);
}

function isOnScreen(el: Element): boolean {
	const r = el.getBoundingClientRect();
	return (
		r.width > 0 &&
		r.bottom > 0 &&
		r.right > 0 &&
		r.top < window.innerHeight &&
		r.left < window.innerWidth
	);
}

function isLoaded(img: HTMLImageElement | null): img is HTMLImageElement {
	return !!img?.complete && img.naturalWidth > 0;
}

function restingClip(img: HTMLImageElement): string {
	return `inset(0px 0px round ${getComputedStyle(img).borderTopLeftRadius})`;
}

/** Zoom and clip that lay the image over `thumb`, cropped the way its object-cover crops it. */
function coverThumbnail(img: HTMLImageElement, thumb: HTMLElement, view: Size) {
	const rect = thumb.getBoundingClientRect();
	const radius = Number.parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 0;
	const w = img.offsetWidth;
	const h = img.offsetHeight;
	const scale = Math.max(rect.width / w, rect.height / h);
	const zoom = zoomAround(
		IDENTITY,
		scale,
		{ x: img.offsetLeft + w / 2, y: img.offsetTop + h / 2 },
		{ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
		center(view),
	);
	const insetX = (w - rect.width / scale) / 2;
	const insetY = (h - rect.height / scale) / 2;
	return { zoom, clip: `inset(${insetY}px ${insetX}px round ${radius / scale}px)` };
}

export type ScreenViewerHandle = {
	/** Closes with the same animation as the close button, then calls `onClose`. */
	close: () => void;
};

type ScreenViewerProps = {
	ref?: Ref<ScreenViewerHandle>;
	screens: Screenshot[];
	initialIndex: number;
	isDownloading: boolean;
	onDownload: (screen: Screenshot) => void;
	onClose: () => void;
	/** The grid tile for a screen: the viewer zooms out of it, back into it, and returns focus to it. */
	getThumbnail: (screen: Screenshot) => HTMLElement | null;
};

/** Full-screen screenshot viewer with swipe, pinch and double-tap zoom, and swipe down to close. */
export function ScreenViewer({
	ref,
	screens,
	initialIndex,
	isDownloading,
	onDownload,
	onClose,
	getThumbnail,
}: ScreenViewerProps): JSX.Element {
	const { t } = useTranslation();
	const { isRTL } = useLanguage();
	const play = useSound();
	useScrollLock();

	const [index, setIndex] = useState(initialIndex);
	const [entered, setEntered] = useState(false);
	const [chromeVisible, setChromeVisible] = useState(true);
	const [zoomed, setZoomed] = useState(false);
	const [imageStatus, setImageStatus] = useState<Record<string, "loaded" | "error">>({});
	const [reducedMotion] = useState(
		() => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	);

	const rootRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);
	const surfaceRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const stripRef = useRef<HTMLDivElement>(null);
	const bottomBarRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const indexRef = useRef(initialIndex);
	const zoomRef = useRef<Zoom>(IDENTITY);
	const gestureRef = useRef<Gesture | null>(null);
	const pointers = useRef(new Map<number, Point>());
	const frameRequest = useRef(0);
	const pendingSlide = useRef<{ target: number; timer: number } | null>(null);
	const lastTap = useRef<{ time: number; point: Point } | null>(null);
	const tapTimer = useRef(0);
	const closing = useRef(false);
	const closeTimer = useRef(0);
	const openTimer = useRef(0);
	const hiddenThumb = useRef<HTMLElement | null>(null);
	const scrolledStrip = useRef(false);

	// The side the next screen sits on: Arabic reads right to left, so it waits on the left.
	const dir = isRTL ? -1 : 1;
	const screen = screens[index];
	const labelOf = (s: Screenshot): string => t(`screenshotLabels.${s.label}`);
	const motion = (ms: number): number => (reducedMotion ? 0 : ms);

	function hideThumb(thumb: HTMLElement): void {
		showThumb();
		hiddenThumb.current = thumb;
		thumb.style.visibility = "hidden";
	}

	function showThumb(): void {
		hiddenThumb.current?.style.removeProperty("visibility");
		hiddenThumb.current = null;
	}

	function applyZoom(zoom: Zoom, duration = 0): void {
		zoomRef.current = zoom;
		animate(frameRef.current, "transform", toTransform(zoom), duration);
	}

	function moveTrack(x: number, duration = 0): void {
		animate(trackRef.current, "transform", `translate3d(${x}px, 0, 0)`, duration);
	}

	function settleSlide(target: number): void {
		pendingSlide.current = null;
		trackRef.current?.style.removeProperty("will-change");
		if (target === indexRef.current) return;
		indexRef.current = target;
		animate(frameRef.current, "transform", "");
		zoomRef.current = IDENTITY;
		// Commit the new slide order and re-centre the track in the same frame, so nothing jumps.
		flushSync(() => {
			setIndex(target);
			setZoomed(false);
		});
		moveTrack(0);
		play("swipe");
	}

	function finishSlide(): void {
		const pending = pendingSlide.current;
		if (!pending) return;
		window.clearTimeout(pending.timer);
		settleSlide(pending.target);
	}

	function go(delta: number, speed = 0): void {
		finishSlide();
		const target = indexRef.current + delta;
		const surface = surfaceRef.current;
		if (target < 0 || target >= screens.length || !surface) {
			moveTrack(0, motion(DURATION));
			return;
		}
		if (reducedMotion || Math.abs(delta) !== 1) {
			settleSlide(target);
			return;
		}
		const width = surface.clientWidth + SLIDE_GAP;
		const duration = speed > 0 ? clamp((4 * width) / speed, 200, DURATION) : DURATION;
		moveTrack(-dir * delta * width, duration);
		pendingSlide.current = {
			target,
			timer: window.setTimeout(() => settleSlide(target), duration),
		};
	}

	function cancelTap(): void {
		window.clearTimeout(tapTimer.current);
		lastTap.current = null;
	}

	function close(): void {
		if (closing.current) return;
		closing.current = true;
		window.clearTimeout(openTimer.current);
		cancelTap();
		finishSlide();
		play("select");

		const root = rootRef.current;
		const frame = frameRef.current;
		const img = imageRef.current;
		const surface = surfaceRef.current;
		const thumb = getThumbnail(screens[indexRef.current]);
		const duration = reducedMotion ? 150 : DURATION;

		root?.setAttribute("data-closing", "");
		animate(backdropRef.current, "opacity", "0", duration);
		if (!reducedMotion && thumb && isOnScreen(thumb) && frame && surface && isLoaded(img)) {
			const { zoom, clip } = coverThumbnail(img, thumb, sizeOf(surface));
			hideThumb(thumb);
			animate(img, "clip-path", restingClip(img));
			img.getBoundingClientRect();
			animate(img, "clip-path", clip, duration);
			animate(frame, "transform", toTransform(zoom), duration);
		} else if (root) {
			root.style.transition = `opacity ${duration}ms ease-out`;
			root.style.opacity = "0";
		}

		closeTimer.current = window.setTimeout(() => {
			showThumb();
			thumb?.focus({ preventScroll: true });
			onClose();
		}, duration);
	}

	useImperativeHandle(ref, () => ({ close }));

	function toggleZoom(point: Point): void {
		const img = imageRef.current;
		const surface = surfaceRef.current;
		if (!isLoaded(img) || !surface) return;
		if (zoomRef.current.scale > 1) {
			applyZoom(IDENTITY, motion(DURATION));
			setZoomed(false);
			return;
		}
		const view = sizeOf(surface);
		const zoom = zoomAround(IDENTITY, TAP_ZOOM, point, point, center(view));
		applyZoom(clampZoom(zoom, img, view), motion(DURATION));
		setZoomed(true);
	}

	function settleZoom(anchor: Point): void {
		const img = imageRef.current;
		const surface = surfaceRef.current;
		if (!isLoaded(img) || !surface) return;
		const view = sizeOf(surface);
		let zoom = zoomRef.current;
		if (zoom.scale < 1.05) zoom = IDENTITY;
		else if (zoom.scale > MAX_SCALE)
			zoom = zoomAround(zoom, MAX_SCALE, anchor, anchor, center(view));
		zoom = clampZoom(zoom, img, view);
		applyZoom(zoom, motion(DURATION));
		setZoomed(zoom.scale > 1);
	}

	function isOnImage(point: Point): boolean {
		const rect = imageRef.current?.getBoundingClientRect();
		return (
			!!rect &&
			point.x >= rect.left &&
			point.x <= rect.right &&
			point.y >= rect.top &&
			point.y <= rect.bottom
		);
	}

	function handleTap(point: Point, time: number, pointerType: string): void {
		const last = lastTap.current;
		if (
			last &&
			time - last.time < DOUBLE_TAP_MS &&
			Math.hypot(point.x - last.point.x, point.y - last.point.y) < 40
		) {
			cancelTap();
			toggleZoom(point);
			return;
		}
		lastTap.current = { time, point };
		if (pointerType === "mouse") {
			if (!isOnImage(point)) close();
			return;
		}
		tapTimer.current = window.setTimeout(() => {
			lastTap.current = null;
			setChromeVisible((visible) => !visible);
		}, DOUBLE_TAP_MS);
	}

	function startPinch(): void {
		const g = gestureRef.current;
		if (g?.mode === "swipe") moveTrack(0, motion(DURATION));
		if (g?.mode === "dismiss") endDismiss(0, 0, true);
		cancelTap();
		const [a, b] = [...pointers.current.values()];
		gestureRef.current = {
			mode: "pinch",
			pointerId: -1,
			pointerType: "touch",
			start: midpoint(a, b),
			startTime: 0,
			samples: [],
			origin: zoomRef.current,
			pinch: { distance: Math.hypot(a.x - b.x, a.y - b.y), mid: midpoint(a, b) },
		};
	}

	function update(): void {
		frameRequest.current = 0;
		const g = gestureRef.current;
		const surface = surfaceRef.current;
		const img = imageRef.current;
		if (!g || !surface) return;
		const view = sizeOf(surface);

		if (g.mode === "pinch") {
			const [a, b] = [...pointers.current.values()];
			if (!a || !b || !g.pinch || !isLoaded(img)) return;
			const raw = (g.origin.scale * Math.hypot(a.x - b.x, a.y - b.y)) / g.pinch.distance;
			const scale =
				raw > MAX_SCALE ? MAX_SCALE + (raw - MAX_SCALE) * 0.3 : raw < 1 ? 1 - (1 - raw) * 0.5 : raw;
			applyZoom(zoomAround(g.origin, scale, g.pinch.mid, midpoint(a, b), center(view)));
			return;
		}

		const point = pointers.current.get(g.pointerId);
		if (!point) return;
		let dx = point.x - g.start.x;
		let dy = point.y - g.start.y;

		if (g.mode === "pending") {
			if (Math.hypot(dx, dy) < SLOP) return;
			cancelTap();
			if (zoomRef.current.scale > 1) g.mode = "pan";
			else g.mode = Math.abs(dx) > Math.abs(dy) ? "swipe" : "dismiss";
			g.start = point;
			dx = 0;
			dy = 0;
			if (g.mode === "swipe") trackRef.current?.style.setProperty("will-change", "transform");
			if (g.mode === "dismiss") rootRef.current?.setAttribute("data-dismissing", "");
		}

		if (g.mode === "swipe") {
			const current = indexRef.current;
			const towardNext = dx * dir < 0;
			const canMove = towardNext ? current < screens.length - 1 : current > 0;
			moveTrack(canMove ? clamp(dx, -view.w, view.w) : rubberBand(dx, view.w));
		} else if (g.mode === "dismiss") {
			const y = dy > 0 ? dy : rubberBand(dy, view.h);
			const progress = clamp(y / (view.h * 0.5), 0, 1);
			const to = { x: g.start.x + dx, y: g.start.y + y };
			applyZoom(zoomAround(IDENTITY, 1 - progress * 0.35, g.start, to, center(view)));
			animate(backdropRef.current, "opacity", String(1 - progress));
		} else if (g.mode === "pan" && isLoaded(img)) {
			const { minX, maxX, minY, maxY } = panLimits(g.origin, img, view);
			applyZoom({
				scale: g.origin.scale,
				x: soften(g.origin.x + dx, minX, maxX, view.w),
				y: soften(g.origin.y + dy, minY, maxY, view.h),
			});
		}
	}

	function endSwipe(dx: number, vx: number, cancelled: boolean): void {
		const width = surfaceRef.current?.clientWidth ?? 0;
		const flick = Math.abs(vx) > FLICK_SPEED && Math.sign(vx) === Math.sign(dx);
		if (!cancelled && dx !== 0 && (Math.abs(dx) > width * 0.25 || flick)) {
			go(dx * dir < 0 ? 1 : -1, Math.abs(vx));
		} else {
			moveTrack(0, motion(DURATION));
			trackRef.current?.style.removeProperty("will-change");
		}
	}

	function endDismiss(dy: number, vy: number, cancelled: boolean): void {
		const height = surfaceRef.current?.clientHeight ?? 0;
		if (!cancelled && (dy > height * 0.15 || (vy > FLICK_SPEED && dy > 0))) {
			close();
			return;
		}
		rootRef.current?.removeAttribute("data-dismissing");
		applyZoom(IDENTITY, motion(DURATION));
		animate(backdropRef.current, "opacity", "1", motion(DURATION));
	}

	function endPan(v: Point): void {
		const img = imageRef.current;
		const surface = surfaceRef.current;
		if (!isLoaded(img) || !surface) return;
		const zoom = zoomRef.current;
		const coast = { ...zoom, x: zoom.x + v.x * 180, y: zoom.y + v.y * 180 };
		applyZoom(clampZoom(coast, img, sizeOf(surface)), motion(450));
	}

	function handlePointerDown(e: PointerEvent<HTMLDivElement>): void {
		if (closing.current || (e.pointerType === "mouse" && e.button !== 0)) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		finishSlide();
		if (pointers.current.size === 2) {
			startPinch();
			return;
		}
		if (pointers.current.size > 2) return;
		const point = { x: e.clientX, y: e.clientY };
		applyZoom(zoomRef.current);
		gestureRef.current = {
			mode: "pending",
			pointerId: e.pointerId,
			pointerType: e.pointerType,
			start: point,
			startTime: e.timeStamp,
			samples: [{ ...point, t: e.timeStamp }],
			origin: zoomRef.current,
		};
	}

	function handlePointerMove(e: PointerEvent<HTMLDivElement>): void {
		if (!pointers.current.has(e.pointerId)) return;
		const point = { x: e.clientX, y: e.clientY };
		pointers.current.set(e.pointerId, point);
		const g = gestureRef.current;
		if (!g) return;
		if (g.pointerId === e.pointerId) {
			g.samples.push({ ...point, t: e.timeStamp });
			while (g.samples.length > 2 && e.timeStamp - g.samples[0].t > 120) g.samples.shift();
		}
		if (!frameRequest.current) frameRequest.current = requestAnimationFrame(update);
	}

	function handlePointerUp(e: PointerEvent<HTMLDivElement>): void {
		if (!pointers.current.has(e.pointerId)) return;
		if (frameRequest.current) {
			cancelAnimationFrame(frameRequest.current);
			update();
		}
		pointers.current.delete(e.pointerId);
		const g = gestureRef.current;
		if (!g) return;

		if (g.mode === "pinch") {
			if (pointers.current.size < 2) {
				gestureRef.current = null;
				settleZoom(g.pinch?.mid ?? g.start);
			}
			return;
		}
		if (e.pointerId !== g.pointerId) return;
		gestureRef.current = null;

		const cancelled = e.type === "pointercancel";
		const point = { x: e.clientX, y: e.clientY };
		g.samples.push({ ...point, t: e.timeStamp });
		const v = velocity(g.samples);
		const dx = point.x - g.start.x;
		const dy = point.y - g.start.y;

		if (g.mode === "pending") {
			if (!cancelled && e.timeStamp - g.startTime < 500)
				handleTap(point, e.timeStamp, g.pointerType);
		} else if (g.mode === "swipe") {
			endSwipe(dx, v.x, cancelled);
		} else if (g.mode === "dismiss") {
			endDismiss(dy, v.y, cancelled);
		} else if (g.mode === "pan") {
			endPan(cancelled ? { x: 0, y: 0 } : v);
		}
	}

	function trapFocus(e: KeyboardEvent<HTMLDivElement>): void {
		const root = rootRef.current;
		if (!root) return;
		if (!chromeVisible) {
			e.preventDefault();
			flushSync(() => setChromeVisible(true));
			closeButtonRef.current?.focus();
			return;
		}
		const focusable = [...root.querySelectorAll<HTMLElement>("button:not(:disabled)")].filter(
			(el) => el.tabIndex >= 0 && el.offsetParent !== null,
		);
		const at = focusable.indexOf(document.activeElement as HTMLElement);
		if (e.shiftKey && at <= 0) {
			e.preventDefault();
			focusable[focusable.length - 1]?.focus();
		} else if (!e.shiftKey && (at === -1 || at === focusable.length - 1)) {
			e.preventDefault();
			focusable[0]?.focus();
		}
	}

	function handleKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
		// Page shortcuts, such as Ctrl+K for search, would open under the viewer.
		e.stopPropagation();
		if (closing.current) return;
		if (e.key === "Escape") {
			e.preventDefault();
			close();
		} else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
			e.preventDefault();
			go((e.key === "ArrowRight") === isRTL ? -1 : 1);
		} else if (e.key === "Tab") {
			trapFocus(e);
		}
	}

	function jumpTo(target: number): void {
		finishSlide();
		const delta = target - indexRef.current;
		if (delta === 0) return;
		if (Math.abs(delta) === 1) go(delta);
		else settleSlide(target);
	}

	function markImage(id: string, status: "loaded" | "error"): void {
		setImageStatus((prev) => (prev[id] === status ? prev : { ...prev, [id]: status }));
	}

	useLayoutEffect(() => {
		closeButtonRef.current?.focus({ preventScroll: true });
		const frame = frameRef.current;
		const img = imageRef.current;
		const surface = surfaceRef.current;
		const thumb = getThumbnail(screens[initialIndex]);
		const duration = reducedMotion ? 150 : DURATION;

		animate(backdropRef.current, "opacity", "0");
		backdropRef.current?.getBoundingClientRect();
		animate(backdropRef.current, "opacity", "1", duration);
		const enter = requestAnimationFrame(() => setEntered(true));

		function fadeIn(): void {
			if (!frame) return;
			frame.style.transition = "none";
			frame.style.opacity = "0";
			frame.getBoundingClientRect();
			frame.style.transition = `opacity ${duration}ms ease-out`;
			frame.style.opacity = "";
		}

		function zoomIn(): void {
			if (!frame || !surface || !thumb || !isLoaded(img)) return;
			const { zoom, clip } = coverThumbnail(img, thumb, sizeOf(surface));
			hiddenThumb.current = thumb;
			thumb.style.visibility = "hidden";
			animate(frame, "transform", toTransform(zoom));
			animate(img, "clip-path", clip);
			frame.getBoundingClientRect();
			animate(frame, "transform", "", duration);
			animate(img, "clip-path", restingClip(img), duration);
			openTimer.current = window.setTimeout(() => {
				img.style.removeProperty("clip-path");
				img.style.removeProperty("transition");
				hiddenThumb.current?.style.removeProperty("visibility");
				hiddenThumb.current = null;
			}, duration);
		}

		if (reducedMotion || !img || !thumb || !isOnScreen(thumb)) {
			fadeIn();
		} else if (img.complete && img.naturalWidth > 0) {
			zoomIn();
		} else if (frame) {
			// Give an uncached image a moment to arrive before settling for a plain fade.
			frame.style.opacity = "0";
			let waiting = true;
			openTimer.current = window.setTimeout(() => {
				waiting = false;
				fadeIn();
			}, 250);
			img.addEventListener(
				"load",
				() => {
					if (!waiting || closing.current) return;
					waiting = false;
					window.clearTimeout(openTimer.current);
					frame.style.removeProperty("opacity");
					zoomIn();
				},
				{ once: true },
			);
		}

		return () => {
			cancelAnimationFrame(enter);
			window.clearTimeout(openTimer.current);
		};
	}, [getThumbnail, initialIndex, reducedMotion, screens]);

	useEffect(() => {
		return () => {
			window.clearTimeout(tapTimer.current);
			window.clearTimeout(closeTimer.current);
			window.clearTimeout(pendingSlide.current?.timer);
			cancelAnimationFrame(frameRequest.current);
			hiddenThumb.current?.style.removeProperty("visibility");
		};
	}, []);

	// Toasts (components/Toaster.tsx) rise above the bottom bar instead of covering its buttons.
	useEffect(() => {
		const bar = bottomBarRef.current;
		const content = bar?.firstElementChild;
		if (!bar || !content) return;
		const root = document.documentElement;
		const observer = new ResizeObserver(() => {
			const height = bar.getBoundingClientRect().bottom - content.getBoundingClientRect().top;
			root.style.setProperty("--viewer-bar-h", `${height}px`);
		});
		observer.observe(bar);
		return () => {
			observer.disconnect();
			root.style.removeProperty("--viewer-bar-h");
		};
	}, []);

	useEffect(() => {
		function retry(): void {
			setImageStatus((prev) =>
				Object.fromEntries(Object.entries(prev).filter(([, status]) => status !== "error")),
			);
		}
		window.addEventListener("online", retry);
		return () => window.removeEventListener("online", retry);
	}, []);

	useEffect(() => {
		for (const offset of [2, -2]) {
			const neighbour = screens[index + offset];
			if (neighbour) preload(neighbour.url);
		}
		const strip = stripRef.current?.parentElement;
		const thumb = stripRef.current?.children[index];
		if (strip && thumb) {
			// Not scrollIntoView: near the ends it scrolls the dialog itself to centre the thumb.
			const stripBox = strip.getBoundingClientRect();
			const thumbBox = thumb.getBoundingClientRect();
			strip.scrollBy({
				left: thumbBox.left + thumbBox.width / 2 - (stripBox.left + stripBox.width / 2),
				behavior: scrolledStrip.current && !reducedMotion ? "smooth" : "instant",
			});
		}
		scrolledStrip.current = true;
	}, [index, reducedMotion, screens]);

	// Trackpad pinches arrive as ctrl+wheel; without this they would zoom the whole page.
	useEffect(() => {
		const surface = surfaceRef.current;
		if (!surface) return;
		function handleWheel(e: WheelEvent): void {
			e.preventDefault();
			const img = imageRef.current;
			if (closing.current || !surface || !isLoaded(img)) return;
			const view = sizeOf(surface);
			const zoom = zoomRef.current;
			let next: Zoom | null = null;
			if (e.ctrlKey) {
				const scale = clamp(zoom.scale * Math.exp(-e.deltaY * 0.01), 1, MAX_SCALE);
				const point = { x: e.clientX, y: e.clientY };
				next = zoomAround(zoom, scale, point, point, center(view));
			} else if (zoom.scale > 1) {
				next = { ...zoom, x: zoom.x - e.deltaX, y: zoom.y - e.deltaY };
			}
			if (!next) return;
			next = clampZoom(next, img, view);
			zoomRef.current = next;
			animate(frameRef.current, "transform", toTransform(next));
			setZoomed(next.scale > 1);
		}
		function handleResize(): void {
			if (zoomRef.current.scale === 1) return;
			zoomRef.current = IDENTITY;
			animate(frameRef.current, "transform", "");
			setZoomed(false);
		}
		surface.addEventListener("wheel", handleWheel, { passive: false });
		window.addEventListener("resize", handleResize);
		return () => {
			surface.removeEventListener("wheel", handleWheel);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const chrome = cn(
		"transition-[opacity,visibility] duration-200",
		"group-data-closing/viewer:opacity-0 group-data-dismissing/viewer:opacity-0",
		(!entered || !chromeVisible) && "opacity-0",
		!chromeVisible && "invisible",
	);
	const roundButton =
		"pointer-events-auto flex items-center justify-center rounded-full bg-zinc-800/60 text-zinc-300 backdrop-blur-md transition-colors hover:bg-zinc-700 hover:text-white focus-visible:outline-2 focus-visible:outline-white";

	return (
		<div
			ref={rootRef}
			role="dialog"
			aria-modal="true"
			aria-label={labelOf(screen)}
			tabIndex={-1}
			onKeyDown={handleKeyDown}
			className="group/viewer fixed inset-0 z-50 touch-none select-none overflow-clip outline-none"
		>
			<div ref={backdropRef} className="absolute inset-0 bg-black" />

			<div
				ref={surfaceRef}
				className={cn("absolute inset-0", zoomed && "cursor-grab active:cursor-grabbing")}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
			>
				<div ref={trackRef} className="absolute inset-0">
					{[index - 1, index, index + 1].map((i) => {
						const slide = screens[i];
						if (!slide) return null;
						const offset = (i - index) * dir;
						const isCurrent = i === index;
						const status = imageStatus[slide.id];
						return (
							<div
								key={slide.id}
								aria-hidden={!isCurrent || undefined}
								className="absolute inset-0"
								style={
									offset
										? {
												transform: `translateX(calc(${offset * 100}% + ${offset * SLIDE_GAP}px))`,
											}
										: undefined
								}
							>
								<div
									ref={isCurrent ? frameRef : undefined}
									className="relative flex size-full items-center justify-center px-3 pt-[calc(env(safe-area-inset-top)+4rem)] pb-[calc(env(safe-area-inset-bottom)+7.25rem)] md:px-24 md:pt-20 md:pb-[calc(env(safe-area-inset-bottom)+9.5rem)]"
								>
									{status === "error" ? (
										<ScreenPlaceholder
											label={labelOf(slide)}
											className="aspect-9/19 h-full w-auto max-w-full rounded-xl bg-zinc-900 text-zinc-400 ring-1 ring-white/10"
										/>
									) : (
										<img
											ref={(el) => {
												if (isCurrent) imageRef.current = el;
												if (isLoaded(el)) markImage(slide.id, "loaded");
											}}
											src={slide.url}
											alt={labelOf(slide)}
											draggable={false}
											onLoad={() => markImage(slide.id, "loaded")}
											onError={() => markImage(slide.id, "error")}
											className={cn(
												"max-h-full max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-white/10 transition-opacity duration-200",
												status !== "loaded" && "opacity-0",
											)}
										/>
									)}
									{!status && (
										<div className="absolute inset-0 flex items-center justify-center animate-in fade-in fill-mode-backwards delay-300">
											<Loader2 size={32} className="animate-spin text-zinc-500" />
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div
				className={cn(
					"pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-linear-to-b from-black/70 to-transparent p-3 ps-4 pt-[max(0.75rem,env(safe-area-inset-top))] md:justify-end md:bg-none md:p-4",
					chrome,
				)}
			>
				<p aria-live="polite" className="flex min-w-0 items-baseline gap-2 md:hidden">
					<span className="truncate text-sm font-medium text-white">{labelOf(screen)}</span>
					<span className="shrink-0 text-xs text-zinc-400 tabular-nums">
						{t("viewer.position", { current: index + 1, total: screens.length })}
					</span>
				</p>
				<button
					ref={closeButtonRef}
					type="button"
					aria-label={t("viewer.close")}
					onClick={close}
					className={cn(roundButton, "size-10 shrink-0")}
				>
					<X size={20} />
				</button>
			</div>

			<button
				type="button"
				aria-label={t("viewer.previous")}
				disabled={index === 0}
				onClick={() => go(-1)}
				className={cn(
					roundButton,
					chrome,
					"absolute start-4 top-1/2 hidden size-12 -translate-y-1/2 disabled:invisible disabled:opacity-0 md:flex",
				)}
			>
				<ChevronLeft size={28} className="rtl:rotate-180" />
			</button>
			<button
				type="button"
				aria-label={t("viewer.next")}
				disabled={index === screens.length - 1}
				onClick={() => go(1)}
				className={cn(
					roundButton,
					chrome,
					"absolute end-4 top-1/2 hidden size-12 -translate-y-1/2 disabled:invisible disabled:opacity-0 md:flex",
				)}
			>
				<ChevronRight size={28} className="rtl:rotate-180" />
			</button>

			<div
				ref={bottomBarRef}
				className={cn(
					"pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-linear-to-t from-black/70 to-transparent pt-10 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
					chrome,
				)}
			>
				<div className="pointer-events-auto flex max-w-[calc(100%-1.5rem)] items-center gap-3 md:rounded-full md:border md:border-white/10 md:bg-zinc-900/80 md:py-1.5 md:ps-4 md:pe-1.5 md:backdrop-blur-md">
					<p aria-live="polite" className="hidden min-w-0 items-baseline gap-2 md:flex">
						<span className="truncate text-sm font-medium text-white">{labelOf(screen)}</span>
						<span className="shrink-0 text-xs text-zinc-400 tabular-nums">
							{t("viewer.position", { current: index + 1, total: screens.length })}
						</span>
					</p>
					<button
						type="button"
						aria-label={t("viewer.download", { label: labelOf(screen) })}
						onClick={() => onDownload(screen)}
						disabled={isDownloading}
						className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
					>
						{isDownloading ? (
							<Loader2 size={12} className="animate-spin" />
						) : (
							<Download size={12} />
						)}
						{t("common.download")}
					</button>
				</div>

				<nav
					aria-label={t("viewer.allScreens")}
					className="pointer-events-auto w-full touch-pan-x overflow-x-auto overscroll-x-contain"
				>
					<div ref={stripRef} className="mx-auto flex w-max gap-1.5 px-4 py-1.5">
						{screens.map((s, i) => (
							<button
								key={s.id}
								type="button"
								aria-current={i === index || undefined}
								tabIndex={i === index ? 0 : -1}
								onClick={() => jumpTo(i)}
								className={cn(
									"aspect-9/19 h-11 shrink-0 overflow-hidden rounded-md opacity-45 transition-[opacity,transform] duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:h-16",
									i === index && "scale-110 opacity-100 ring-2 ring-white hover:opacity-100",
								)}
							>
								<img
									src={thumbUrl(s)}
									alt={labelOf(s)}
									loading="lazy"
									decoding="async"
									draggable={false}
									className="size-full object-cover"
								/>
							</button>
						))}
					</div>
				</nav>
			</div>
		</div>
	);
}
