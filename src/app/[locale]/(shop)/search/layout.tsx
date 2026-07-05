import { Suspense } from "react";

import { Footer } from "@/components/layout/footer";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SearchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const categories = await catalogService.listCategories();

  return (
    <>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-4 text-black md:flex-row">
        <div className="order-first w-full flex-none md:max-w-[150px]">
          <nav className="flex gap-2 overflow-x-auto md:grid md:gap-3" aria-label={dictionary.catalog.allCategories}>
            <Link className="text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline" href={`/${locale}/search`}>
              {dictionary.catalog.allCategories}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                className="whitespace-nowrap text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline"
                href={{ pathname: `/${locale}/search`, query: { category: category.slug } }}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="order-last min-h-screen w-full md:order-none">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
        <div className="order-none flex-none md:order-last md:w-[125px]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">{dictionary.commerce.sortBy}</p>
          <div className="grid gap-3 text-sm text-neutral-500">
            <span>{dictionary.commerce.relevance}</span>
            <span>{dictionary.commerce.latest}</span>
          </div>
        </div>
      </div>
      <Footer locale={locale as Locale} dictionary={dictionary} />
    </>
  );
}