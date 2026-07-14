import type { AdminProductListQuery } from "@/modules/catalog/contracts/catalog-admin.contract";
import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";
import { stringifyCsv } from "@/modules/catalog/services/catalog-csv.service";

const EXPORT_HEADERS = [
  "slug",
  "sku",
  "barcode",
  "name",
  "description",
  "productType",
  "status",
  "unitType",
  "price",
  "purchasePrice",
  "compareAtPrice",
  "stock",
  "currency",
  "vatRate",
  "stockTrackingEnabled",
  "salesEnabled",
  "purchaseEnabled",
  "brandSlug",
  "brandName",
  "supplierName",
  "categorySlug",
  "preferredSalesWarehouseCode",
  "preferredPurchaseWarehouseCode",
  "searchKeywords",
  "internalNote",
  "imageUrl",
  "imageUrls",
  "features",
];

export class CatalogExportService {
  async exportProducts(query: AdminProductListQuery) {
    const result = await catalogAdminService.listProducts({
      ...query,
      page: 1,
      pageSize: 500,
    });

    const categoryMap = new Map((await catalogAdminService.listCategories({ page: 1, pageSize: 500 })).items.map((item) => [item.id, item.slug]));

    const warehouseCodeById = new Map((await catalogAdminService.listWarehousesForProductAdmin()).map((item) => [item.id, item.code]));

    const rows = result.items.map((item) => ([
      item.slug,
      item.sku,
      item.barcode ?? "",
      item.name,
      item.description,
      item.productType,
      item.status,
      item.unitType,
      item.price.toFixed(2),
      item.purchasePrice?.toFixed(2) ?? "",
      item.compareAtPrice?.toFixed(2) ?? "",
      String(item.stock),
      item.currency,
      String(item.vatRate),
      String(item.stockTrackingEnabled),
      String(item.salesEnabled),
      String(item.purchaseEnabled),
      item.brandName ? item.brandName.trim().toLowerCase().replace(/\s+/g, "-") : "",
      item.brandName ?? "",
      item.primarySupplierName ?? "",
      item.categoryId ? (categoryMap.get(item.categoryId) ?? "") : "",
      item.preferredSalesWarehouseId ? (warehouseCodeById.get(item.preferredSalesWarehouseId) ?? "") : "",
      item.preferredPurchaseWarehouseId ? (warehouseCodeById.get(item.preferredPurchaseWarehouseId) ?? "") : "",
      item.searchKeywords.join("|"),
      item.internalNote ?? "",
      item.imageUrl,
      item.imageUrls.join("|"),
      item.features.map((feature) => `${feature.key}:${feature.value}:${feature.highlighted ? "1" : "0"}`).join("|"),
    ]));

    return {
      filename: `products-export-${new Date().toISOString().slice(0, 10)}.csv`,
      content: stringifyCsv(EXPORT_HEADERS, rows),
      total: result.items.length,
    };
  }
}

export const catalogExportService = new CatalogExportService();
