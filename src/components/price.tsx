import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type PriceProps = {
  amount: string | number;
  currencyCode: string;
  locale: Locale;
  className?: string;
  currencyCodeClassName?: string;
};

export function Price({ amount, currencyCode, locale, className, currencyCodeClassName }: PriceProps) {
  return (
    <p suppressHydrationWarning className={className}>
      {new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      }).format(Number(amount))}
      <span className={cn("ml-1 inline", currencyCodeClassName)}>{currencyCode}</span>
    </p>
  );
}