type GtagFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

declare global {
	interface Window {
		gtag?: GtagFn;
	}
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
	if (typeof window === "undefined" || typeof window.gtag !== "function") return;
	window.gtag("event", eventName, params);
}
