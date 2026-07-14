import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Star } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { GridTileImage } from "@/components/grid/tile";
import { Gallery } from "@/components/product/gallery";
import { ProductDescription } from "@/components/product/product-description";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { ProductCommunityActions } from "@/ui/shop/product-community-actions";
import styles from "@/ui/shop/product-detail.module.css";

type ProductDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function renderStars(rating: number, keyPrefix: string, starClassName?: string) {
  return Array.from({ length: 5 }).map((_, index) => {
    const isFilled = index + 1 <= rating;
    return (
      <Star
        key={`${keyPrefix}-${index}`}
        className={`${isFilled ? styles.starFilled : styles.starMuted} ${starClassName ?? ""}`.trim()}
        aria-hidden="true"
      />
    );
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const product = await catalogService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  await catalogService.trackProductView(product.id);

  const galleryImages = [product.imageUrl, ...(product.imageUrls ?? [])]
    .map((url) => url.trim())
    .filter((url, index, list) => Boolean(url) && list.indexOf(url) === index)
    .map((src) => ({ src, altText: product.name }));

  const featuredFeatures = product.features.filter((item) => item.highlighted);
  const allFeatures = product.features;

  const relatedProducts = await catalogService.listProducts({
    categorySlug: product.category?.slug,
    page: 1,
    pageSize: 6,
  });

  const related = relatedProducts.items.filter((item) => item.slug !== product.slug);
  const ratingDistribution = [...product.ratingSummary.distribution].sort((a, b) => b.stars - a.stars);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: galleryImages.map((item) => item.src),
    offers: {
      "@type": "AggregateOffer",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      priceCurrency: product.currency,
      highPrice: product.compareAtPrice ?? product.price,
      lowPrice: product.price,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.ratingSummary.average,
      reviewCount: product.ratingSummary.count,
      ratingCount: product.ratingSummary.count,
    },
    review: product.reviews.slice(0, 3).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.authorName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
      name: review.title,
      reviewBody: review.comment,
      datePublished: review.createdAt,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <div className={styles.shell}>
        <div className={styles.primaryPanel}>
          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="h-full w-full basis-full lg:basis-4/6">
              <Suspense fallback={<div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />}>
                <Gallery images={galleryImages} zoomTargetId="product-detail-info" />
              </Suspense>
            </div>

            <div id="product-detail-info" className="basis-full lg:basis-2/6">
              <Suspense fallback={null}>
                <ProductDescription
                  locale={locale}
                  product={product}
                  labels={{
                    category: dictionary.catalog.category,
                    notSpecified: dictionary.common.notSpecified,
                    addToCart: dictionary.commerce.addToCart,
                    compareAtPrice: dictionary.commerce.compareAtPrice,
                    discount: dictionary.commerce.discount,
                    stockStatus: dictionary.commerce.stockStatus,
                    inStock: dictionary.commerce.inStock,
                    outOfStock: dictionary.commerce.outOfStock,
                    quantity: dictionary.commerce.quantity,
                    addedToCart: dictionary.commerce.addedToCart,
                    viewCart: dictionary.commerce.viewCart,
                    variants: dictionary.admin.variantsTitle,
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {allFeatures.length > 0 ? (
          <section className={styles.featuresWrap}>
            {featuredFeatures.length > 0 ? (
              <div className={styles.featurePanel}>
                <h2 className={styles.featureTitle}>{dictionary.commerce.featuredFeaturesTitle}</h2>
                <div className={styles.featureCardGrid}>
                  {featuredFeatures.map((feature) => (
                    <article key={`${feature.key}-${feature.value}`} className={styles.featureCard}>
                      <p className={styles.featureKey}>{feature.key}</p>
                      <p className={styles.featureValue}>{feature.value}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={styles.featurePanel}>
              <h2 className={styles.featureTitle}>{dictionary.commerce.allFeaturesTitle}</h2>
              <div className={styles.featureRowGrid}>
                {allFeatures.map((feature) => (
                  <article key={`${feature.key}-${feature.value}-all`} className={styles.featureRow}>
                    <p className={styles.featureRowKey}>{feature.key}</p>
                    <p className={styles.featureRowValue}>{feature.value}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.communityWrap}>
          <article className={styles.communityPanel}>
            <h2 className={styles.communityTitle}>{dictionary.commerce.ratingsTitle}</h2>
            <div className={styles.ratingSummaryGrid}>
              <div className={styles.ratingSummaryBlock}>
                <div className={styles.ratingStars} aria-label={`${Math.round(product.ratingSummary.average)} / 5 ${dictionary.commerce.starsLabel}`} role="img">
                  {renderStars(Math.round(product.ratingSummary.average), "average")}
                </div>
                <p className={styles.ratingCountText}>
                  {product.ratingSummary.count} {dictionary.commerce.totalRatingsLabel}
                </p>
              </div>

              <div className={styles.ratingDistributionList}>
                {ratingDistribution.map((item) => {
                  return (
                    <div key={`distribution-${item.stars}`} className={styles.ratingDistributionRow}>
                      <span
                        className={styles.ratingDistributionLabel}
                        aria-label={`${item.stars} ${dictionary.commerce.starsLabel}`}
                        role="img"
                      >
                        {renderStars(item.stars, `distribution-${item.stars}`, styles.starTiny)}
                      </span>
                      <div className={styles.ratingDistributionBarTrack}>
                        <progress
                          className={styles.ratingDistributionProgress}
                          max={Math.max(1, product.ratingSummary.count)}
                          value={Math.max(0, item.count)}
                        />
                      </div>
                      <span className={styles.ratingDistributionCount}>{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className={styles.communityPanel}>
            <h2 className={styles.communityTitle}>{dictionary.commerce.reviewsTitle}</h2>
            {product.reviews.length > 0 ? (
              <ul className={styles.reviewList}>
                {product.reviews.map((review) => (
                  <li key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <div>
                        <p className={styles.reviewAuthor}>{review.authorName}</p>
                        <p className={styles.reviewDate}>{dateFormatter.format(new Date(review.createdAt))}</p>
                      </div>
                      <div className={styles.reviewStars}>{renderStars(review.rating, review.id)}</div>
                    </div>
                    <p className={styles.reviewTitle}>{review.title}</p>
                    <p className={styles.reviewComment}>{review.comment}</p>
                    {review.verifiedPurchase ? (
                      <span className={styles.verifiedBadge}>{dictionary.commerce.verifiedPurchase}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyStateText}>{dictionary.commerce.reviewsEmpty}</p>
            )}
          </article>

          <article className={styles.communityPanel}>
            <h2 className={styles.communityTitle}>{dictionary.commerce.questionsTitle}</h2>
            {product.questions.length > 0 ? (
              <ul className={styles.qaList}>
                {product.questions.map((item) => (
                  <li key={item.id} className={styles.qaItem}>
                    <div className={styles.qaQuestionBlock}>
                      <p className={styles.qaLabel}>{dictionary.commerce.customerQuestion}</p>
                      <p className={styles.qaText}>{item.question}</p>
                      <p className={styles.qaMeta}>
                        {item.askedBy} - {dateFormatter.format(new Date(item.askedAt))}
                      </p>
                    </div>

                    <div className={styles.qaAnswerBlock}>
                      <p className={styles.qaLabel}>{dictionary.commerce.sellerAnswer}</p>
                      {item.answer ? (
                        <>
                          <p className={styles.qaText}>{item.answer}</p>
                          <p className={styles.qaMeta}>
                            {item.answeredBy} - {item.answeredAt ? dateFormatter.format(new Date(item.answeredAt)) : ""}
                          </p>
                        </>
                      ) : (
                        <p className={styles.qaPending}>{dictionary.commerce.noAnswerYet}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyStateText}>{dictionary.commerce.questionsEmpty}</p>
            )}
          </article>

          <article className={styles.communityPanel}>
            <ProductCommunityActions
              slug={product.slug}
              labels={{
                addReviewTitle: dictionary.commerce.addReviewTitle,
                addQuestionTitle: dictionary.commerce.addQuestionTitle,
                ratingLabel: dictionary.commerce.ratingLabel,
                reviewTitleLabel: dictionary.commerce.reviewTitleLabel,
                reviewCommentLabel: dictionary.commerce.reviewCommentLabel,
                questionLabel: dictionary.commerce.questionLabel,
                submitReview: dictionary.commerce.submitReview,
                submitQuestion: dictionary.commerce.submitQuestion,
                updateReview: dictionary.commerce.updateReview,
                deleteReview: dictionary.commerce.deleteReview,
                submitSuccess: dictionary.commerce.submitSuccess,
                submitFailed: dictionary.commerce.submitFailed,
                authRequired: dictionary.commerce.authRequired,
              }}
            />
          </article>
        </section>

        {related.length ? (
          <section className={styles.relatedWrap}>
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>{dictionary.commerce.relatedProducts}</h2>
              <p className={styles.relatedNote}>{dictionary.home.featureCards.curation.text}</p>
            </div>
            <ul className={styles.relatedRail}>
              {related.map((item) => (
                <li key={item.slug} className={styles.relatedItem}>
                  <Link className={styles.relatedLink} href={`/${locale}/product/${item.slug}`} prefetch>
                    <GridTileImage
                      alt={item.name}
                      label={{
                        title: item.name,
                        amount: item.price,
                        currencyCode: item.currency,
                        locale,
                      }}
                      src={item.imageUrl}
                      fill
                      sizes="(min-width: 1280px) 18vw, (min-width: 768px) 28vw, 48vw"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <Footer locale={locale} dictionary={dictionary} />
    </>
  );
}
