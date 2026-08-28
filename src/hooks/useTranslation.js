import { useLanguage } from "../context/LanguageContext";
import vi from "../locales/vi.json";
import en from "../locales/en.json";

const translations = { vi, en };

export const useTranslation = () => {
  const { locale } = useLanguage();
  const t = (key) => {
    const keys = key.split(".");
    let value = translations[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  return { t };
};