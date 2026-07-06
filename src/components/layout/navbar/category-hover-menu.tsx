"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "@/ui/shop/surface.module.css";

type CategoryItem = {
	id: string;
	slug: string;
	name: string;
	subcategories: Array<{
		id: string;
		slug: string;
		name: string;
	}>;
	products: Array<{
		slug: string;
		name: string;
	}>;
};

type CategoryHoverMenuProps = {
	locale: string;
	categories: CategoryItem[];
};

export function CategoryHoverMenu({ locale, categories }: CategoryHoverMenuProps) {
	const allLabel = locale === "tr" ? "Tum" : "All";
	const subLabel = locale === "tr" ? "Alt Kategoriler" : "Subcategories";
	const featuredLabel = locale === "tr" ? "One Cikanlar" : "Featured";
	const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

	const activeCategory = categories.find((item) => item.id === activeCategoryId) ?? null;

	return (
		<div className="relative" onMouseLeave={() => setActiveCategoryId(null)}>
			<ul className="flex flex-wrap gap-2">
				{categories.map((category) => (
					<li key={category.id} className="relative">
					<Link
						href={`/${locale}/search?category=${category.slug}`}
						onMouseEnter={() => setActiveCategoryId(category.id)}
						onFocus={() => setActiveCategoryId(category.id)}
						className="inline-flex rounded-full border border-border bg-white/80 px-3 py-2 text-sm font-medium text-foreground transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] hover:shadow-[0_10px_22px_rgba(18,18,22,0.08)]"
					>
						{category.name}
					</Link>
					</li>
				))}
			</ul>

			{activeCategory ? (
				<div className={`${styles.panel} absolute left-0 top-full z-40 mt-2 w-[min(92vw,720px)] p-4`} onMouseEnter={() => setActiveCategoryId(activeCategory.id)}>
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Link
								href={`/${locale}/search?category=${activeCategory.slug}`}
								className="mb-2 block rounded-lg bg-[color:color-mix(in_oklab,var(--background)_92%,white)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-[color:color-mix(in_oklab,var(--background)_86%,white)]"
							>
								{allLabel} {activeCategory.name}
							</Link>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{subLabel}</p>
							<ul className="space-y-1">
								{activeCategory.subcategories.map((subcategory) => (
									<li key={subcategory.id}>
										<Link
											href={`/${locale}/search?category=${subcategory.slug}`}
											className="line-clamp-1 block rounded-md px-2 py-1.5 text-sm text-foreground transition hover:bg-[color:color-mix(in_oklab,var(--background)_88%,white)] hover:text-[color:var(--primary)]"
										>
											{subcategory.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{featuredLabel}</p>
							<ul className="space-y-1">
								{activeCategory.products.map((product) => (
									<li key={product.slug}>
										<Link
											href={`/${locale}/product/${product.slug}`}
											className="line-clamp-1 block rounded-md px-2 py-1.5 text-sm text-foreground transition hover:bg-[color:color-mix(in_oklab,var(--background)_88%,white)] hover:text-[color:var(--primary)]"
										>
											{product.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
