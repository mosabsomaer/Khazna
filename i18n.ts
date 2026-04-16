import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./data/ar.json";
import en from "./data/en.json";

function detectLanguage(): string {
	// 1. Respect any previously saved user preference
	const saved = localStorage.getItem("khazna-lang");
	if (saved) return saved;

	// 2. Detect from browser settings
	//    navigator.languages is an array like ['en-US', 'en', 'ar']
	//    navigator.language is the primary, e.g. 'en-US'
	const browserLangs = navigator.languages ?? [navigator.language];
	for (const lang of browserLangs) {
		// Normalize: 'ar-EG' -> 'ar', 'en-US' -> 'en'
		const primary = lang.split("-")[0].toLowerCase();
		if (primary === "ar") return "ar";
		if (primary === "en") return "en";
	}

	// 3. Default to Arabic for any unsupported language
	return "ar";
}

const savedLang = detectLanguage();

i18next.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		ar: { translation: ar },
	},
	lng: savedLang,
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

// Set dir and lang on init
document.documentElement.lang = savedLang;
document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";

// Persist detected language so future visits skip detection
if (!localStorage.getItem("khazna-lang")) {
	localStorage.setItem("khazna-lang", savedLang);
}

export default i18next;
