import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./data/ar.json";
import en from "./data/en.json";

const savedLang = localStorage.getItem("khazna-lang") || "ar";

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

export default i18next;
