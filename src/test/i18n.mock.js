
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import viTranslations from "../i18n/locales/vi.json";
import enTranslations from "../i18n/locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: viTranslations
    },
    en: {
      translation: enTranslations
    }
  },
  lng: "vi",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
