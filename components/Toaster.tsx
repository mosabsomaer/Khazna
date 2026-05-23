import { Check } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { onToast, type ToastDetail } from "../lib/toast";

const TOAST_DURATION = 2500;

export function Toaster(): JSX.Element {
	const [toasts, setToasts] = useState<ToastDetail[]>([]);

	useEffect(() => {
		return onToast((detail) => {
			setToasts((prev) => [...prev, detail]);
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== detail.id));
			}, TOAST_DURATION);
		});
	}, []);

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
			{toasts.map((t) => (
				<div
					key={t.id}
					className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-background shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200 text-sm font-medium"
				>
					<Check size={16} />
					<span>{t.message}</span>
				</div>
			))}
		</div>
	);
}
