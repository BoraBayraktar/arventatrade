import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { logError } from "@/lib/observability";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { getCurrentUserFromContext } from "@/modules/identity/services/auth-context.service";
import { inventoryService } from "@/modules/inventory/services/inventory.service";
import { ProductManager } from "@/ui/admin/product-manager";

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    status?: string;
    brandId?: string;
    supplierId?: string;
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
  const adminProductRequests = await Promise.allSettled([
    catalogAdminService.listProducts({
      search: query.search,
      categoryId: query.categoryId,
      status: (query.status as "all" | "DRAFT" | "ACTIVE" | "ARCHIVED" | undefined) ?? "all",
      brandId: query.brandId,
      supplierId: query.supplierId,
      page: query.page ? Number(query.page) : 1,
      pageSize: 10,
    }),
    catalogService.listCategories(),
    inventoryService.listWarehouses(),
    catalogAdminService.listBrands(),
    catalogAdminService.listSuppliers(),
    catalogAdminService.listAttributeDefinitions(),
  ]);

  const adminProductRequestLabels = [
    "catalogAdminService.listProducts",
    "catalogService.listCategories",
    "inventoryService.listWarehouses",
    "catalogAdminService.listBrands",
    "catalogAdminService.listSuppliers",
    "catalogAdminService.listAttributeDefinitions",
  ] as const;

  const failedRequestIndex = adminProductRequests.findIndex((result) => result.status === "rejected");
  if (failedRequestIndex >= 0) {
    const failedRequest = adminProductRequests[failedRequestIndex];
    logError("Admin products page data load failed", {
      scope: "admin.products",
      failedRequest: adminProductRequestLabels[failedRequestIndex],
      error: failedRequest.status === "rejected" ? String(failedRequest.reason) : undefined,
    });
    throw failedRequest.status === "rejected"
      ? failedRequest.reason
      : new Error("Admin products page request result was unexpectedly fulfilled");
  }

  const productResult = adminProductRequests[0].status === "fulfilled" ? adminProductRequests[0].value : null;
  const categories = adminProductRequests[1].status === "fulfilled" ? adminProductRequests[1].value : [];
  const warehouses = adminProductRequests[2].status === "fulfilled" ? adminProductRequests[2].value : [];
  const brands = adminProductRequests[3].status === "fulfilled" ? adminProductRequests[3].value : [];
  const suppliers = adminProductRequests[4].status === "fulfilled" ? adminProductRequests[4].value : [];
  const attributeDefinitions = adminProductRequests[5].status === "fulfilled" ? adminProductRequests[5].value : [];

  if (!productResult) {
    throw new Error("Admin products page product list was not loaded");
  }

  return (
    <ProductManager
      key="admin-products"
      locale={locale as Locale}
      initialResult={productResult}
      initialQuery={{
        search: query.search ?? "",
        categoryId: query.categoryId ?? "",
        status: query.status ?? "all",
        brandId: query.brandId ?? "",
        supplierId: query.supplierId ?? "",
      }}
      categories={categories}
      brands={brands}
      suppliers={suppliers}
      attributeDefinitions={attributeDefinitions}
      warehouses={warehouses}
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
        barcode: dictionary.admin.barcode,
        name: dictionary.admin.name,
        description: dictionary.admin.description,
        productType: dictionary.admin.productType,
        unitType: dictionary.admin.unitType,
        price: dictionary.catalog.price,
        purchasePrice: dictionary.admin.purchasePrice,
        compareAtPrice: dictionary.admin.compareAtPrice,
        stock: dictionary.admin.stock,
        vatRate: dictionary.admin.vatRate,
        stockTrackingEnabled: dictionary.admin.stockTrackingEnabled,
        preferredSalesWarehouse: dictionary.admin.preferredSalesWarehouse,
        preferredPurchaseWarehouse: dictionary.admin.preferredPurchaseWarehouse,
        imageUrl: dictionary.admin.imageUrl,
        additionalImageUrls: dictionary.admin.additionalImageUrls,
        additionalImageUrlsHint: dictionary.admin.additionalImageUrlsHint,
        category: dictionary.catalog.category,
        brand: dictionary.admin.brand,
        supplier: dictionary.admin.supplier,
        statusLabel: dictionary.admin.status,
        statusDraft: dictionary.admin.productStatusDraft,
        statusActive: dictionary.admin.productStatusActive,
        statusArchived: dictionary.admin.productStatusArchived,
        salesEnabled: dictionary.admin.salesEnabled,
        purchaseEnabled: dictionary.admin.purchaseEnabled,
        internalNote: dictionary.admin.internalNote,
        searchKeywords: dictionary.admin.searchKeywords,
        searchKeywordsHint: dictionary.admin.searchKeywordsHint,
        allStatuses: dictionary.admin.allStatuses,
        allBrands: dictionary.admin.allBrands,
        allSuppliers: dictionary.admin.allSuppliers,
        createBrand: dictionary.admin.createBrand,
        createSupplier: dictionary.admin.createSupplier,
        manageBrands: dictionary.admin.manageBrands,
        manageSuppliers: dictionary.admin.manageSuppliers,
        searchBrand: dictionary.admin.searchBrand,
        searchSupplier: dictionary.admin.searchSupplier,
        noBrandResults: dictionary.admin.noBrandResults,
        noSupplierResults: dictionary.admin.noSupplierResults,
        createAttributeDefinition: dictionary.admin.createAttributeDefinition,
        manageAttributeDefinitions: dictionary.admin.manageAttributeDefinitions,
        attributesTitle: dictionary.admin.attributesTitle,
        attributeName: dictionary.admin.attributeName,
        attributeDisplayType: dictionary.admin.attributeDisplayType,
        attributeDisplayText: dictionary.admin.attributeDisplayText,
        attributeDisplayColor: dictionary.admin.attributeDisplayColor,
        attributeDisplayNumber: dictionary.admin.attributeDisplayNumber,
        variantAxes: dictionary.admin.variantAxes,
        variantAxesHint: dictionary.admin.variantAxesHint,
        variantTitle: dictionary.admin.variantTitle,
        variantsTitle: dictionary.admin.variantsTitle,
        variantsHint: dictionary.admin.variantsHint,
        addVariant: dictionary.admin.addVariant,
        variantOptionSummary: dictionary.admin.variantOptionSummary,
        variantPriceOverride: dictionary.admin.variantPriceOverride,
        variantPurchasePriceOverride: dictionary.admin.variantPurchasePriceOverride,
        variantCompareAtPriceOverride: dictionary.admin.variantCompareAtPriceOverride,
        variantImageUrl: dictionary.admin.variantImageUrl,
        variantStockOverride: dictionary.admin.variantStockOverride,
        variantDefault: dictionary.admin.variantDefault,
        variantSalesEnabled: dictionary.admin.variantSalesEnabled,
        variantAttributeValue: dictionary.admin.variantAttributeValue,
        variantDetails: dictionary.admin.variantDetails,
        variantEmptyState: dictionary.admin.variantEmptyState,
        variantAxisDeleteConfirm: dictionary.admin.variantAxisDeleteConfirm,
        variantAxisDeleteBlocked: dictionary.admin.variantAxisDeleteBlocked,
        variantAxisUsageCount: dictionary.admin.variantAxisUsageCount,
        selectedVariantAxes: dictionary.admin.selectedVariantAxes,
        generateVariants: dictionary.admin.generateVariants,
        generateVariantsTitle: dictionary.admin.generateVariantsTitle,
        generateVariantsHint: dictionary.admin.generateVariantsHint,
        generateVariantsValues: dictionary.admin.generateVariantsValues,
        generateVariantsApply: dictionary.admin.generateVariantsApply,
        generateVariantsEmptyAxes: dictionary.admin.generateVariantsEmptyAxes,
        generateVariantsSuggestions: dictionary.admin.generateVariantsSuggestions,
        generateVariantsUseAllSuggestions: dictionary.admin.generateVariantsUseAllSuggestions,
        orderCount: dictionary.admin.orderCount,
        soldQuantity: dictionary.admin.soldQuantity,
        grossRevenue: dictionary.admin.grossRevenue,
        averageUnitCost: dictionary.admin.averageUnitCost,
        lastPurchaseUnitCost: dictionary.admin.lastPurchaseUnitCost,
        stockValue: dictionary.admin.stockValue,
        grossProfit: dictionary.admin.grossProfit,
        grossMarginRate: dictionary.admin.grossMarginRate,
        lastOrderedAt: dictionary.admin.lastOrderedAt,
        decisionAlerts: dictionary.admin.decisionAlerts,
        alertLowMargin: dictionary.admin.alertLowMargin,
        alertSlowSales: dictionary.admin.alertSlowSales,
        alertStockRisk: dictionary.admin.alertStockRisk,
        alertHealthy: dictionary.admin.alertHealthy,
        reviewInventory: dictionary.admin.reviewInventory,
        reviewTransactions: dictionary.admin.reviewTransactions,
        brandName: dictionary.admin.brandName,
        supplierName: dictionary.admin.supplierName,
        supplierTaxNumber: dictionary.admin.supplierTaxNumber,
        supplierEmail: dictionary.admin.supplierEmail,
        supplierPhone: dictionary.admin.supplierPhone,
        importCsv: dictionary.admin.importCsv,
        exportCsv: dictionary.admin.exportCsv,
        importHint: dictionary.admin.productImportHint,
        importSuccess: dictionary.admin.productImportSuccess,
        importFailed: dictionary.admin.productImportFailed,
        exportFailed: dictionary.admin.productExportFailed,
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
        validationImageUrls: dictionary.admin.validationImageUrls,
        validationImageUrlsLimit: dictionary.admin.validationImageUrlsLimit,
        validationVariantRequired: dictionary.admin.validationVariantRequired,
        validationVariantAttributes: dictionary.admin.validationVariantAttributes,
        validationVariantImageUrl: dictionary.admin.validationVariantImageUrl,
        uploadImage: dictionary.admin.uploadImage,
        uploadImages: dictionary.admin.uploadImages,
        uploadingImage: dictionary.admin.uploadingImage,
        uploadingImages: dictionary.admin.uploadingImages,
        imageUploadFailed: dictionary.admin.imageUploadFailed,
        imageUploadHint: dictionary.admin.imageUploadHint,
        features: dictionary.admin.productFeatures,
        featuresHint: dictionary.admin.featuresHint,
        featureKey: dictionary.admin.featureKey,
        featureValue: dictionary.admin.featureValue,
        highlightFeature: dictionary.admin.highlightFeature,
        addFeature: dictionary.admin.addFeature,
        removeFeature: dictionary.admin.removeFeature,
        createEntity: dictionary.admin.create,
        loading: dictionary.common.loading,
        notSpecified: dictionary.common.notSpecified,
      }}
    />
  );
}
