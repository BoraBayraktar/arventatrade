import { Suspense } from "react";

import { Footer } from "@/components/layout/footer";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
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

  return (
    <>
      <div className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 text-black">
        <div className="min-h-screen w-full">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
      <Footer locale={locale as Locale} dictionary={dictionary} />
    </>
  );
}