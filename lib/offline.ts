import { MOCK_SCREENSHOTS } from "../constants";
import i18n from "../i18n";
import { thumbUrl } from "./screenshots";
import { showToast } from "./toast";

/** App UI on the device: saved once the person asks for it in Settings, and kept complete after. */
export interface OfflineScreens {
	saved: number;
	total: number;
	/** Downloading the missing ones right now. */
	saving: boolean;
	/** The person chose to keep App UI offline. */
	wanted: boolean;
	/** False where nothing can be kept, such as Safari with Block All Cookies on. */
	available: boolean;
}

// The worker's cache for screenshots (vite.config.ts). Only a copy there is served offline.
const SCREENS_CACHE = "khazna-screens";
const WANTED_KEY = "khazna-save-screens";
// Picking up an unfinished save waits for the launch to settle, and downloads go a few at a time
// so browsing stays quick.
const RESUME_AFTER_MS = 4000;
const AT_ONCE = 3;
// A weak signal can leave a request hanging rather than failing. Each one gets this long, and a
// round stops after a few failures in a row or two of these stretches with nothing arriving; the
// next launch, return to the app or reconnect carries on from there.
const GIVE_UP_MS = 20000;
const STOP_AFTER_FAILURES = 6;

const SCREEN_URLS = [
	...new Set(
		Object.values(MOCK_SCREENSHOTS).flatMap((screens) =>
			screens.flatMap((s) => [s.url, thumbUrl(s)]),
		),
	),
];

function chosen(): boolean {
	try {
		return localStorage.getItem(WANTED_KEY) === "1";
	} catch {
		return false;
	}
}

let screens: OfflineScreens = {
	saved: 0,
	total: SCREEN_URLS.length,
	saving: false,
	wanted: chosen(),
	available: true,
};
const listeners = new Set<() => void>();

function setScreens(patch: Partial<OfflineScreens>): void {
	screens = { ...screens, ...patch };
	for (const listener of listeners) listener();
}

export function subscribeOfflineScreens(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getOfflineScreens(): OfflineScreens {
	return screens;
}

/** The worker couldn't register, so nothing gets saved on this device. */
export function markOfflineUnavailable(): void {
	setScreens({ available: false });
}

async function unsaved(): Promise<string[]> {
	const cache = await caches.open(SCREENS_CACHE);
	const found = await Promise.all(SCREEN_URLS.map((url) => cache.match(url)));
	return SCREEN_URLS.filter((_, i) => !found[i]);
}

let running = false;

/**
 * Puts every screenshot the device doesn't have yet into the worker's screenshot cache. The page
 * stores them itself, so this works whether or not the worker is in charge of the page yet.
 */
async function download(): Promise<void> {
	if (running) return;
	if (!navigator.onLine) {
		setScreens({ saving: false });
		return;
	}
	running = true;
	try {
		const missing = await unsaved();
		setScreens({ saved: SCREEN_URLS.length - missing.length, saving: missing.length > 0 });
		if (missing.length === 0) return;
		const cache = await caches.open(SCREENS_CACHE);
		const queue = [...missing];
		let failures = 0;
		let lastArrival = performance.now();
		const next = async (): Promise<void> => {
			while (queue.length > 0 && navigator.onLine) {
				const url = queue.shift() as string;
				try {
					await cache.add(new Request(url, { signal: AbortSignal.timeout?.(GIVE_UP_MS) }));
					failures = 0;
					lastArrival = performance.now();
					setScreens({ saved: Math.min(screens.saved + 1, screens.total) });
				} catch {
					failures++;
					// Emptying the queue stops the other downloads too, before they start another round.
					const stalled = performance.now() - lastArrival >= GIVE_UP_MS * 2;
					if (failures >= STOP_AFTER_FAILURES || stalled) queue.length = 0;
				}
			}
		};
		await Promise.all(Array.from({ length: AT_ONCE }, next));
		const left = await unsaved();
		setScreens({ saved: SCREEN_URLS.length - left.length });
		if (left.length === 0) showToast(i18n.t("pwa.screensSaved"));
	} catch {
		// Storage refused (the downloads themselves never throw out of the loop).
		setScreens({ available: false });
	} finally {
		running = false;
		setScreens({ saving: false });
	}
}

/** "Save" in Settings: App UI goes on the device now and stays complete from then on. */
export function saveScreensOffline(): void {
	try {
		localStorage.setItem(WANTED_KEY, "1");
	} catch {
		// Private mode: this save still runs, it just isn't picked up again after a relaunch.
	}
	// Saving shows straight away, not after the check for what's already there.
	setScreens({ wanted: true, saving: true });
	download();
}

/** Once asked for, a save that stopped carries on, and screens added since get saved too. */
function resume(): void {
	if (screens.wanted) download();
}

export function startOfflineScreens(): void {
	if (!("caches" in window) || !navigator.serviceWorker) {
		setScreens({ available: false });
		return;
	}
	unsaved()
		.then((missing) => setScreens({ saved: SCREEN_URLS.length - missing.length }))
		.catch(() => setScreens({ available: false }));
	window.setTimeout(resume, RESUME_AFTER_MS);
	window.addEventListener("online", resume);
	// A connection that dropped without the device noticing gets another go when the app is back
	// in front, the way a native app resumes its downloads.
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") resume();
	});
}
