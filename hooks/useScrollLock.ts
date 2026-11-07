import { useLayoutEffect } from "react";

/** Keeps the page behind an overlay from scrolling for as long as the caller is mounted. */
export function useScrollLock(): void {
	useLayoutEffect(() => {
		const root = document.documentElement;
		const { overflow, scrollbarGutter } = root.style;
		// Hold the scrollbar's space only when one is showing, so locking never shifts the page.
		if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
		root.style.overflow = "hidden";
		return () => {
			root.style.overflow = overflow;
			root.style.scrollbarGutter = scrollbarGutter;
		};
	}, []);
}
