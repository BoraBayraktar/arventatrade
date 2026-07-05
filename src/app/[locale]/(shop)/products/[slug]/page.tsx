import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

type LegacyProductDetailProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function LegacyProductDetailPage({ params }: LegacyProductDetailProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  redirect(`/${locale}/product/${slug}`);
}
