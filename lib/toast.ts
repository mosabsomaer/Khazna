export type ToastIcon = "check" | "error" | "offline" | "online";

export type ToastAction = { label: string; onClick: () => void };

export type ToastDetail = { id: number; message: string; icon: ToastIcon; action?: ToastAction };

const TOAST_EVENT = "khazna:toast";

let nextId = 1;

export function showToast(
	message: string,
	options: { icon?: ToastIcon; action?: ToastAction } = {},
): void {
	const detail: ToastDetail = {
		id: nextId++,
		message,
		icon: options.icon ?? "check",
		action: options.action,
	};
	window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail }));
}

export function onToast(handler: (detail: ToastDetail) => void): () => void {
	const listener = (e: Event): void => {
		handler((e as CustomEvent<ToastDetail>).detail);
	};
	window.addEventListener(TOAST_EVENT, listener);
	return () => window.removeEventListener(TOAST_EVENT, listener);
}
