"use client";

import { useState } from "react";
import Link from "next/link";

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
						className="inline-flex rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-black"
					>
						{category.name}
					</Link>
					</li>
				))}
			</ul>

			{activeCategory ? (
				<div className="absolute left-0 top-full z-40 mt-2 w-[min(92vw,720px)] rounded-xl border border-neutral-200 bg-white p-4 shadow-xl" onMouseEnter={() => setActiveCategoryId(activeCategory.id)}>
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Link
								href={`/${locale}/search?category=${activeCategory.slug}`}
								className="mb-2 block rounded-lg bg-neutral-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 transition hover:bg-neutral-100"
							>
								{allLabel} {activeCategory.name}
							</Link>
							<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{subLabel}</p>
							<ul className="space-y-1">
								{activeCategory.subcategories.map((subcategory) => (
									<li key={subcategory.id}>
										<Link
											href={`/${locale}/search?category=${subcategory.slug}`}
											className="line-clamp-1 block rounded-md px-2 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-black"
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
											className="line-clamp-1 block rounded-md px-2 py-1.5 text-sm text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700"
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
