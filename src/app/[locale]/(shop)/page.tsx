import Link from "next/link";
import { notFound } from "next/navigation";

import { Carousel } from "@/components/carousel";
import styles from "@/ui/shop/home.module.css";
import { GridTileImage } from "@/components/grid/tile";
import { ThreeItemGrid } from "@/components/grid/three-items";
import { Footer } from "@/components/layout/footer";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import type { ProductCard } from "@/modules/catalog/contracts/catalog.contract";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import type { StorefrontItem } from "@/modules/storefront/contracts/storefront.contract";
import { storefrontService } from "@/modules/storefront/services/storefront.service";

function getStorefrontTile(item: StorefrontItem, locale: Locale, fallbackProduct: ProductCard | undefined) {
  if (item.target?.type === "PRODUCT") {
    return {
      href: `/${locale}/product/${item.target.slug}`,
      imageUrl: item.target.imageUrl,
      imageAlt: item.target.title,
      amount: item.target.price,
      currency: item.target.currency,
    };
  }

  if (item.target?.type === "CATEGORY" && item.target.imageUrl) {
    return {
      href: `/${locale}/search?category=${item.target.slug}`,
      imageUrl: item.target.imageUrl,
      imageAlt: item.target.title,
      amount: "0",
      currency: "TRY",
    };
  }

  if (fallbackProduct) {
    return {
      href: `/${locale}/product/${fallbackProduct.slug}`,
      imageUrl: fallbackProduct.imageUrl,
      imageAlt: fallbackProduct.name,
      amount: fallbackProduct.price,
      currency: fallbackProduct.currency,
    };
  }

  return null;
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const [products, storefront] = await Promise.all([
    catalogService.listProducts({ page: 1, pageSize: 8 }),
    storefrontService.getHomeSections(locale as Locale),
  ]);
  const storefrontItems = [...storefront.campaigns, ...storefront.features];

  return (
    <main className={styles.homeShell}>
      <section className={styles.hero}>
        <div className={styles.heroPanel}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>{dictionary.home.eyebrow}</div>
            <h1 className={styles.heroTitle}>{dictionary.home.title}</h1>
            <p className={styles.heroSubtitle}>{dictionary.home.subtitle}</p>
            <div className={styles.heroActions}>
              <Link href={`/${locale}/search`} className={`${styles.heroButton} ${styles.heroButtonPrimary}`}>{dictionary.home.cta}</Link>
              <Link href={`/${locale}/favorites`} className={styles.heroButton}>{dictionary.common.favorites}</Link>
            </div>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.heroVisual}>
            <div className={styles.heroVisualInner}>
              <div className={`${styles.heroVisualCard} ${styles.heroVisualTop}`} />
              <div className={`${styles.heroVisualCard} ${styles.heroVisualBottom}`} />
              <div className={styles.heroVisualPill} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>{dictionary.home.campaignTitle}</p>
            <h2 className={styles.sectionTitle}>{dictionary.home.spotlightTitle}</h2>
          </div>
          <p className={styles.sectionNote}>{dictionary.home.spotlightBody}</p>
        </div>
        <div className={styles.panelWrap}>
          <ThreeItemGrid locale={locale} products={products.items} />
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>{dictionary.home.campaignTitle}</p>
            <h2 className={styles.sectionTitle}>{dictionary.catalog.summaryTitle}</h2>
          </div>
          <p className={styles.sectionNote}>{dictionary.home.featureCards.conversion.text}</p>
        </div>
        <div className={`${styles.panelWrap} ${styles.scroller}`}>
          <Carousel locale={locale} products={products.items} />
        </div>
      </section>

      {storefrontItems.length ? (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>{dictionary.home.campaignTitle}</p>
              <h2 className={styles.sectionTitle}>{dictionary.home.featureTitle}</h2>
            </div>
            <p className={styles.sectionNote}>{dictionary.home.campaignCards.fast.text}</p>
          </div>
          <div className={styles.panelWrap}>
            <div className={styles.campaignGrid}>
              {storefrontItems.map((item, index) => {
                const tile = getStorefrontTile(item, locale as Locale, products.items[index % products.items.length]);

                if (!tile) {
                  return null;
                }

                return (
                  <Link key={item.id} href={tile.href} className="group block">
                    <article className={styles.campaignCard}>
                      <div className={styles.campaignImage}>
                        <GridTileImage
                          alt={tile.imageAlt}
                          src={tile.imageUrl}
                          width={600}
                          height={600}
                          label={{
                            title: item.title,
                            amount: tile.amount,
                            currencyCode: tile.currency,
                            locale: locale as Locale,
                          }}
                        />
                      </div>
                      <div className={styles.campaignBody}>
                        <p className={styles.campaignKicker}>{item.targetType === "CATEGORY" ? dictionary.catalog.category : item.variant}</p>
                        <p className={styles.campaignText}>{item.description}</p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      <Footer locale={locale} dictionary={dictionary} />
    </main>
  );
}
