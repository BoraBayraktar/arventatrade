import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function AccountOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;

	if (!isLocale(locale)) {
		notFound();
	}

	const dictionary = getDictionary(locale as Locale);

	return (
		<>
			<section className="mx-auto w-[min(1200px,95vw)] py-8">
				<h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
			</section>
			<Footer locale={locale as Locale} dictionary={dictionary} />
		</>
	);
}
