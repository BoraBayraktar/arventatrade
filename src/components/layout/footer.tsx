import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";
import styles from "@/ui/shop/home.module.css";

type FooterProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function Footer({ locale, dictionary }: FooterProps) {
  return (
    <footer className={styles.footerPanel}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {dictionary.common.brand}</p>
        <div className={styles.footerLinks}>
          <Link href={`/${locale}`} className={styles.footerLink}>
            Home
          </Link>
          <span className="text-neutral-400">/</span>
          <Link href={`/${locale}/search`} className={styles.footerLink}>
            {dictionary.catalog.title}
          </Link>
        </div>
      </div>
    </footer>
  );
}
