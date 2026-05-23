import { useTranslation } from "react-i18next";
import { SOCIAL_LINKS } from "../constants";
import { showToast } from "../lib/toast";

async function copyEmail(): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(SOCIAL_LINKS.email);
		return true;
	} catch {
		return false;
	}
}

export function useContribute(): () => void {
	const { t } = useTranslation();

	return () => {
		const mailto = `mailto:${SOCIAL_LINKS.email}`;

		// Detect whether the OS mail handler took focus. If after ~500ms the
		// document is still focused, the mailto link likely did nothing
		// (common on Windows/Linux without a default mail client) — fall back
		// to copying the address and showing a toast.
		const hadFocus = document.hasFocus();
		window.location.href = mailto;

		setTimeout(() => {
			if (hadFocus && document.hasFocus()) {
				void copyEmail().then((ok) => {
					if (ok) showToast(t("common.emailCopied"));
				});
			}
		}, 500);
	};
}
