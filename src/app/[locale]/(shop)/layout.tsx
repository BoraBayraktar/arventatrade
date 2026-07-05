import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ShopLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar locale={locale as Locale} dictionary={dictionary} />
      {children}
    </div>
  );
}
