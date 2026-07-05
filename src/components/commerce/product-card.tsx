import Link from "next/link";

import { FavoriteToggle } from "@/components/commerce/favorite-toggle";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import type { ProductCard as ProductCardType } from "@/modules/catalog/contracts/catalog.contract";
import { formatPrice } from "@/ui/catalog/format";

type ProductCardProps = {
  locale: Locale;
  product: ProductCardType;
  detailLabel: string;
};

export function ProductCard({ locale, product, detailLabel }: ProductCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-black/10 bg-white shadow-none transition hover:border-black/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.imageUrl} alt={product.name} className="aspect-[4/3] w-full object-cover" />
      <FavoriteToggle productId={product.id} productName={product.name} />
      <CardContent className="space-y-3 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-black">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-neutral-600">{product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-black">{formatPrice(product.price, product.currency, locale)}</p>
          <Link
            href={`/${locale}/product/${product.slug}`}
            className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-black hover:text-black"
          >
            {detailLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
