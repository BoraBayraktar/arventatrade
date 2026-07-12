import type { Locale } from "@/lib/i18n";

export function formatPrice(value: number, currency: string, locale: Locale) {
  const resolvedLocale = locale === "tr" ? "tr-TR" : "tr-TR";
  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency,
  }).format(value);
}
