import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";
import ar from "./locales/ar";

export const SUPPORTED_LANGS = [
  { code: "en", label: "English", dir: "ltr" as const },
  { code: "es", label: "Español", dir: "ltr" as const },
  { code: "fr", label: "Français", dir: "ltr" as const },
  { code: "ar", label: "العربية", dir: "rtl" as const },
];

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        ar: { translation: ar },
      },
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });
}

export function applyLanguageDir(code: string) {
  const lang = SUPPORTED_LANGS.find((l) => l.code === code);
  if (typeof document !== "undefined") {
    document.documentElement.dir = lang?.dir ?? "ltr";
    document.documentElement.lang = code;
  }
}

i18n.on("languageChanged", applyLanguageDir);

export default i18n;
