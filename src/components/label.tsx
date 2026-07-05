import { Price } from "@/components/price";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LabelProps = {
  title: string;
  amount: string | number;
  currencyCode: string;
  locale: Locale;
  position?: "bottom" | "center";
};

export function Label({ title, amount, currencyCode, locale, position = "bottom" }: LabelProps) {
  return (
    <div
      className={cn("absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label", {
        "lg:px-20 lg:pb-[35%]": position === "center",
      })}
    >
      <div className="flex min-h-12 items-center rounded-full border border-neutral-200 bg-white/70 p-1 text-xs font-semibold text-black backdrop-blur-md">
        <h3 className="mr-4 line-clamp-2 grow pl-2 leading-none tracking-tight">{title}</h3>
        <Price
          className="flex-none rounded-full bg-blue-600 p-2 text-white"
          amount={amount}
          currencyCode={currencyCode}
          locale={locale}
          currencyCodeClassName="hidden @[275px]/label:inline"
        />
      </div>
    </div>
  );
}