import en from "@/i18n/en.json";
import tr from "@/i18n/tr.json";

export const locales = ["tr", "en"] as const;

export type Locale = (typeof locales)[number];
export type Dictionary = Record<string, any>;

const dictionaries: Record<Locale, Dictionary> = {
  tr,
  en,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.tr;
}
