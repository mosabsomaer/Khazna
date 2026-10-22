import { Check, CircleAlert, Wifi, WifiOff } from "lucide-react";
import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import { onToast, type ToastDetail } from "../lib/toast";

const TOAST_DURATION = 2500;
// Long enough to reach the button.
const ACTION_TOAST_DURATION = 8000;

const ICONS = { check: Check, error: CircleAlert, offline: WifiOff, online: Wifi };

export function Toaster(): JSX.Element {
	const [toasts, setToasts] = useState<ToastDetail[]>([]);

	const remove = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	useEffect(() => {
		return onToast((detail) => {
			setToasts((prev) => [...prev, detail]);
			setTimeout(() => remove(detail.id), detail.action ? ACTION_TOAST_DURATION : TOAST_DURATION);
		});
	}, [remove]);

	return (
		<div className="fixed inset-x-4 bottom-[calc(1.5rem+max(var(--tab-bar-h,0px)+env(safe-area-inset-bottom),var(--viewer-bar-h,0px)))] z-[100] flex flex-col items-center gap-2 pointer-events-none">
			{toasts.map((t) => {
				const Icon = ICONS[t.icon];
				return (
					<div
						key={t.id}
						role="status"
						className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-background shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200 text-sm font-medium"
					>
						<Icon size={16} className="shrink-0" />
						<span>{t.message}</span>
						{t.action && (
							<button
								type="button"
								onClick={() => {
									t.action?.onClick();
									remove(t.id);
								}}
								className="-me-2 ms-1 shrink-0 whitespace-nowrap rounded-full bg-background px-3 py-1 text-xs font-bold text-primary"
							>
								{t.action.label}
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
}
