import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

type LegacyProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function LegacyProductsPage({ params, searchParams }: LegacyProductsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const query = await searchParams;
  const paramsBuilder = new URLSearchParams();

  if (query.search) {
    paramsBuilder.set("q", query.search);
  }

  if (query.category) {
    paramsBuilder.set("category", query.category);
  }

  if (query.page) {
    paramsBuilder.set("page", query.page);
  }

  const queryString = paramsBuilder.toString();
  redirect(queryString ? `/${locale}/search?${queryString}` : `/${locale}/search`);
}
