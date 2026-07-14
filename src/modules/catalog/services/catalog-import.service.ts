import { z } from "zod";

import type { AdminProductImportResult } from "@/modules/catalog/contracts/catalog-admin.contract";
import { parseCsv } from "@/modules/catalog/services/catalog-csv.service";
import { catalogAdminService } from "@/modules/catalog/services/catalog-admin.service";

const rowSchema = z.object({
  slug: z.string().trim().min(3),
  sku: z.string().trim().min(3).max(64),
  barcode: z.string().trim().max(64).optional(),
  name: z.string().trim().min(2),
  description: z.string().trim().min(3),
  productType: z.enum(["PHYSICAL", "SERVICE", "RAW_MATERIAL", "SEMI_FINISHED"]).default("PHYSICAL"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  unitType: z.enum(["PIECE", "KILOGRAM", "GRAM", "LITER", "MILLILITER", "METER", "CENTIMETER", "BOX", "PACK"]).default("PIECE"),
  price: z.coerce.number().positive(),
  purchasePrice: z.coerce.number().nonnegative().optional().nullable(),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  currency: z.string().trim().min(3).max(3).default("TRY"),
  vatRate: z.coerce.number().int().min(0).max(100).default(20),
  stockTrackingEnabled: z.boolean().default(true),
  salesEnabled: z.boolean().default(true),
  purchaseEnabled: z.boolean().default(true),
  brandSlug: z.string().trim().optional().nullable(),
  brandName: z.string().trim().optional().nullable(),
  supplierName: z.string().trim().optional().nullable(),
  categorySlug: z.string().trim().optional().nullable(),
  preferredSalesWarehouseCode: z.string().trim().optional().nullable(),
  preferredPurchaseWarehouseCode: z.string().trim().optional().nullable(),
  searchKeywords: z.array(z.string()).default([]),
  internalNote: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().url(),
  imageUrls: z.array(z.string().trim().url()).default([]),
  features: z.array(z.object({
    key: z.string().trim().min(1),
    value: z.string().trim().min(1),
    highlighted: z.boolean().default(false),
  })).default([]),
});

function toBoolean(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "evet"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "hayir", "hayır"].includes(normalized)) {
    return false;
  }

  return undefined;
}

function splitPipe(value: string | undefined) {
  return (value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFeatures(value: string | undefined) {
  return splitPipe(value).map((item) => {
    const [key = "", featureValue = "", highlighted = "0"] = item.split(":");
    return {
      key: key.trim(),
      value: featureValue.trim(),
      highlighted: highlighted.trim() === "1" || highlighted.trim().toLowerCase() === "true",
    };
  }).filter((item) => item.key && item.value);
}

export class CatalogImportService {
  async importProductsFromCsv(csvText: string): Promise<AdminProductImportResult> {
    const { headers, rows } = parseCsv(csvText);

    if (headers.length === 0 || rows.length === 0) {
      return {
        createdCount: 0,
        failedCount: 1,
        errors: [{ rowNumber: 1, message: "CSV dosyası boş veya başlık satırı eksik." }],
      };
    }

    const headerIndex = new Map(headers.map((header, index) => [header, index]));
    const brands = new Map((await catalogAdminService.listBrands()).map((item) => [item.slug, item.id]));
    const suppliers = new Map((await catalogAdminService.listSuppliers()).map((item) => [item.name.toLowerCase(), item.id]));
    const categories = new Map((await catalogAdminService.listCategories({ page: 1, pageSize: 500 })).items.map((item) => [item.slug, item.id]));
    const warehouses = new Map((await catalogAdminService.listWarehousesForProductAdmin()).map((item) => [item.code, item.id]));

    const result: AdminProductImportResult = {
      createdCount: 0,
      failedCount: 0,
      errors: [],
    };

    for (const [index, row] of rows.entries()) {
      try {
        const raw = (key: string) => row[headerIndex.get(key) ?? -1] ?? "";
        const parsed = rowSchema.parse({
          slug: raw("slug"),
          sku: raw("sku"),
          barcode: raw("barcode") || null,
          name: raw("name"),
          description: raw("description"),
          productType: raw("productType") || undefined,
          status: raw("status") || undefined,
          unitType: raw("unitType") || undefined,
          price: raw("price"),
          purchasePrice: raw("purchasePrice") ? raw("purchasePrice") : null,
          compareAtPrice: raw("compareAtPrice") ? raw("compareAtPrice") : null,
          stock: raw("stock") || "0",
          currency: raw("currency") || "TRY",
          vatRate: raw("vatRate") || "20",
          stockTrackingEnabled: toBoolean(raw("stockTrackingEnabled")) ?? true,
          salesEnabled: toBoolean(raw("salesEnabled")) ?? true,
          purchaseEnabled: toBoolean(raw("purchaseEnabled")) ?? true,
          brandSlug: raw("brandSlug") || null,
          brandName: raw("brandName") || null,
          supplierName: raw("supplierName") || null,
          categorySlug: raw("categorySlug") || null,
          preferredSalesWarehouseCode: raw("preferredSalesWarehouseCode") || null,
          preferredPurchaseWarehouseCode: raw("preferredPurchaseWarehouseCode") || null,
          searchKeywords: splitPipe(raw("searchKeywords")),
          internalNote: raw("internalNote") || null,
          imageUrl: raw("imageUrl"),
          imageUrls: splitPipe(raw("imageUrls")),
          features: parseFeatures(raw("features")),
        });

        let brandId: string | null = null;
        if (parsed.brandSlug || parsed.brandName) {
          const candidateSlug = (parsed.brandSlug ?? parsed.brandName ?? "").trim().toLowerCase().replace(/\s+/g, "-");
          brandId = brands.get(candidateSlug) ?? null;
          if (!brandId && parsed.brandName) {
            const brand = await catalogAdminService.createBrand({
              slug: candidateSlug,
              name: parsed.brandName,
            });
            brandId = brand.id;
            brands.set(brand.slug, brand.id);
          }
        }

        let primarySupplierId: string | null = null;
        if (parsed.supplierName) {
          const supplierKey = parsed.supplierName.toLowerCase();
          primarySupplierId = suppliers.get(supplierKey) ?? null;
          if (!primarySupplierId) {
            const slug = supplierKey.replace(/\s+/g, "-");
            const supplier = await catalogAdminService.createSupplier({
              slug,
              name: parsed.supplierName,
            });
            primarySupplierId = supplier.id;
            suppliers.set(supplierKey, supplier.id);
          }
        }

        await catalogAdminService.createProduct({
          slug: parsed.slug,
          sku: parsed.sku,
          barcode: parsed.barcode,
          name: parsed.name,
          description: parsed.description,
          productType: parsed.productType,
          status: parsed.status,
          unitType: parsed.unitType,
          price: parsed.price,
          purchasePrice: parsed.purchasePrice,
          compareAtPrice: parsed.compareAtPrice,
          stock: parsed.stock,
          currency: parsed.currency,
          vatRate: parsed.vatRate,
          stockTrackingEnabled: parsed.stockTrackingEnabled,
          salesEnabled: parsed.salesEnabled,
          purchaseEnabled: parsed.purchaseEnabled,
          brandId,
          primarySupplierId,
          categoryId: parsed.categorySlug ? (categories.get(parsed.categorySlug) ?? null) : null,
          preferredSalesWarehouseId: parsed.preferredSalesWarehouseCode ? (warehouses.get(parsed.preferredSalesWarehouseCode) ?? null) : null,
          preferredPurchaseWarehouseId: parsed.preferredPurchaseWarehouseCode ? (warehouses.get(parsed.preferredPurchaseWarehouseCode) ?? null) : null,
          searchKeywords: parsed.searchKeywords,
          internalNote: parsed.internalNote,
          imageUrl: parsed.imageUrl,
          imageUrls: parsed.imageUrls,
          features: parsed.features,
        });

        result.createdCount += 1;
      } catch (error) {
        result.failedCount += 1;
        result.errors.push({
          rowNumber: index + 2,
          message: error instanceof Error ? error.message : "Bilinmeyen içe aktarma hatası",
        });
      }
    }

    return result;
  }
}

export const catalogImportService = new CatalogImportService();
