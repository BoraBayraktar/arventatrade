import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { NavbarSearch } from "@/components/layout/navbar/search";
import { CartDropdown } from "@/components/layout/navbar/cart-dropdown";
import { CategoryHoverMenu } from "@/components/layout/navbar/category-hover-menu";
import { UserMenu } from "@/components/layout/navbar/user-menu";

type NavbarProps = {
	locale: Locale;
	dictionary: Dictionary;
};

export async function Navbar({ locale, dictionary }: NavbarProps) {
	const [categories, currentUser] = await Promise.all([
		catalogService.listCategories(),
		getCurrentUserFromContext(),
	]);
	const rootCategories = categories
		.filter((category) => category.parentId === null)
		.slice(0, 8);

	const categoryRows = await Promise.all(
		rootCategories.map(async (category) => {
			const products = await catalogService.listProducts({
				categorySlug: category.slug,
				page: 1,
				pageSize: 4,
			});

			const subcategories = categories
				.filter((item) => item.parentId === category.id)
				.map((item) => ({
					id: item.id,
					slug: item.slug,
					name: item.name,
				}));

			return {
				id: category.id,
				slug: category.slug,
				name: category.name,
				subcategories,
				products: products.items.map((item) => ({
					slug: item.slug,
					name: item.name,
				})),
			};
		}),
	);

	return (
		<nav className="relative border-b border-neutral-200 bg-white px-4 py-3 lg:px-6">
			<div className="mx-auto w-full max-w-screen-2xl">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
					<div className="flex items-center gap-3 lg:min-w-[220px]">
						<Link href={`/${locale}`} prefetch className="inline-flex items-center gap-2">
							<div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white">
								<div className="h-4 w-4 rounded-sm bg-black" />
							</div>
							<div className="text-sm font-semibold uppercase tracking-wide">{dictionary.common.brand}</div>
						</Link>
					</div>

					<div className="order-3 w-full lg:order-2 lg:flex-1">
						<NavbarSearch locale={locale} placeholder={dictionary.catalog.searchPlaceholder} />
					</div>

					<div className="order-2 flex items-center justify-end gap-1.5 lg:order-3 lg:min-w-[360px]">
						<UserMenu locale={locale} initialUser={currentUser} />
						<Button asChild size="sm" variant="ghost">
							<Link href={`/${locale}/favorites`} className="inline-flex items-center gap-2">
								<Heart className="h-4 w-4" />
								<span className="hidden xl:inline">{dictionary.common.favorites}</span>
							</Link>
						</Button>
						<CartDropdown
							locale={locale}
							labels={{
								cartTitle: dictionary.commerce.cartTitle,
								cartEmpty: dictionary.commerce.cartEmpty,
								viewCart: dictionary.commerce.viewCart,
								checkout: dictionary.commerce.checkout,
								continueShopping: dictionary.commerce.continueShopping,
								promotionCode: dictionary.commerce.promotionCode,
							}}
						/>
					</div>
				</div>

				<div className="mt-3 border-t border-neutral-200 pt-3">
					<CategoryHoverMenu locale={locale} categories={categoryRows} />
				</div>
			</div>
		</nav>
	);
}
