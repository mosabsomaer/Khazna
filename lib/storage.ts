export function getStored(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function setStored(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {}
}
