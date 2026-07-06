import type { ProductCard as ProductCardType } from "@/modules/catalog/contracts/catalog.contract";
import type { Locale } from "@/lib/i18n";
import styles from "@/ui/shop/surface.module.css";

import { ProductCard } from "@/components/commerce/product-card";

type ProductGridProps = {
  locale: Locale;
  products: ProductCardType[];
  emptyLabel: string;
  detailLabel: string;
};

export function ProductGrid({ locale, products, emptyLabel, detailLabel }: ProductGridProps) {
  if (products.length === 0) {
    return <p className={`${styles.panel} border-dashed border-border p-8 text-sm text-muted-foreground`}>{emptyLabel}</p>;
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} locale={locale} product={product} detailLabel={detailLabel} />
      ))}
    </section>
  );
}
