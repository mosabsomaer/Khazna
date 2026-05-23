export type ToastDetail = { id: number; message: string };

const TOAST_EVENT = "khazna:toast";

let nextId = 1;

export function showToast(message: string): void {
	const detail: ToastDetail = { id: nextId++, message };
	window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail }));
}

export function onToast(handler: (detail: ToastDetail) => void): () => void {
	const listener = (e: Event): void => {
		handler((e as CustomEvent<ToastDetail>).detail);
	};
	window.addEventListener(TOAST_EVENT, listener);
	return () => window.removeEventListener(TOAST_EVENT, listener);
}
