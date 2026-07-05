import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";

type FooterProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function Footer({ locale, dictionary }: FooterProps) {
  return (
    <footer className="mx-auto mt-12 w-[min(1400px,95vw)] border-t border-black/10 py-8 text-sm text-neutral-600">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {dictionary.common.brand}</p>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}`} className="hover:text-black">
            Home
          </Link>
          <span className="text-neutral-400">/</span>
          <Link href={`/${locale}/search`} className="hover:text-black">
            {dictionary.catalog.title}
          </Link>
        </div>
      </div>
    </footer>
  );
}
