"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Grid from "@/components/grid";
import { ProductGridItems } from "@/components/layout/product-grid-items";
import { Button } from "@/components/ui/button";
import styles from "@/ui/shop/surface.module.css";
import type { Locale } from "@/lib/i18n";
import type { ProductCard } from "@/modules/catalog/contracts/catalog.contract";

const FAVORITES_KEY = "2bem:favorites";
const LEGACY_FAVORITES_KEY = "arventa:favorites";
const FAVORITES_UPDATED_EVENT = "2bem:favorites-updated";
const LEGACY_FAVORITES_UPDATED_EVENT = "arventa:favorites-updated";

function readFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY) ?? window.localStorage.getItem(LEGACY_FAVORITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === "string");
  } catch {
    return [];
  }
}

type FavoritesClientProps = {
  locale: Locale;
  products: ProductCard[];
  labels: {
    title: string;
    empty: string;
    continueShopping: string;
  };
};

export function FavoritesClient({ locale, products, labels }: FavoritesClientProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setFavoriteIds(readFavorites());
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener(FAVORITES_UPDATED_EVENT, sync);
    window.addEventListener(LEGACY_FAVORITES_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(FAVORITES_UPDATED_EVENT, sync);
      window.removeEventListener(LEGACY_FAVORITES_UPDATED_EVENT, sync);
    };
  }, []);

  const favorites = useMemo(() => {
    const ids = new Set(favoriteIds);
    return products.filter((product) => ids.has(product.id));
  }, [favoriteIds, products]);

  return (
    <section className={`${styles.shell} py-5`}>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">{labels.title}</h1>

      {favorites.length === 0 ? (
        <div className={`${styles.panel} p-6`}>
          <p className={`mb-4 text-sm ${styles.panelSubtle}`}>{labels.empty}</p>
          <Button asChild variant="secondary">
            <Link href={`/${locale}/search`}>{labels.continueShopping}</Link>
          </Button>
        </div>
      ) : (
        <Grid className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <ProductGridItems locale={locale} products={favorites} />
        </Grid>
      )}
    </section>
  );
}
