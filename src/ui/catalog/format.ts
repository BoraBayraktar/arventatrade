import type { Locale } from "@/lib/i18n";

export function formatPrice(value: number, currency: string, locale: Locale) {
  const resolvedLocale = locale === "tr" ? "tr-TR" : "en-US";
  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency,
  }).format(value);
}
