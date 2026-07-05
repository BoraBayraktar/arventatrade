import Link from "next/link";

import { GridTileImage } from "@/components/grid/tile";
import { FavoriteToggle } from "@/components/commerce/favorite-toggle";
import type { Locale } from "@/lib/i18n";
import type { ProductCard } from "@/modules/catalog/contracts/catalog.contract";

type ThreeItemGridProps = {
  locale: Locale;
  products: ProductCard[];
};

function ThreeItemGridItem({ locale, item, size, priority }: { locale: Locale; item: ProductCard; size: "full" | "half"; priority?: boolean }) {
  return (
    <div className={size === "full" ? "relative md:col-span-4 md:row-span-2" : "relative md:col-span-2 md:row-span-1"}>
      <Link className="relative block aspect-square h-full w-full" href={`/${locale}/product/${item.slug}`} prefetch>
        <GridTileImage
          src={item.imageUrl}
          fill
          sizes={size === "full" ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          priority={priority}
          alt={item.name}
          label={{
            position: size === "full" ? "center" : "bottom",
            title: item.name,
            amount: item.price,
            currencyCode: item.currency,
            locale,
          }}
        />
      </Link>
      <FavoriteToggle productId={item.id} productName={item.name} />
    </div>
  );
}

export function ThreeItemGrid({ locale, products }: ThreeItemGridProps) {
  if (!products[0] || !products[1] || !products[2]) {
    return null;
  }

  return (
    <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem locale={locale} size="full" item={products[0]} priority />
      <ThreeItemGridItem locale={locale} size="half" item={products[1]} priority />
      <ThreeItemGridItem locale={locale} size="half" item={products[2]} />
    </section>
  );
}