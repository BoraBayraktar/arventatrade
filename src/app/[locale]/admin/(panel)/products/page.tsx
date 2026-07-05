import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { ProductManager } from "@/ui/admin/product-manager";

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale as Locale);
  const user = await getCurrentUserFromContext();

  if (!user) {
    notFound();
  }

  const query = await searchParams;
  const [productResult, categories] = await Promise.all([
    catalogAdminService.listProducts({
      search: query.search,
      categoryId: query.categoryId,
      page: query.page ? Number(query.page) : 1,
      pageSize: 10,
    }),
    catalogService.listCategories(),
  ]);

  return (
    <ProductManager
      key={`${query.search ?? ""}:${query.categoryId ?? ""}:${query.page ?? "1"}`}
      locale={locale as Locale}
      initialResult={productResult}
      initialQuery={{
        search: query.search ?? "",
        categoryId: query.categoryId ?? "",
      }}
      categories={categories}
      canDelete={user.role === "ADMIN"}
      labels={{
        title: dictionary.admin.productManager,
        createTitle: dictionary.admin.createProduct,
        listTitle: dictionary.admin.productList,
        search: dictionary.admin.search,
        allCategories: dictionary.admin.allCategories,
        page: dictionary.admin.page,
        prev: dictionary.admin.prev,
        next: dictionary.admin.next,
        slug: dictionary.admin.slug,
        sku: dictionary.admin.sku,
        name: dictionary.admin.name,
        description: dictionary.admin.description,
        price: dictionary.catalog.price,
        compareAtPrice: dictionary.admin.compareAtPrice,
        stock: dictionary.admin.stock,
        imageUrl: dictionary.admin.imageUrl,
        category: dictionary.catalog.category,
        discount: dictionary.admin.discount,
        stockStatus: dictionary.admin.stockStatus,
        inStock: dictionary.admin.inStock,
        outOfStock: dictionary.admin.outOfStock,
        save: dictionary.admin.save,
        create: dictionary.admin.create,
        edit: dictionary.admin.edit,
        delete: dictionary.admin.delete,
        cancel: dictionary.admin.cancel,
        empty: dictionary.admin.emptyProducts,
        opFailed: dictionary.admin.operationFailed,
        validationRequired: dictionary.admin.validationRequired,
        validationPrice: dictionary.admin.validationPrice,
        validationStock: dictionary.admin.validationStock,
        validationCompareAtPrice: dictionary.admin.validationCompareAtPrice,
        validationImageUrl: dictionary.admin.validationImageUrl,
        loading: dictionary.common.loading,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}
