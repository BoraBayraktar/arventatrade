import Link from "next/link";

import { FavoriteToggle } from "@/components/commerce/favorite-toggle";
import { Card, CardContent } from "@/components/ui/card";
import styles from "@/ui/shop/surface.module.css";
import type { Locale } from "@/lib/i18n";
import type { ProductCard as ProductCardType } from "@/modules/catalog/contracts/catalog.contract";
import { formatPrice } from "@/ui/catalog/format";

type ProductCardProps = {
  locale: Locale;
  product: ProductCardType;
  detailLabel: string;
};

export function ProductCard({ locale, product, detailLabel }: ProductCardProps) {
  const hoverImage = product.imageUrls?.[0] ?? null;

  return (
    <Card className={`${styles.panel} relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(18,18,22,0.12)]`}>
      <div className="group relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`absolute inset-0 h-full w-full object-cover transition duration-300 ease-in-out ${hoverImage ? "group-hover:opacity-0" : ""}`}
        />
        {hoverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hoverImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
          />
        ) : null}
      </div>
      <FavoriteToggle productId={product.id} productName={product.name} />
      <CardContent className="space-y-3 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{formatPrice(product.price, product.currency, locale)}</p>
          <Link
            href={`/${locale}/product/${product.slug}`}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            {detailLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
