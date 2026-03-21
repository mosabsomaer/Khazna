import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export function useLanguage() {
	const { i18n } = useTranslation();

	const currentLanguage = i18n.language || "ar";
	const isRTL = currentLanguage === "ar";

	const toggleLanguage = useCallback(() => {
		const nextLang = currentLanguage === "ar" ? "en" : "ar";
		i18n.changeLanguage(nextLang);
		document.documentElement.lang = nextLang;
		document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
		localStorage.setItem("khazna-lang", nextLang);
	}, [currentLanguage, i18n]);

	return { currentLanguage, isRTL, toggleLanguage };
}
