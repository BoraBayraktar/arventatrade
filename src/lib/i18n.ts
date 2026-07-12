import tr from "@/i18n/tr.json";

export const locales = ["tr"] as const;

export type Locale = (typeof locales)[number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>;

const dictionaries: Record<Locale, Dictionary> = {
  tr,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.tr;
}
