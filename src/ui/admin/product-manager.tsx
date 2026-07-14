"use client";

import { useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Plus, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n";
import type { ProductFeature } from "@/modules/catalog/contracts/catalog.contract";
import type { AdminWarehouseItem } from "@/modules/inventory/contracts/inventory.contract";

type Category = {
  id: string;
  slug: string;
  name: string;
};

type Brand = {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
};

type Supplier = {
  id: string;
  slug: string;
  name: string;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
};

type AttributeDefinition = {
  id: string;
  slug: string;
  name: string;
  displayType: "TEXT" | "COLOR" | "NUMBER";
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

type ProductAttributeLink = {
  attributeDefinitionId: string;
  isVariantAxis: boolean;
  sortOrder?: number;
};

type ProductVariantValue = {
  attributeDefinitionId: string;
  value: string;
};

type ProductVariant = {
  id?: string;
  slug: string;
  sku: string;
  barcode: string;
  title: string;
  optionSummary: string;
  priceOverride: string;
  purchasePriceOverride: string;
  compareAtPriceOverride: string;
  imageUrl: string;
  imageUrls: string[];
  stockOverride: string;
  salesEnabled: boolean;
  isDefault: boolean;
  sortOrder: string;
  attributes: ProductVariantValue[];
};

type Product = {
  id: string;
  slug: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string;
  productType: "PHYSICAL" | "SERVICE" | "RAW_MATERIAL" | "SEMI_FINISHED";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  unitType: "PIECE" | "KILOGRAM" | "GRAM" | "LITER" | "MILLILITER" | "METER" | "CENTIMETER" | "BOX" | "PACK";
  price: number;
  purchasePrice: number | null;
  compareAtPrice: number | null;
  discountRate: number | null;
  stock: number;
  inStock: boolean;
  currency: string;
  vatRate: number;
  stockTrackingEnabled: boolean;
  salesEnabled: boolean;
  purchaseEnabled: boolean;
  internalNote: string | null;
  searchKeywords: string[];
  brandId: string | null;
  brandName: string | null;
  primarySupplierId: string | null;
  primarySupplierName: string | null;
  preferredSalesWarehouseId: string | null;
  preferredPurchaseWarehouseId: string | null;
  imageUrl: string;
  imageUrls?: string[];
  features: ProductFeature[];
  categoryId: string | null;
  categoryName: string | null;
  orderCount: number;
  soldQuantity: number;
  grossRevenue: number;
  averageUnitCost: number | null;
  lastPurchaseUnitCost: number | null;
  stockValue: number;
  grossProfit: number;
  grossMarginRate: number | null;
  lastOrderedAt: string | null;
  attributeLinks?: ProductAttributeLink[];
  variants?: Array<{
    id?: string;
    slug: string;
    sku: string;
    barcode?: string | null;
    title: string;
    optionSummary: string;
    priceOverride?: number | null;
    purchasePriceOverride?: number | null;
    compareAtPriceOverride?: number | null;
    imageUrl?: string | null;
    imageUrls?: string[];
    stockOverride?: number | null;
    salesEnabled?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
    attributes: ProductVariantValue[];
  }>;
};

type Labels = {
  title: string;
  createTitle: string;
  listTitle: string;
  search: string;
  allCategories: string;
  page: string;
  prev: string;
  next: string;
  slug: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  productType: string;
  brand: string;
  supplier: string;
  statusLabel: string;
  statusDraft: string;
  statusActive: string;
  statusArchived: string;
  unitType: string;
  price: string;
  purchasePrice: string;
  compareAtPrice: string;
  stock: string;
  vatRate: string;
  stockTrackingEnabled: string;
  salesEnabled: string;
  purchaseEnabled: string;
  internalNote: string;
  searchKeywords: string;
  searchKeywordsHint: string;
  allStatuses: string;
  allBrands: string;
  allSuppliers: string;
  createBrand: string;
  createSupplier: string;
  createAttributeDefinition: string;
  attributesTitle: string;
  attributeName: string;
  attributeDisplayType: string;
  attributeDisplayText: string;
  attributeDisplayColor: string;
  attributeDisplayNumber: string;
  variantAxes: string;
  variantAxesHint: string;
  variantsTitle: string;
  variantsHint: string;
  addVariant: string;
  variantTitle: string;
  variantOptionSummary: string;
  variantPriceOverride: string;
  variantPurchasePriceOverride: string;
  variantCompareAtPriceOverride: string;
  variantImageUrl: string;
  variantStockOverride: string;
  variantDefault: string;
  variantSalesEnabled: string;
  variantAttributeValue: string;
  variantDetails: string;
  variantEmptyState: string;
  variantAxisDeleteConfirm: string;
  variantAxisDeleteBlocked: string;
  variantAxisUsageCount: string;
  selectedVariantAxes: string;
  generateVariants: string;
  generateVariantsTitle: string;
  generateVariantsHint: string;
  generateVariantsValues: string;
  generateVariantsApply: string;
  generateVariantsEmptyAxes: string;
  generateVariantsSuggestions: string;
  generateVariantsUseAllSuggestions: string;
  orderCount: string;
  soldQuantity: string;
  grossRevenue: string;
  averageUnitCost: string;
  lastPurchaseUnitCost: string;
  stockValue: string;
  grossProfit: string;
  grossMarginRate: string;
  lastOrderedAt: string;
  decisionAlerts: string;
  alertLowMargin: string;
  alertSlowSales: string;
  alertStockRisk: string;
  alertHealthy: string;
  reviewInventory: string;
  reviewTransactions: string;
  brandName: string;
  supplierName: string;
  supplierTaxNumber: string;
  supplierEmail: string;
  supplierPhone: string;
  preferredSalesWarehouse: string;
  preferredPurchaseWarehouse: string;
  imageUrl: string;
  additionalImageUrls: string;
  additionalImageUrlsHint: string;
  category: string;
  discount: string;
  stockStatus: string;
  inStock: string;
  outOfStock: string;
  save: string;
  create: string;
  edit: string;
  delete: string;
  cancel: string;
  empty: string;
  opFailed: string;
  validationRequired: string;
  validationPrice: string;
  validationStock: string;
  validationCompareAtPrice: string;
  validationImageUrl: string;
  validationImageUrls: string;
  validationImageUrlsLimit: string;
  validationVariantRequired: string;
  validationVariantAttributes: string;
  validationVariantImageUrl: string;
  uploadImage: string;
  uploadImages: string;
  uploadingImage: string;
  uploadingImages: string;
  imageUploadFailed: string;
  imageUploadHint: string;
  features: string;
  featuresHint: string;
  featureKey: string;
  featureValue: string;
  highlightFeature: string;
  addFeature: string;
  removeFeature: string;
  importCsv: string;
  exportCsv: string;
  importHint: string;
  importSuccess: string;
  importFailed: string;
  exportFailed: string;
  createEntity: string;
  loading: string;
  notSpecified: string;
};

type ProductManagerProps = {
  labels: Labels;
  locale: Locale;
  initialResult: {
    items: Product[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  initialQuery: {
    search: string;
    categoryId: string;
    status: string;
    brandId: string;
    supplierId: string;
  };
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  attributeDefinitions: AttributeDefinition[];
  warehouses: AdminWarehouseItem[];
  canDelete: boolean;
};

type ProductForm = {
  slug: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  productType: string;
  status: string;
  unitType: string;
  price: string;
  purchasePrice: string;
  compareAtPrice: string;
  stock: string;
  vatRate: string;
  stockTrackingEnabled: boolean;
  salesEnabled: boolean;
  purchaseEnabled: boolean;
  internalNote: string;
  searchKeywords: string;
  brandId: string;
  primarySupplierId: string;
  preferredSalesWarehouseId: string;
  preferredPurchaseWarehouseId: string;
  imageUrl: string;
  imageUrls: string[];
  categoryId: string;
  features: ProductFeature[];
  attributeLinks: ProductAttributeLink[];
  variants: ProductVariant[];
};

type DrawerMode = "create" | "edit";
type QuickCreateDrawerMode = "brand" | "supplier";
type AttributeDefinitionEditorState = {
  id: string;
  slug: string;
  name: string;
  displayType: AttributeDefinition["displayType"];
  sortOrder: string;
};
type VariantGenerationState = Record<string, string>;

const NONE_VALUE = "__none__";
const MAX_PRODUCT_IMAGES = 6;

const PRODUCT_TYPE_OPTIONS = [
  { value: "PHYSICAL", tr: "Fiziksel", en: "Physical" },
  { value: "SERVICE", tr: "Hizmet", en: "Service" },
  { value: "RAW_MATERIAL", tr: "Hammadde", en: "Raw Material" },
  { value: "SEMI_FINISHED", tr: "Yarı Mamul", en: "Semi Finished" },
] as const;

const PRODUCT_STATUS_OPTIONS = [
  { value: "DRAFT", labelKey: "statusDraft" },
  { value: "ACTIVE", labelKey: "statusActive" },
  { value: "ARCHIVED", labelKey: "statusArchived" },
] as const;

const UNIT_TYPE_OPTIONS = [
  { value: "PIECE", tr: "Adet", en: "Piece" },
  { value: "KILOGRAM", tr: "Kilogram", en: "Kilogram" },
  { value: "GRAM", tr: "Gram", en: "Gram" },
  { value: "LITER", tr: "Litre", en: "Liter" },
  { value: "MILLILITER", tr: "Mililitre", en: "Milliliter" },
  { value: "METER", tr: "Metre", en: "Meter" },
  { value: "CENTIMETER", tr: "Santimetre", en: "Centimeter" },
  { value: "BOX", tr: "Kutu", en: "Box" },
  { value: "PACK", tr: "Paket", en: "Pack" },
] as const;

function isVariantRowEmpty(variant: ProductVariant) {
  return ![
    variant.slug,
    variant.sku,
    variant.barcode,
    variant.title,
    variant.optionSummary,
    variant.priceOverride,
    variant.purchasePriceOverride,
    variant.compareAtPriceOverride,
    variant.imageUrl,
    variant.stockOverride,
    variant.sortOrder,
    ...variant.attributes.map((attribute) => attribute.value),
  ].some((value) => value.trim());
}

function toPayload(form: ProductForm) {
  const stockTrackingEnabled = form.productType === "SERVICE" ? false : form.stockTrackingEnabled;
  const compareAtPrice = form.compareAtPrice.trim() ? Number(form.compareAtPrice) : null;
  const mergedImages = Array.from(
    new Set([form.imageUrl, ...(form.imageUrls ?? [])].map((value) => value.trim()).filter(Boolean)),
  ).slice(0, MAX_PRODUCT_IMAGES);
  const mainImage = mergedImages[0] ?? "";
  const additionalImages = mergedImages.slice(1);

  const imageUrls = Array.from(
    new Set(
      additionalImages
        .map((value) => value.trim())
        .filter((value) => Boolean(value) && value !== mainImage),
    ),
  );

  const features = form.features
    .map((feature) => ({
      key: feature.key.trim(),
      value: feature.value.trim(),
      highlighted: Boolean(feature.highlighted),
    }))
    .filter((feature) => feature.key && feature.value);

  const attributeLinks = form.attributeLinks
    .map((link, index) => ({
      attributeDefinitionId: link.attributeDefinitionId,
      isVariantAxis: Boolean(link.isVariantAxis),
      sortOrder: link.sortOrder ?? index,
    }))
    .filter((link) => link.attributeDefinitionId);

  const variants = form.variants
    .filter((variant) => !isVariantRowEmpty(variant))
    .map((variant, index) => ({
      ...(variant.id ? { id: variant.id } : {}),
      slug: variant.slug.trim(),
      sku: variant.sku.trim(),
      barcode: variant.barcode.trim() || null,
      title: variant.title.trim(),
      optionSummary: variant.optionSummary.trim(),
      priceOverride: variant.priceOverride.trim() ? Number(variant.priceOverride) : null,
      purchasePriceOverride: variant.purchasePriceOverride.trim() ? Number(variant.purchasePriceOverride) : null,
      compareAtPriceOverride: variant.compareAtPriceOverride.trim() ? Number(variant.compareAtPriceOverride) : null,
      imageUrl: variant.imageUrl.trim() || null,
      imageUrls: variant.imageUrls.map((item) => item.trim()).filter(Boolean),
      stockOverride: variant.stockOverride.trim() ? Number(variant.stockOverride) : null,
      salesEnabled: Boolean(variant.salesEnabled),
      isDefault: Boolean(variant.isDefault),
      sortOrder: variant.sortOrder.trim() ? Number(variant.sortOrder) : index,
      attributes: variant.attributes
        .map((attribute) => ({
          attributeDefinitionId: attribute.attributeDefinitionId,
          value: attribute.value.trim(),
        }))
        .filter((attribute) => attribute.attributeDefinitionId && attribute.value),
    }));

  return {
    slug: form.slug,
    sku: form.sku,
    barcode: form.barcode.trim() || null,
    name: form.name,
    description: form.description,
    productType: form.productType,
    status: form.status,
    unitType: form.unitType,
    price: Number(form.price),
    purchasePrice: form.purchasePrice.trim() ? Number(form.purchasePrice) : null,
    compareAtPrice,
    stock: stockTrackingEnabled ? Number(form.stock) : 0,
    vatRate: Number(form.vatRate),
    stockTrackingEnabled,
    salesEnabled: form.salesEnabled,
    purchaseEnabled: form.purchaseEnabled,
    internalNote: form.internalNote.trim() || null,
    searchKeywords: form.searchKeywords.split(",").map((item) => item.trim()).filter(Boolean),
    brandId: form.brandId.trim() || null,
    primarySupplierId: form.primarySupplierId.trim() || null,
    preferredSalesWarehouseId: form.preferredSalesWarehouseId.trim() || null,
    preferredPurchaseWarehouseId: form.preferredPurchaseWarehouseId.trim() || null,
    imageUrl: mainImage,
    imageUrls,
    features,
    categoryId: form.categoryId || null,
    attributeLinks,
    variants,
  };
}

function createEmptyFeature(): ProductFeature {
  return {
    key: "",
    value: "",
    highlighted: false,
  };
}

function createEmptyVariant(): ProductVariant {
  return {
    slug: "",
    sku: "",
    barcode: "",
    title: "",
    optionSummary: "",
    priceOverride: "",
    purchasePriceOverride: "",
    compareAtPriceOverride: "",
    imageUrl: "",
    imageUrls: [],
    stockOverride: "",
    salesEnabled: true,
    isDefault: false,
    sortOrder: "",
    attributes: [],
  };
}

function buildVariantOptionSummary(
  attributes: ProductVariantValue[],
  activeAttributeLinks: ProductAttributeLink[],
  attributeDefinitions: AttributeDefinition[],
) {
  return activeAttributeLinks
    .map((link) => {
      const definition = attributeDefinitions.find((item) => item.id === link.attributeDefinitionId);
      const value = attributes.find((attribute) => attribute.attributeDefinitionId === link.attributeDefinitionId)?.value.trim() ?? "";

      if (!definition || !value) {
        return null;
      }

      return `${definition.name}: ${value}`;
    })
    .filter((item): item is string => Boolean(item))
    .join(" / ");
}

function buildVariantTitle(
  productName: string,
  attributes: ProductVariantValue[],
  activeAttributeLinks: ProductAttributeLink[],
  attributeDefinitions: AttributeDefinition[],
) {
  const baseName = productName.trim();
  const optionSummary = buildVariantOptionSummary(attributes, activeAttributeLinks, attributeDefinitions);

  if (!baseName) {
    return optionSummary;
  }

  if (!optionSummary) {
    return baseName;
  }

  return `${baseName} - ${optionSummary}`;
}

function normalizeSegment(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildVariantSuffix(
  attributes: ProductVariantValue[],
  activeAttributeLinks: ProductAttributeLink[],
) {
  return activeAttributeLinks
    .map((link) => attributes.find((attribute) => attribute.attributeDefinitionId === link.attributeDefinitionId)?.value.trim() ?? "")
    .filter(Boolean)
    .map((value) => normalizeSegment(value))
    .filter(Boolean)
    .join("-");
}

function buildVariantSlug(
  productSlug: string,
  attributes: ProductVariantValue[],
  activeAttributeLinks: ProductAttributeLink[],
) {
  const baseSlug = normalizeSegment(productSlug);
  const suffix = buildVariantSuffix(attributes, activeAttributeLinks);

  if (!baseSlug) {
    return suffix;
  }

  if (!suffix) {
    return baseSlug;
  }

  return `${baseSlug}-${suffix}`;
}

function buildVariantSku(
  productSku: string,
  attributes: ProductVariantValue[],
  activeAttributeLinks: ProductAttributeLink[],
) {
  const baseSku = productSku.trim().toUpperCase();
  const suffix = activeAttributeLinks
    .map((link) => attributes.find((attribute) => attribute.attributeDefinitionId === link.attributeDefinitionId)?.value.trim() ?? "")
    .filter(Boolean)
    .map((value) =>
      normalizeSegment(value)
        .replace(/-/g, "")
        .toUpperCase(),
    )
    .filter(Boolean)
    .join("-");

  if (!baseSku) {
    return suffix;
  }

  if (!suffix) {
    return baseSku;
  }

  return `${baseSku}-${suffix}`;
}

function parseGenerationValues(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getGalleryImages(form: ProductForm) {
  return Array.from(new Set([form.imageUrl, ...(form.imageUrls ?? [])].map((value) => value.trim()).filter(Boolean))).slice(0, MAX_PRODUCT_IMAGES);
}

function formatPrice(price: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
    style: "currency",
    currency,
  }).format(price);
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "tr-TR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function differenceInDays(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

export function ProductManager({
  labels,
  locale,
  initialResult,
  initialQuery,
  categories,
  brands,
  suppliers,
  attributeDefinitions,
  warehouses,
  canDelete,
}: ProductManagerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery.search);
  const [categoryFilter, setCategoryFilter] = useState(initialQuery.categoryId);
  const [statusFilter, setStatusFilter] = useState(initialQuery.status || "all");
  const [brandFilter, setBrandFilter] = useState(initialQuery.brandId);
  const [supplierFilter, setSupplierFilter] = useState(initialQuery.supplierId);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [drawerFullscreen, setDrawerFullscreen] = useState(false);
  const [quickCreateDrawerMode, setQuickCreateDrawerMode] = useState<QuickCreateDrawerMode | null>(null);
  const [variantEditorIndex, setVariantEditorIndex] = useState<number | null>(null);
  const [attributeDefinitionEditor, setAttributeDefinitionEditor] = useState<AttributeDefinitionEditorState | null>(null);
  const [variantGenerationValues, setVariantGenerationValues] = useState<VariantGenerationState>({});
  const [variantGenerationOpen, setVariantGenerationOpen] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [brandOptions, setBrandOptions] = useState<Brand[]>(brands);
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>(suppliers);
  const [attributeDefinitionOptions, setAttributeDefinitionOptions] = useState<AttributeDefinition[]>(attributeDefinitions);
  const [brandCreateForm, setBrandCreateForm] = useState({ slug: "", name: "" });
  const [supplierCreateForm, setSupplierCreateForm] = useState({ slug: "", name: "", taxNumber: "", email: "", phone: "" });
  const [attributeDefinitionCreateForm, setAttributeDefinitionCreateForm] = useState({ slug: "", name: "", displayType: "TEXT" as AttributeDefinition["displayType"] });
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const emptyForm = useMemo<ProductForm>(
    () => ({
      slug: "",
      sku: "",
      barcode: "",
      name: "",
      description: "",
      productType: "PHYSICAL",
      status: "ACTIVE",
      unitType: "PIECE",
      price: "",
      purchasePrice: "",
      compareAtPrice: "",
      stock: "0",
      vatRate: "20",
      stockTrackingEnabled: true,
      salesEnabled: true,
      purchaseEnabled: true,
      internalNote: "",
      searchKeywords: "",
      brandId: "",
      primarySupplierId: "",
      preferredSalesWarehouseId: "",
      preferredPurchaseWarehouseId: "",
      imageUrl: "",
      imageUrls: [],
      categoryId: "",
      features: [],
      attributeLinks: [],
      variants: [],
    }),
    [],
  );

  const [createForm, setCreateForm] = useState<ProductForm>(emptyForm);
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm);

  const activeForm = drawerMode === "edit" ? editForm : createForm;
  const activeTitle = drawerMode === "edit" ? labels.edit : labels.createTitle;
  const activeSubmit = drawerMode === "edit" ? labels.save : labels.create;
  const isStockManaged = activeForm.stockTrackingEnabled && activeForm.productType !== "SERVICE";
  const activeVariantEditor = variantEditorIndex !== null ? activeForm.variants[variantEditorIndex] ?? null : null;
  const selectedVariantAxisDefinitions = useMemo(
    () => activeForm.attributeLinks
      .map((link) => attributeDefinitionOptions.find((item) => item.id === link.attributeDefinitionId))
      .filter((item): item is AttributeDefinition => Boolean(item)),
    [activeForm.attributeLinks, attributeDefinitionOptions],
  );
  const variantGenerationSuggestions = useMemo(
    () =>
      selectedVariantAxisDefinitions.reduce<Record<string, string[]>>((acc, definition) => {
        acc[definition.id] = Array.from(
          new Set(
            activeForm.variants
              .map((variant) => variant.attributes.find((attribute) => attribute.attributeDefinitionId === definition.id)?.value.trim() ?? "")
              .filter(Boolean),
          ),
        );
        return acc;
      }, {}),
    [activeForm.variants, selectedVariantAxisDefinitions],
  );
  const currentEditingProduct = useMemo(
    () => (editingId ? initialResult.items.find((item) => item.id === editingId) ?? null : null),
    [editingId, initialResult.items],
  );
  const currentDecisionAlerts = useMemo(() => {
    if (!currentEditingProduct) {
      return [];
    }

    const alerts: Array<{ tone: "rose" | "amber" | "emerald"; text: string; href: string; cta: string }> = [];
    const margin = currentEditingProduct.grossMarginRate ?? null;
    const daysSinceLastOrder = currentEditingProduct.lastOrderedAt ? differenceInDays(currentEditingProduct.lastOrderedAt) : null;
    const inventoryHref = `/${locale}/admin/inventory/products?search=${encodeURIComponent(currentEditingProduct.sku)}`;
    const transactionHref = `/${locale}/admin/inventory/transactions?transactionSku=${encodeURIComponent(currentEditingProduct.sku)}`;

    if (margin != null && margin < 15) {
      alerts.push({ tone: "rose", text: labels.alertLowMargin, href: transactionHref, cta: labels.reviewTransactions });
    }

    if (currentEditingProduct.stock > 0 && (currentEditingProduct.soldQuantity === 0 || (daysSinceLastOrder != null && daysSinceLastOrder > 45))) {
      alerts.push({ tone: "amber", text: labels.alertSlowSales, href: transactionHref, cta: labels.reviewTransactions });
    }

    if (currentEditingProduct.stockValue > 0 && currentEditingProduct.stock > 0 && currentEditingProduct.inStock && currentEditingProduct.orderCount <= 1) {
      alerts.push({ tone: "amber", text: labels.alertStockRisk, href: inventoryHref, cta: labels.reviewInventory });
    }

    if (alerts.length === 0) {
      alerts.push({ tone: "emerald", text: labels.alertHealthy, href: inventoryHref, cta: labels.reviewInventory });
    }

    return alerts;
  }, [
    currentEditingProduct,
    labels.alertHealthy,
    labels.alertLowMargin,
    labels.alertSlowSales,
    labels.alertStockRisk,
    labels.reviewInventory,
    labels.reviewTransactions,
    locale,
  ]);

  function pushQuery(next: {
    search: string;
    categoryId: string;
    status: string;
    brandId: string;
    supplierId: string;
    page: number;
  }) {
    const params = new URLSearchParams();

    if (next.search.trim()) {
      params.set("search", next.search.trim());
    }

    if (next.categoryId.trim()) {
      params.set("categoryId", next.categoryId.trim());
    }

    if (next.status.trim() && next.status !== "all") {
      params.set("status", next.status.trim());
    }

    if (next.brandId.trim()) {
      params.set("brandId", next.brandId.trim());
    }

    if (next.supplierId.trim()) {
      params.set("supplierId", next.supplierId.trim());
    }

    if (next.page > 1) {
      params.set("page", String(next.page));
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function validateForm(form: ProductForm) {
    const requiresStock = form.stockTrackingEnabled && form.productType !== "SERVICE";
    const activeVariantAxisIds = form.attributeLinks
      .filter((link) => link.attributeDefinitionId && link.isVariantAxis)
      .map((link) => link.attributeDefinitionId);

    if (!form.slug.trim() || !form.sku.trim() || !form.name.trim() || !form.description.trim() || !form.price.trim() || (requiresStock && !form.stock.trim()) || !form.vatRate.trim() || !form.imageUrl.trim()) {
      return labels.validationRequired;
    }

    const numericPrice = Number(form.price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return labels.validationPrice;
    }

    const numericStock = Number(form.stock || "0");
    if (requiresStock && (!Number.isInteger(numericStock) || numericStock < 0)) {
      return labels.validationStock;
    }

    const numericVatRate = Number(form.vatRate);
    if (!Number.isInteger(numericVatRate) || numericVatRate < 0 || numericVatRate > 100) {
      return labels.validationRequired;
    }

    if (form.compareAtPrice.trim()) {
      const numericCompareAtPrice = Number(form.compareAtPrice);
      if (Number.isNaN(numericCompareAtPrice) || numericCompareAtPrice <= numericPrice) {
        return labels.validationCompareAtPrice;
      }
    }

    if (!isValidHttpUrl(form.imageUrl)) {
      return labels.validationImageUrl;
    }

    if ((form.imageUrls ?? []).some((item) => !isValidHttpUrl(item))) {
      return labels.validationImageUrls;
    }

    if (getGalleryImages(form).length > MAX_PRODUCT_IMAGES) {
      return labels.validationImageUrlsLimit;
    }

    for (const variant of form.variants) {
      if (isVariantRowEmpty(variant)) {
        continue;
      }

      if (!variant.slug.trim() || !variant.sku.trim() || !variant.title.trim() || !variant.optionSummary.trim()) {
        return labels.validationVariantRequired;
      }

      if (variant.imageUrl.trim() && !isValidHttpUrl(variant.imageUrl)) {
        return labels.validationVariantImageUrl;
      }

      const filledAttributeCount = variant.attributes.filter(
        (attribute) => activeVariantAxisIds.includes(attribute.attributeDefinitionId) && attribute.value.trim(),
      ).length;

      if (filledAttributeCount !== activeVariantAxisIds.length) {
        return labels.validationVariantAttributes;
      }
    }

    return null;
  }

  function patchActiveForm(updater: (current: ProductForm) => ProductForm) {
    if (drawerMode === "edit") {
      setEditForm((prev) => updater(prev));
      return;
    }

    setCreateForm((prev) => updater(prev));
  }

  function patchActiveField(field: keyof ProductForm, value: string) {
    patchActiveForm((prev) => {
      if (field !== "name" && field !== "slug" && field !== "sku") {
        return { ...prev, [field]: value };
      }

      const nextName = field === "name" ? value : prev.name;
      const nextSlugBase = field === "slug" ? value : prev.slug;
      const nextSkuBase = field === "sku" ? value : prev.sku;

      return {
        ...prev,
        [field]: value,
        variants: prev.variants.map((variant) => {
          const previousTitle = buildVariantTitle(prev.name, variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
          const nextTitle = buildVariantTitle(nextName, variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
          const previousSlug = buildVariantSlug(prev.slug, variant.attributes, prev.attributeLinks);
          const nextSlug = buildVariantSlug(nextSlugBase, variant.attributes, prev.attributeLinks);
          const previousSku = buildVariantSku(prev.sku, variant.attributes, prev.attributeLinks);
          const nextSku = buildVariantSku(nextSkuBase, variant.attributes, prev.attributeLinks);

          return {
            ...variant,
            title: !variant.title.trim() || variant.title.trim() === previousTitle ? nextTitle : variant.title,
            slug: !variant.slug.trim() || variant.slug.trim() === previousSlug ? nextSlug : variant.slug,
            sku: !variant.sku.trim() || variant.sku.trim() === previousSku ? nextSku : variant.sku,
          };
        }),
      };
    });
  }

  function openCreateDrawer() {
    setError(null);
    setImportSummary(null);
    setEditingId(null);
    setCreateForm(emptyForm);
    setImageFiles([]);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
    setDrawerFullscreen(false);
    setQuickCreateDrawerMode(null);
    setDrawerMode("create");
  }

  function openEditDrawer(product: Product) {
    setError(null);
    setImportSummary(null);
    setEditingId(product.id);
    setEditForm({
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode ?? "",
      name: product.name,
      description: product.description,
      productType: product.productType,
      status: product.status,
      unitType: product.unitType,
      price: String(product.price),
      purchasePrice: product.purchasePrice ? String(product.purchasePrice) : "",
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      vatRate: String(product.vatRate),
      stockTrackingEnabled: product.stockTrackingEnabled,
      salesEnabled: product.salesEnabled,
      purchaseEnabled: product.purchaseEnabled,
      internalNote: product.internalNote ?? "",
      searchKeywords: product.searchKeywords.join(", "),
      brandId: product.brandId ?? "",
      primarySupplierId: product.primarySupplierId ?? "",
      preferredSalesWarehouseId: product.preferredSalesWarehouseId ?? "",
      preferredPurchaseWarehouseId: product.preferredPurchaseWarehouseId ?? "",
      imageUrl: product.imageUrl,
      imageUrls: (product.imageUrls ?? []).slice(0, MAX_PRODUCT_IMAGES - 1),
      categoryId: product.categoryId ?? "",
      features: product.features.length > 0 ? product.features.map((feature) => ({ ...feature })) : [],
      attributeLinks: product.attributeLinks?.map((link, index) => ({
        attributeDefinitionId: link.attributeDefinitionId,
        isVariantAxis: link.isVariantAxis,
        sortOrder: link.sortOrder ?? index,
      })) ?? [],
      variants: product.variants?.map((variant, index) => ({
        id: variant.id,
        slug: variant.slug,
        sku: variant.sku,
        barcode: variant.barcode ?? "",
        title: variant.title,
        optionSummary: variant.optionSummary,
        priceOverride: variant.priceOverride != null ? String(variant.priceOverride) : "",
        purchasePriceOverride: variant.purchasePriceOverride != null ? String(variant.purchasePriceOverride) : "",
        compareAtPriceOverride: variant.compareAtPriceOverride != null ? String(variant.compareAtPriceOverride) : "",
        imageUrl: variant.imageUrl ?? "",
        imageUrls: variant.imageUrls ?? [],
        stockOverride: variant.stockOverride != null ? String(variant.stockOverride) : "",
        salesEnabled: variant.salesEnabled ?? true,
        isDefault: variant.isDefault ?? false,
        sortOrder: String(variant.sortOrder ?? index),
        attributes: variant.attributes.map((attribute) => ({ ...attribute })),
      })) ?? [],
    });
    setImageFiles([]);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
    setDrawerFullscreen(false);
    setQuickCreateDrawerMode(null);
    setDrawerMode("edit");
  }

  function closeDrawer() {
    if (loading) {
      return;
    }

    setDrawerMode(null);
    setEditingId(null);
    setImageFiles([]);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
    setDrawerFullscreen(false);
    setQuickCreateDrawerMode(null);
    setError(null);
  }

  function openQuickCreateDrawer(mode: QuickCreateDrawerMode) {
    setError(null);
    setQuickCreateDrawerMode(mode);
  }

  function openVariantEditor(index: number) {
    setError(null);
    setVariantEditorIndex(index);
  }

  function closeVariantEditor() {
    if (loading) {
      return;
    }

    setVariantEditorIndex(null);
  }

  function openAttributeDefinitionEditor(definition: AttributeDefinition) {
    setError(null);
    setAttributeDefinitionEditor({
      id: definition.id,
      slug: definition.slug,
      name: definition.name,
      displayType: definition.displayType,
      sortOrder: String(definition.sortOrder),
    });
  }

  function openVariantGenerationModal() {
    if (selectedVariantAxisDefinitions.length === 0) {
      setError(labels.generateVariantsEmptyAxes);
      return;
    }

    setError(null);
    setVariantGenerationValues(
      selectedVariantAxisDefinitions.reduce<VariantGenerationState>((acc, definition) => {
        acc[definition.id] = "";
        return acc;
      }, {}),
    );
    setVariantGenerationOpen(true);
  }

  function closeVariantGenerationModal() {
    if (loading) {
      return;
    }

    setVariantGenerationOpen(false);
  }

  function applyVariantGenerationSuggestion(definitionId: string, suggestion: string) {
    setVariantGenerationValues((prev) => {
      const currentValues = parseGenerationValues(prev[definitionId] ?? "");
      if (currentValues.includes(suggestion)) {
        return prev;
      }

      return {
        ...prev,
        [definitionId]: [...currentValues, suggestion].join(", "),
      };
    });
  }

  function applyAllVariantGenerationSuggestions() {
    setVariantGenerationValues((prev) =>
      selectedVariantAxisDefinitions.reduce<VariantGenerationState>((acc, definition) => {
        const currentValues = parseGenerationValues(prev[definition.id] ?? "");
        const suggestions = variantGenerationSuggestions[definition.id] ?? [];
        const merged = Array.from(new Set([...currentValues, ...suggestions]));
        acc[definition.id] = merged.join(", ");
        return acc;
      }, { ...prev }),
    );
  }

  function closeAttributeDefinitionEditor() {
    if (loading) {
      return;
    }

    setAttributeDefinitionEditor(null);
  }

  function closeQuickCreateDrawer() {
    if (loading) {
      return;
    }

    setQuickCreateDrawerMode(null);
  }

  function handleImageFileChange(files: FileList | null) {
    setImageFiles(files ? Array.from(files) : []);
  }

  function setMainImage(url: string) {
    patchActiveForm((prev) => {
      const merged = Array.from(new Set([url.trim(), prev.imageUrl.trim(), ...(prev.imageUrls ?? [])].map((value) => value.trim()).filter(Boolean))).slice(0, MAX_PRODUCT_IMAGES);
      const nextMain = merged.find((value) => value === url.trim()) ?? merged[0] ?? "";

      return {
        ...prev,
        imageUrl: nextMain,
        imageUrls: merged.filter((value) => value !== nextMain),
      };
    });
  }

  function removeImage(url: string) {
    patchActiveForm((prev) => {
      const remaining = getGalleryImages(prev).filter((value) => value !== url);
      const nextMain = remaining[0] ?? "";

      return {
        ...prev,
        imageUrl: nextMain,
        imageUrls: remaining.slice(1),
      };
    });
  }

  async function uploadImage() {
    if (imageFiles.length === 0) {
      return;
    }

    setImageUploading(true);
    setError(null);

    try {
      const galleryCount = getGalleryImages(activeForm).length;
      const availableSlots = MAX_PRODUCT_IMAGES - galleryCount;

      if (availableSlots <= 0) {
        setError(labels.validationImageUrlsLimit);
        return;
      }

      const filesToUpload = imageFiles.slice(0, availableSlots);
      const uploadedUrls: string[] = [];

      for (const imageFile of filesToUpload) {
        const formData = new FormData();
        formData.append("file", imageFile);

        if (activeForm.slug.trim()) {
          formData.append("slug", activeForm.slug.trim());
        }

        const response = await fetch("/api/admin/uploads/product-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null;
          setError(payload?.message ?? labels.imageUploadFailed);
          return;
        }

        const payload = (await response.json()) as { item?: { url?: string } };
        const uploadedUrl = payload.item?.url;

        if (!uploadedUrl) {
          setError(labels.imageUploadFailed);
          return;
        }

        uploadedUrls.push(uploadedUrl);
      }

      if (uploadedUrls.length === 0) {
        setError(labels.imageUploadFailed);
        return;
      }

      patchActiveForm((prev) => {
        const uniqueUploaded = Array.from(new Set(uploadedUrls));
        const mergedGallery = Array.from(new Set([
          ...getGalleryImages(prev),
          ...uniqueUploaded,
        ]))
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, MAX_PRODUCT_IMAGES);

        const primaryImage = prev.imageUrl.trim() && mergedGallery.includes(prev.imageUrl.trim())
          ? prev.imageUrl.trim()
          : (mergedGallery[0] ?? "");

        return {
          ...prev,
          imageUrl: primaryImage,
          imageUrls: mergedGallery.filter((value) => value !== primaryImage),
        };
      });

      setImageFiles([]);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = "";
      }
    } catch {
      setError(labels.imageUploadFailed);
    } finally {
      setImageUploading(false);
    }
  }

  function patchFeature(index: number, patch: Partial<ProductFeature>) {
    if (drawerMode === "edit") {
      setEditForm((prev) => ({
        ...prev,
        features: prev.features.map((feature, featureIndex) => (
          featureIndex === index ? { ...feature, ...patch } : feature
        )),
      }));
      return;
    }

    setCreateForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, featureIndex) => (
        featureIndex === index ? { ...feature, ...patch } : feature
      )),
    }));
  }

  function addFeatureRow() {
    if (drawerMode === "edit") {
      setEditForm((prev) => ({ ...prev, features: [...prev.features, createEmptyFeature()] }));
      return;
    }

    setCreateForm((prev) => ({ ...prev, features: [...prev.features, createEmptyFeature()] }));
  }

  function removeFeatureRow(index: number) {
    if (drawerMode === "edit") {
      setEditForm((prev) => ({
        ...prev,
        features: prev.features.filter((_, featureIndex) => featureIndex !== index),
      }));
      return;
    }

    setCreateForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, featureIndex) => featureIndex !== index),
    }));
  }

  async function createBrandOption() {
    if (!brandCreateForm.slug.trim() || !brandCreateForm.name.trim()) {
      setError(labels.validationRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brandCreateForm),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      const payload = (await response.json()) as { item: Brand };
      setBrandOptions((prev) => [...prev, payload.item].sort((left, right) => left.name.localeCompare(right.name, "tr")));
      patchActiveField("brandId", payload.item.id);
      setBrandCreateForm({ slug: "", name: "" });
      setQuickCreateDrawerMode(null);
    } catch {
      setError(labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function createSupplierOption() {
    if (!supplierCreateForm.slug.trim() || !supplierCreateForm.name.trim()) {
      setError(labels.validationRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierCreateForm),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      const payload = (await response.json()) as { item: Supplier };
      setSupplierOptions((prev) => [...prev, payload.item].sort((left, right) => left.name.localeCompare(right.name, "tr")));
      patchActiveField("primarySupplierId", payload.item.id);
      setSupplierCreateForm({ slug: "", name: "", taxNumber: "", email: "", phone: "" });
      setQuickCreateDrawerMode(null);
    } catch {
      setError(labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function createAttributeDefinitionOption() {
    if (!attributeDefinitionCreateForm.slug.trim() || !attributeDefinitionCreateForm.name.trim()) {
      setError(labels.validationRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/product-attributes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attributeDefinitionCreateForm),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      const payload = (await response.json()) as { item: AttributeDefinition };
      setAttributeDefinitionOptions((prev) => [...prev, payload.item].sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "tr")));
      setAttributeDefinitionCreateForm({ slug: "", name: "", displayType: "TEXT" });
    } catch {
      setError(labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function saveAttributeDefinitionEditor() {
    if (!attributeDefinitionEditor || !attributeDefinitionEditor.slug.trim() || !attributeDefinitionEditor.name.trim()) {
      setError(labels.validationRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/product-attributes/${attributeDefinitionEditor.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: attributeDefinitionEditor.slug.trim(),
          name: attributeDefinitionEditor.name.trim(),
          displayType: attributeDefinitionEditor.displayType,
          sortOrder: Number(attributeDefinitionEditor.sortOrder || "0"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      const payload = (await response.json()) as { item: AttributeDefinition };
      setAttributeDefinitionOptions((prev) =>
        prev
          .map((item) => (item.id === payload.item.id ? payload.item : item))
          .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "tr")),
      );
      setAttributeDefinitionEditor(null);
    } catch {
      setError(labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAttributeDefinition(definition: AttributeDefinition) {
    if (!window.confirm(labels.variantAxisDeleteConfirm)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/product-attributes/${definition.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.variantAxisDeleteBlocked);
        return;
      }

      setAttributeDefinitionOptions((prev) => prev.filter((item) => item.id !== definition.id));
      patchActiveForm((prev) => ({
        ...prev,
        attributeLinks: prev.attributeLinks.filter((item) => item.attributeDefinitionId !== definition.id),
        variants: prev.variants.map((variant) => {
          const nextAttributes = variant.attributes.filter((attribute) => attribute.attributeDefinitionId !== definition.id);
          const nextLinks = prev.attributeLinks.filter((item) => item.attributeDefinitionId !== definition.id);
          const previousSummary = buildVariantOptionSummary(variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
          const nextSummary = buildVariantOptionSummary(nextAttributes, nextLinks, attributeDefinitionOptions);
          const previousTitle = buildVariantTitle(prev.name, variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
          const nextTitle = buildVariantTitle(prev.name, nextAttributes, nextLinks, attributeDefinitionOptions);
          const previousSlug = buildVariantSlug(prev.slug, variant.attributes, prev.attributeLinks);
          const nextSlug = buildVariantSlug(prev.slug, nextAttributes, nextLinks);
          const previousSku = buildVariantSku(prev.sku, variant.attributes, prev.attributeLinks);
          const nextSku = buildVariantSku(prev.sku, nextAttributes, nextLinks);

          return {
            ...variant,
            attributes: nextAttributes,
            title: !variant.title.trim() || variant.title.trim() === previousTitle ? nextTitle : variant.title,
            slug: !variant.slug.trim() || variant.slug.trim() === previousSlug ? nextSlug : variant.slug,
            sku: !variant.sku.trim() || variant.sku.trim() === previousSku ? nextSku : variant.sku,
            optionSummary: !variant.optionSummary.trim() || variant.optionSummary.trim() === previousSummary ? nextSummary : variant.optionSummary,
          };
        }),
      }));
      setAttributeDefinitionEditor(null);
    } catch {
      setError(labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  function toggleAttributeAxis(attributeDefinitionId: string) {
    patchActiveForm((prev) => {
      const existing = prev.attributeLinks.find((item) => item.attributeDefinitionId === attributeDefinitionId);
      if (existing) {
        return {
          ...prev,
          attributeLinks: prev.attributeLinks.filter((item) => item.attributeDefinitionId !== attributeDefinitionId),
          variants: prev.variants.map((variant) => {
            const nextAttributes = variant.attributes.filter((attribute) => attribute.attributeDefinitionId !== attributeDefinitionId);
            const previousSummary = buildVariantOptionSummary(variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
            const nextLinks = prev.attributeLinks.filter((item) => item.attributeDefinitionId !== attributeDefinitionId);
            const nextSummary = buildVariantOptionSummary(nextAttributes, nextLinks, attributeDefinitionOptions);
            const previousTitle = buildVariantTitle(prev.name, variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
            const nextTitle = buildVariantTitle(prev.name, nextAttributes, nextLinks, attributeDefinitionOptions);
            const previousSlug = buildVariantSlug(prev.slug, variant.attributes, prev.attributeLinks);
            const nextSlug = buildVariantSlug(prev.slug, nextAttributes, nextLinks);
            const previousSku = buildVariantSku(prev.sku, variant.attributes, prev.attributeLinks);
            const nextSku = buildVariantSku(prev.sku, nextAttributes, nextLinks);

            return {
              ...variant,
              attributes: nextAttributes,
              title: !variant.title.trim() || variant.title.trim() === previousTitle ? nextTitle : variant.title,
              slug: !variant.slug.trim() || variant.slug.trim() === previousSlug ? nextSlug : variant.slug,
              sku: !variant.sku.trim() || variant.sku.trim() === previousSku ? nextSku : variant.sku,
              optionSummary: !variant.optionSummary.trim() || variant.optionSummary.trim() === previousSummary ? nextSummary : variant.optionSummary,
            };
          }),
        };
      }

      return {
        ...prev,
        attributeLinks: [...prev.attributeLinks, { attributeDefinitionId, isVariantAxis: true, sortOrder: prev.attributeLinks.length }],
      };
    });
  }

  function patchVariant(index: number, patch: Partial<ProductVariant>) {
    patchActiveForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) => (variantIndex === index ? { ...variant, ...patch } : variant)),
    }));
  }

  function addVariantRow() {
    patchActiveForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  }

  function generateVariantRows() {
    const axisValueGroups = selectedVariantAxisDefinitions.map((definition) => ({
      definition,
      values: parseGenerationValues(variantGenerationValues[definition.id] ?? ""),
    }));

    if (axisValueGroups.some((group) => group.values.length === 0)) {
      setError(labels.validationVariantAttributes);
      return;
    }

    const combinations = axisValueGroups.reduce<Array<Array<{ attributeDefinitionId: string; value: string }>>>(
      (acc, group) => acc.flatMap((current) => group.values.map((value) => [...current, { attributeDefinitionId: group.definition.id, value }])),
      [[]],
    );

    patchActiveForm((prev) => {
      const existingKeys = new Set(
        prev.variants.map((variant) =>
          buildVariantOptionSummary(variant.attributes, prev.attributeLinks, attributeDefinitionOptions),
        ),
      );

      const nextVariants = [...prev.variants];

      for (const attributes of combinations) {
        const optionSummary = buildVariantOptionSummary(attributes, prev.attributeLinks, attributeDefinitionOptions);
        if (!optionSummary || existingKeys.has(optionSummary)) {
          continue;
        }

        const title = buildVariantTitle(prev.name, attributes, prev.attributeLinks, attributeDefinitionOptions);
        const slug = buildVariantSlug(prev.slug, attributes, prev.attributeLinks);
        const sku = buildVariantSku(prev.sku, attributes, prev.attributeLinks);

        nextVariants.push({
          ...createEmptyVariant(),
          title,
          slug,
          sku,
          optionSummary,
          sortOrder: String(nextVariants.length),
          attributes,
        });
        existingKeys.add(optionSummary);
      }

      return {
        ...prev,
        variants: nextVariants,
      };
    });

    setVariantGenerationOpen(false);
  }

  function removeVariantRow(index: number) {
    if (variantEditorIndex !== null) {
      if (variantEditorIndex === index) {
        setVariantEditorIndex(null);
      } else if (variantEditorIndex > index) {
        setVariantEditorIndex(variantEditorIndex - 1);
      }
    }

    patchActiveForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  function patchVariantAttribute(index: number, attributeDefinitionId: string, value: string) {
    patchActiveForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) => {
        if (variantIndex !== index) {
          return variant;
        }

        const existing = variant.attributes.find((attribute) => attribute.attributeDefinitionId === attributeDefinitionId);
        let nextAttributes: ProductVariantValue[];
        if (existing) {
          nextAttributes = variant.attributes.map((attribute) => (
            attribute.attributeDefinitionId === attributeDefinitionId
              ? { ...attribute, value }
              : attribute
          ));

        } else {
          nextAttributes = [...variant.attributes, { attributeDefinitionId, value }];
        }

        const previousSummary = buildVariantOptionSummary(variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
        const nextSummary = buildVariantOptionSummary(nextAttributes, prev.attributeLinks, attributeDefinitionOptions);
        const previousTitle = buildVariantTitle(prev.name, variant.attributes, prev.attributeLinks, attributeDefinitionOptions);
        const nextTitle = buildVariantTitle(prev.name, nextAttributes, prev.attributeLinks, attributeDefinitionOptions);
        const previousSlug = buildVariantSlug(prev.slug, variant.attributes, prev.attributeLinks);
        const nextSlug = buildVariantSlug(prev.slug, nextAttributes, prev.attributeLinks);
        const previousSku = buildVariantSku(prev.sku, variant.attributes, prev.attributeLinks);
        const nextSku = buildVariantSku(prev.sku, nextAttributes, prev.attributeLinks);

        return {
          ...variant,
          attributes: nextAttributes,
          title: !variant.title.trim() || variant.title.trim() === previousTitle ? nextTitle : variant.title,
          slug: !variant.slug.trim() || variant.slug.trim() === previousSlug ? nextSlug : variant.slug,
          sku: !variant.sku.trim() || variant.sku.trim() === previousSku ? nextSku : variant.sku,
          optionSummary: !variant.optionSummary.trim() || variant.optionSummary.trim() === previousSummary ? nextSummary : variant.optionSummary,
        };
      }),
    }));
  }

  async function exportProducts() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (categoryFilter.trim()) {
        params.set("categoryId", categoryFilter.trim());
      }
      if (statusFilter.trim() && statusFilter !== "all") {
        params.set("status", statusFilter.trim());
      }
      if (brandFilter.trim()) {
        params.set("brandId", brandFilter.trim());
      }
      if (supplierFilter.trim()) {
        params.set("supplierId", supplierFilter.trim());
      }

      const response = await fetch(`/api/admin/products/export?${params.toString()}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.exportFailed);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "products-export.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setError(labels.exportFailed);
    } finally {
      setLoading(false);
    }
  }

  async function importProductsCsv(file: File | null) {
    if (!file) {
      return;
    }

    setImportingCsv(true);
    setError(null);
    setImportSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        createdCount?: number;
        failedCount?: number;
        errors?: Array<{ rowNumber: number; message: string }>;
      } | null;

      if (!response.ok) {
        setError(payload?.message ?? labels.importFailed);
        return;
      }

      const firstError = payload?.errors?.[0];
      setImportSummary(firstError
        ? `${labels.importSuccess} ${payload?.createdCount ?? 0} | ${labels.importFailed} ${payload?.failedCount ?? 0} | Satır ${firstError.rowNumber}: ${firstError.message}`
        : `${labels.importSuccess} ${payload?.createdCount ?? 0}`);
      router.refresh();
    } catch {
      setError(labels.importFailed);
    } finally {
      setImportingCsv(false);
      if (importFileInputRef.current) {
        importFileInputRef.current.value = "";
      }
    }
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = drawerMode === "edit" ? editForm : createForm;
    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(drawerMode === "edit" && editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: drawerMode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toPayload(form)),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      setCreateForm(emptyForm);
      setDrawerMode(null);
      setEditingId(null);
      router.refresh();
    } catch {
      setError(labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(productId: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      router.refresh();
    } catch {
      setError(labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushQuery({
      search: searchQuery,
      categoryId: categoryFilter,
      status: statusFilter,
      brandId: brandFilter,
      supplierId: supplierFilter,
      page: 1,
    });
  }

  function goToPage(nextPage: number) {
    pushQuery({
      search: searchQuery,
      categoryId: categoryFilter,
      status: statusFilter,
      brandId: brandFilter,
      supplierId: supplierFilter,
      page: nextPage,
    });
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{labels.listTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">{initialResult.total} ürün listeleniyor</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={importFileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => importProductsCsv(event.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="secondary" disabled={importingCsv} onClick={() => importFileInputRef.current?.click()}>
            {labels.importCsv}
          </Button>
          <Button type="button" variant="secondary" disabled={loading} onClick={exportProducts}>
            {labels.exportCsv}
          </Button>
          <Button type="button" onClick={openCreateDrawer}>
            {labels.createTitle}
          </Button>
        </div>
      </div>

      <div className="p-5">
        {error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
        {importSummary ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{importSummary}</p> : null}
        <p className="mb-4 text-sm text-neutral-500">{labels.importHint}</p>
        <form className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_220px_220px_220px_220px_auto]" onSubmit={applyFilters}>
          <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={labels.search} />
          <Select value={categoryFilter || NONE_VALUE} onValueChange={(value) => setCategoryFilter(value === NONE_VALUE ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder={labels.allCategories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>{labels.allCategories}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder={labels.allStatuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allStatuses}</SelectItem>
              <SelectItem value="DRAFT">{labels.statusDraft}</SelectItem>
              <SelectItem value="ACTIVE">{labels.statusActive}</SelectItem>
              <SelectItem value="ARCHIVED">{labels.statusArchived}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={brandFilter || NONE_VALUE} onValueChange={(value) => setBrandFilter(value === NONE_VALUE ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder={labels.allBrands} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>{labels.allBrands}</SelectItem>
              {brandOptions.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supplierFilter || NONE_VALUE} onValueChange={(value) => setSupplierFilter(value === NONE_VALUE ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder={labels.allSuppliers} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>{labels.allSuppliers}</SelectItem>
              {supplierOptions.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" variant="secondary">
            {labels.search}
          </Button>
        </form>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <div className="hidden grid-cols-[80px_1.15fr_1fr_1fr_160px_180px_140px_190px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
            <span>Görsel</span>
            <span>{labels.name}</span>
            <span>{labels.brand}</span>
            <span>{labels.category}</span>
            <span>{labels.price}</span>
            <span>{labels.statusLabel}</span>
            <span>{labels.stockStatus}</span>
            <span className="text-right">İşlem</span>
          </div>

          {initialResult.items.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">{labels.empty}</p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {initialResult.items.map((product) => (
                <article key={product.id} className="grid gap-4 p-4 lg:grid-cols-[80px_1.15fr_1fr_1fr_160px_180px_140px_190px] lg:items-center">
                  <div className="h-20 w-20 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-950">{product.name}</h3>
                    <p className="mt-1 text-sm text-neutral-500">{product.slug} • {product.sku}</p>
                    <p className="mt-1 text-xs text-neutral-500">{labels.barcode}: {product.barcode ?? labels.notSpecified}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500 lg:hidden">{product.description}</p>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <p>{product.brandName ?? labels.notSpecified}</p>
                    <p className="mt-1 text-xs text-neutral-500">{product.primarySupplierName ?? labels.notSpecified}</p>
                  </div>
                  <p className="text-sm text-neutral-600">{product.categoryName ?? labels.notSpecified}</p>
                  <div className="text-sm">
                    <p className="font-semibold text-neutral-950">{formatPrice(product.price, product.currency, locale)}</p>
                    {product.compareAtPrice ? (
                      <p className="text-xs text-neutral-500 line-through">{formatPrice(product.compareAtPrice, product.currency, locale)}</p>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    {product.status === "DRAFT" ? labels.statusDraft : product.status === "ARCHIVED" ? labels.statusArchived : labels.statusActive}
                  </p>
                  <div className="text-sm">
                    <p className={`font-medium ${product.inStock ? "text-emerald-700" : "text-red-600"}`}>
                      {product.inStock ? labels.inStock : labels.outOfStock} ({product.stock})
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {labels.orderCount}: {product.orderCount} • {labels.soldQuantity}: {product.soldQuantity}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {labels.grossRevenue}: {formatPrice(product.grossRevenue, product.currency, locale)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {labels.averageUnitCost}: {product.averageUnitCost != null ? formatPrice(product.averageUnitCost, product.currency, locale) : labels.notSpecified}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {labels.stockValue}: {formatPrice(product.stockValue, product.currency, locale)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {labels.grossProfit}: {formatPrice(product.grossProfit, product.currency, locale)}
                      {product.grossMarginRate != null ? ` • ${labels.grossMarginRate}: %${product.grossMarginRate}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {labels.lastOrderedAt}: {product.lastOrderedAt ? formatDate(product.lastOrderedAt, locale) : labels.notSpecified}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button type="button" size="sm" variant="secondary" disabled={loading} onClick={() => openEditDrawer(product)}>
                      {labels.edit}
                    </Button>
                    {canDelete ? (
                      <Button type="button" size="sm" variant="destructive" disabled={loading} onClick={() => deleteProduct(product.id)}>
                        {labels.delete}
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" disabled={initialResult.page <= 1} onClick={() => goToPage(Math.max(1, initialResult.page - 1))}>
            {labels.prev}
          </Button>
          <span className="text-sm text-neutral-500">
            {labels.page} {initialResult.page}/{initialResult.totalPages}
          </span>
          <Button type="button" variant="secondary" disabled={initialResult.page >= initialResult.totalPages} onClick={() => goToPage(Math.min(initialResult.totalPages, initialResult.page + 1))}>
            {labels.next}
          </Button>
        </div>
      </div>

      {drawerMode ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <aside className={`absolute right-0 top-0 flex h-full w-full flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl ${drawerFullscreen ? "max-w-none" : "max-w-xl"}`}>
            <div className="flex items-start justify-between border-b border-neutral-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{activeTitle}</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setDrawerFullscreen((prev) => !prev)}
                  disabled={loading}
                  aria-label={drawerFullscreen ? "Daralt" : "Tam ekran"}
                  title={drawerFullscreen ? "Daralt" : "Tam ekran"}
                >
                  {drawerFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={closeDrawer} disabled={loading}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <form className="grid gap-5 p-5" onSubmit={submitProduct}>
              <section className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Ürün Kartı</p>
                  <h4 className="mt-1 text-base font-semibold text-neutral-950">Temel ürün bilgileri</h4>
                  <p className="mt-1 text-sm text-neutral-500">Ürünün kimlik, tür ve vitrin bilgisini bu alandan yönetin.</p>
                </div>

                <div className="grid gap-2">
                  <Label>{labels.name}</Label>
                  <Input value={activeForm.name} onChange={(event) => patchActiveField("name", event.target.value)} required />
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>{labels.slug}</Label>
                    <Input value={activeForm.slug} onChange={(event) => patchActiveField("slug", event.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.sku}</Label>
                    <Input value={activeForm.sku} onChange={(event) => patchActiveField("sku", event.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.barcode}</Label>
                    <Input value={activeForm.barcode} onChange={(event) => patchActiveField("barcode", event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>{labels.productType}</Label>
                    <Select value={activeForm.productType} onValueChange={(value) => patchActiveField("productType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.tr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.statusLabel}</Label>
                    <Select value={activeForm.status} onValueChange={(value) => patchActiveField("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {labels[option.labelKey]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.unitType}</Label>
                    <Select value={activeForm.unitType} onValueChange={(value) => patchActiveField("unitType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.tr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Label>{labels.category}</Label>
                  <div className="grid gap-2">
                    <Select value={activeForm.categoryId || NONE_VALUE} onValueChange={(value) => patchActiveField("categoryId", value === NONE_VALUE ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={labels.notSpecified} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>{labels.notSpecified}</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.brand}</Label>
                    <div className="flex items-center gap-2">
                      <Select value={activeForm.brandId || NONE_VALUE} onValueChange={(value) => patchActiveField("brandId", value === NONE_VALUE ? "" : value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={labels.notSpecified} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>{labels.notSpecified}</SelectItem>
                          {brandOptions.filter((brand) => brand.isActive).map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 shrink-0"
                        onClick={() => openQuickCreateDrawer("brand")}
                        aria-label={labels.createBrand}
                        title={labels.createBrand}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{labels.description}</Label>
                  <Textarea value={activeForm.description} onChange={(event) => patchActiveField("description", event.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>{labels.searchKeywords}</Label>
                  <Input value={activeForm.searchKeywords} onChange={(event) => patchActiveField("searchKeywords", event.target.value)} placeholder="anahtar1, anahtar2" />
                  <p className="text-xs text-neutral-500">{labels.searchKeywordsHint}</p>
                </div>
              </section>

              <section className="grid gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Stok Kartı</p>
                    <h4 className="mt-1 text-base font-semibold text-neutral-950">Stok ve satın alma ayarları</h4>
                    <p className="mt-1 text-sm text-neutral-600">Paraşüt benzeri stok takibi, depo tercihi ve maliyet alanlarını birlikte yönetin.</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-xs text-neutral-600 shadow-sm">
                    <p className="font-semibold text-neutral-900">Stok durumu</p>
                    <p className="mt-1">{isStockManaged ? "Takip aktif" : "Takip kapalı"}</p>
                  </div>
                </div>

                {drawerMode === "edit" && currentEditingProduct ? (
                  <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <article className="rounded-xl border border-emerald-200 bg-white/90 p-3 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{labels.grossProfit}</p>
                        <p className="mt-2 text-lg font-semibold text-neutral-950">
                          {formatPrice(currentEditingProduct.grossProfit, currentEditingProduct.currency, locale)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {currentEditingProduct.grossMarginRate != null ? `${labels.grossMarginRate}: %${currentEditingProduct.grossMarginRate}` : labels.notSpecified}
                        </p>
                      </article>
                      <article className="rounded-xl border border-cyan-200 bg-white/90 p-3 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">{labels.stockValue}</p>
                        <p className="mt-2 text-lg font-semibold text-neutral-950">
                          {formatPrice(currentEditingProduct.stockValue, currentEditingProduct.currency, locale)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {labels.averageUnitCost}: {currentEditingProduct.averageUnitCost != null ? formatPrice(currentEditingProduct.averageUnitCost, currentEditingProduct.currency, locale) : labels.notSpecified}
                        </p>
                      </article>
                      <article className="rounded-xl border border-amber-200 bg-white/90 p-3 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-amber-700">{labels.soldQuantity}</p>
                        <p className="mt-2 text-lg font-semibold text-neutral-950">{currentEditingProduct.soldQuantity}</p>
                        <p className="mt-1 text-xs text-neutral-500">{labels.orderCount}: {currentEditingProduct.orderCount}</p>
                      </article>
                      <article className="rounded-xl border border-neutral-200 bg-white/90 p-3 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.grossRevenue}</p>
                        <p className="mt-2 text-lg font-semibold text-neutral-950">
                          {formatPrice(currentEditingProduct.grossRevenue, currentEditingProduct.currency, locale)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {labels.lastOrderedAt}: {currentEditingProduct.lastOrderedAt ? formatDate(currentEditingProduct.lastOrderedAt, locale) : labels.notSpecified}
                        </p>
                      </article>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white/90 p-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{labels.decisionAlerts}</p>
                      <div className="mt-3 grid gap-2">
                        {currentDecisionAlerts.map((alert) => (
                          <div
                            key={alert.text}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              alert.tone === "rose"
                                ? "border-rose-200 bg-rose-50 text-rose-800"
                                : alert.tone === "amber"
                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <span>{alert.text}</span>
                              <Link
                                href={alert.href}
                                className="text-xs font-semibold underline decoration-current underline-offset-4"
                                onClick={closeDrawer}
                              >
                                {alert.cta}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <label className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/80 p-3 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={activeForm.productType === "SERVICE" ? false : activeForm.stockTrackingEnabled}
                    onChange={(event) => patchActiveForm((prev) => ({ ...prev, stockTrackingEnabled: event.target.checked }))}
                    disabled={activeForm.productType === "SERVICE"}
                  />
                  <span>{labels.stockTrackingEnabled}</span>
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 p-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={activeForm.salesEnabled}
                      onChange={(event) => patchActiveForm((prev) => ({ ...prev, salesEnabled: event.target.checked }))}
                    />
                    <span>{labels.salesEnabled}</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 p-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={activeForm.purchaseEnabled}
                      onChange={(event) => patchActiveForm((prev) => ({ ...prev, purchaseEnabled: event.target.checked }))}
                    />
                    <span>{labels.purchaseEnabled}</span>
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{labels.stock}</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.stock}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={activeForm.stock}
                        onChange={(event) => patchActiveField("stock", event.target.value)}
                        required={isStockManaged}
                        disabled={!isStockManaged}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{labels.purchasePrice}</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.purchasePrice}</Label>
                      <Input type="number" min="0" step="0.01" value={activeForm.purchasePrice} onChange={(event) => patchActiveField("purchasePrice", event.target.value)} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{labels.vatRate}</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.vatRate}</Label>
                      <Input type="number" min="0" max="100" step="1" value={activeForm.vatRate} onChange={(event) => patchActiveField("vatRate", event.target.value)} required />
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{labels.compareAtPrice}</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.compareAtPrice}</Label>
                      <Input type="number" min="0" step="0.01" value={activeForm.compareAtPrice} onChange={(event) => patchActiveField("compareAtPrice", event.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{labels.supplier}</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.supplier}</Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={activeForm.primarySupplierId || NONE_VALUE}
                          onValueChange={(value) => patchActiveField("primarySupplierId", value === NONE_VALUE ? "" : value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={labels.notSpecified} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>{labels.notSpecified}</SelectItem>
                            {supplierOptions.filter((supplier) => supplier.isActive).map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-10 w-10 shrink-0"
                          onClick={() => openQuickCreateDrawer("supplier")}
                          aria-label={labels.createSupplier}
                          title={labels.createSupplier}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Satın alma deposu</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.preferredPurchaseWarehouse}</Label>
                      <Select
                        value={activeForm.preferredPurchaseWarehouseId || NONE_VALUE}
                        onValueChange={(value) => patchActiveField("preferredPurchaseWarehouseId", value === NONE_VALUE ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={labels.notSpecified} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>{labels.notSpecified}</SelectItem>
                          {warehouses.filter((warehouse) => warehouse.isActive).map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Satış deposu</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.preferredSalesWarehouse}</Label>
                      <Select
                        value={activeForm.preferredSalesWarehouseId || NONE_VALUE}
                        onValueChange={(value) => patchActiveField("preferredSalesWarehouseId", value === NONE_VALUE ? "" : value)}
                        disabled={!isStockManaged}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={labels.notSpecified} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>{labels.notSpecified}</SelectItem>
                          {warehouses.filter((warehouse) => warehouse.isActive).map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{labels.internalNote}</p>
                    <div className="mt-2 grid gap-2">
                      <Label>{labels.internalNote}</Label>
                      <Textarea value={activeForm.internalNote} onChange={(event) => patchActiveField("internalNote", event.target.value)} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Variant Master Data</p>
                  <h4 className="mt-1 text-base font-semibold text-neutral-950">{labels.attributesTitle}</h4>
                  <p className="mt-1 text-sm text-neutral-500">{labels.variantAxesHint}</p>
                </div>

                <div className="grid gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>{labels.attributeName}</Label>
                      <Input value={attributeDefinitionCreateForm.name} onChange={(event) => setAttributeDefinitionCreateForm((prev) => ({ ...prev, name: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.slug}</Label>
                      <Input value={attributeDefinitionCreateForm.slug} onChange={(event) => setAttributeDefinitionCreateForm((prev) => ({ ...prev, slug: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.attributeDisplayType}</Label>
                      <Select value={attributeDefinitionCreateForm.displayType} onValueChange={(value) => setAttributeDefinitionCreateForm((prev) => ({ ...prev, displayType: value as AttributeDefinition["displayType"] }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">{labels.attributeDisplayText}</SelectItem>
                          <SelectItem value="COLOR">{labels.attributeDisplayColor}</SelectItem>
                          <SelectItem value="NUMBER">{labels.attributeDisplayNumber}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="button" variant="secondary" disabled={loading} onClick={createAttributeDefinitionOption}>
                    {labels.createAttributeDefinition}
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label>{labels.variantAxes}</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    {attributeDefinitionOptions.filter((item) => item.isActive).map((definition) => {
                      const active = activeForm.attributeLinks.some((item) => item.attributeDefinitionId === definition.id);
                      return (
                        <label key={definition.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${active ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-neutral-200 bg-neutral-50 text-neutral-700"}`}>
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleAttributeAxis(definition.id)}
                          />
                          <span>{definition.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>{labels.selectedVariantAxes}</Label>
                  {selectedVariantAxisDefinitions.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">{labels.variantAxesHint}</p>
                  ) : (
                    <div className="grid gap-2">
                      {selectedVariantAxisDefinitions.map((definition) => (
                        <div key={`axis-selected-${definition.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{definition.name}</p>
                            <p className="text-xs text-neutral-500">{definition.slug} • {labels.variantAxisUsageCount}: {definition.productCount}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => openAttributeDefinitionEditor(definition)}>
                              {labels.edit}
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => void deleteAttributeDefinition(definition)}>
                              {labels.delete}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label>{labels.variantsTitle}</Label>
                      <p className="text-xs text-neutral-500">{labels.variantsHint}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={openVariantGenerationModal}>
                        {labels.generateVariants}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={addVariantRow}>
                        {labels.addVariant}
                      </Button>
                    </div>
                  </div>

                  {activeForm.variants.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">{labels.variantEmptyState}</p>
                  ) : null}

                  {activeForm.variants.map((variant, index) => (
                    <div key={`variant-${index}`} className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-neutral-950">{variant.title || `${labels.variantTitle} ${index + 1}`}</p>
                          <p className="text-xs text-neutral-500">{variant.optionSummary || labels.variantsHint}</p>
                          <p className="text-xs text-neutral-500">{variant.slug || labels.slug} • {variant.sku || labels.sku}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {variant.isDefault ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-900">{labels.variantDefault}</span>
                          ) : null}
                          {!variant.salesEnabled ? (
                            <span className="rounded-full bg-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700">{labels.outOfStock}</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => openVariantEditor(index)}>
                          {labels.variantDetails}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => removeVariantRow(index)}>
                          {labels.delete}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-2">
                <Label>{labels.features}</Label>
                <div className="grid gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  {activeForm.features.length === 0 ? (
                    <p className="text-xs text-neutral-500">{labels.featuresHint}</p>
                  ) : null}

                  {activeForm.features.map((feature, index) => (
                    <div key={`feature-${index}`} className="grid gap-2 rounded-lg border border-neutral-200 bg-white p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                      <div className="grid gap-1">
                        <Label>{labels.featureKey}</Label>
                        <Input
                          value={feature.key}
                          onChange={(event) => patchFeature(index, { key: event.target.value })}
                          placeholder="Tip"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>{labels.featureValue}</Label>
                        <Input
                          value={feature.value}
                          onChange={(event) => patchFeature(index, { value: event.target.value })}
                          placeholder="Kule Tipi"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                          <input
                            type="checkbox"
                            checked={feature.highlighted}
                            onChange={(event) => patchFeature(index, { highlighted: event.target.checked })}
                          />
                          {labels.highlightFeature}
                        </label>
                        <Button type="button" size="sm" variant="outline" onClick={() => removeFeatureRow(index)}>
                          {labels.removeFeature}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div>
                    <Button type="button" size="sm" variant="secondary" onClick={addFeatureRow}>
                      {labels.addFeature}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-neutral-500">{labels.featuresHint}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{labels.price}</Label>
                  <Input type="number" min="0" step="0.01" value={activeForm.price} onChange={(event) => patchActiveField("price", event.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>{labels.imageUrl}</Label>
                  <Input value={activeForm.imageUrl} onChange={(event) => patchActiveField("imageUrl", event.target.value)} required />
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-xs text-neutral-500">{`Toplam görsel adedi: ${getGalleryImages(activeForm).length}/${MAX_PRODUCT_IMAGES}`}</p>
                <div className="grid gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="grid gap-1">
                    <Label>{labels.uploadImages}</Label>
                    <Input
                      ref={imageFileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                      onChange={(event) => handleImageFileChange(event.target.files)}
                    />
                    <p className="text-xs text-neutral-500">{labels.imageUploadHint}</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={imageFiles.length === 0 || imageUploading}
                    onClick={uploadImage}
                  >
                    {imageUploading ? labels.uploadingImages : labels.uploadImages}
                  </Button>
                </div>

                {getGalleryImages(activeForm).length > 0 ? (
                  <div className="grid gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-500">Bir görseli ana görsel olarak seçin.</p>
                    <p className="text-xs text-neutral-400">Ana görsel, ürün listesi ve detay sayfasında öne çıkan görsel olarak kullanılır.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {getGalleryImages(activeForm).map((url) => {
                        const isMain = url === activeForm.imageUrl;

                        return (
                          <div key={url} className={`overflow-hidden rounded-lg border ${isMain ? "border-emerald-500" : "border-neutral-200"} bg-white`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="h-32 w-full object-cover" />
                            <div className="flex items-center justify-between gap-2 p-2">
                              <Button type="button" size="sm" variant={isMain ? "default" : "outline"} onClick={() => setMainImage(url)}>
                                {isMain ? "Ana Görsel" : "Ana Yap"}
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => removeImage(url)}>
                                Sil
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-neutral-200 pt-5">
                <Button type="button" variant="secondary" onClick={closeDrawer} disabled={loading}>
                  {labels.cancel}
                </Button>
                <Button type="submit" disabled={loading || imageUploading}>
                  {loading ? labels.loading : activeSubmit}
                </Button>
              </div>
            </form>
          </aside>

          {activeVariantEditor ? (
            <div className="absolute inset-0 z-10">
              <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-black/30" onClick={closeVariantEditor} />
              <aside className="absolute bottom-0 right-0 top-0 flex h-full w-full max-w-3xl flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-neutral-200 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.variantsTitle}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{activeVariantEditor.title || labels.variantTitle}</h3>
                    <p className="mt-1 text-sm text-neutral-500">{activeVariantEditor.optionSummary || labels.variantsHint}</p>
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={closeVariantEditor} disabled={loading}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid gap-4 p-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="grid gap-2">
                      <Label>{labels.variantTitle}</Label>
                      <Input value={activeVariantEditor.title} onChange={(event) => patchVariant(variantEditorIndex as number, { title: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.slug}</Label>
                      <Input value={activeVariantEditor.slug} onChange={(event) => patchVariant(variantEditorIndex as number, { slug: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.sku}</Label>
                      <Input value={activeVariantEditor.sku} onChange={(event) => patchVariant(variantEditorIndex as number, { sku: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.barcode}</Label>
                      <Input value={activeVariantEditor.barcode ?? ""} onChange={(event) => patchVariant(variantEditorIndex as number, { barcode: event.target.value })} />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="grid gap-2">
                      <Label>{labels.variantOptionSummary}</Label>
                      <Input value={activeVariantEditor.optionSummary} onChange={(event) => patchVariant(variantEditorIndex as number, { optionSummary: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.variantPriceOverride}</Label>
                      <Input value={activeVariantEditor.priceOverride} type="number" min="0" step="0.01" onChange={(event) => patchVariant(variantEditorIndex as number, { priceOverride: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.variantPurchasePriceOverride}</Label>
                      <Input value={activeVariantEditor.purchasePriceOverride} type="number" min="0" step="0.01" onChange={(event) => patchVariant(variantEditorIndex as number, { purchasePriceOverride: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.variantCompareAtPriceOverride}</Label>
                      <Input value={activeVariantEditor.compareAtPriceOverride} type="number" min="0" step="0.01" onChange={(event) => patchVariant(variantEditorIndex as number, { compareAtPriceOverride: event.target.value })} />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="grid gap-2">
                      <Label>{labels.variantImageUrl}</Label>
                      <Input value={activeVariantEditor.imageUrl} onChange={(event) => patchVariant(variantEditorIndex as number, { imageUrl: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.variantStockOverride}</Label>
                      <Input value={activeVariantEditor.stockOverride} type="number" min="0" step="1" onChange={(event) => patchVariant(variantEditorIndex as number, { stockOverride: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.page}</Label>
                      <Input value={activeVariantEditor.sortOrder} type="number" min="0" step="1" onChange={(event) => patchVariant(variantEditorIndex as number, { sortOrder: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.stockStatus}</Label>
                      <div className="flex flex-wrap gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={activeVariantEditor.isDefault} onChange={(event) => patchVariant(variantEditorIndex as number, { isDefault: event.target.checked })} />
                          <span>{labels.variantDefault}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={activeVariantEditor.salesEnabled} onChange={(event) => patchVariant(variantEditorIndex as number, { salesEnabled: event.target.checked })} />
                          <span>{labels.variantSalesEnabled}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {activeForm.attributeLinks.map((link) => {
                      const definition = attributeDefinitionOptions.find((item) => item.id === link.attributeDefinitionId);
                      const value = activeVariantEditor.attributes.find((attribute) => attribute.attributeDefinitionId === link.attributeDefinitionId)?.value ?? "";
                      if (!definition) {
                        return null;
                      }

                      return (
                        <div key={`${activeVariantEditor.slug || variantEditorIndex}-${definition.id}`} className="grid gap-2">
                          <Label>{definition.name}</Label>
                          <Input
                            value={value}
                            onChange={(event) => patchVariantAttribute(variantEditorIndex as number, definition.id, event.target.value)}
                            placeholder={labels.variantAttributeValue}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          ) : null}

          {attributeDefinitionEditor ? (
            <div className="absolute inset-0 z-10">
              <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-black/20" onClick={closeAttributeDefinitionEditor} />
              <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-neutral-200 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.variantAxes}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{attributeDefinitionEditor.name || labels.attributeName}</h3>
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={closeAttributeDefinitionEditor} disabled={loading}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid gap-4 p-5">
                  <div className="grid gap-2">
                    <Label>{labels.attributeName}</Label>
                    <Input value={attributeDefinitionEditor.name} onChange={(event) => setAttributeDefinitionEditor((prev) => (prev ? { ...prev, name: event.target.value } : prev))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.slug}</Label>
                    <Input value={attributeDefinitionEditor.slug} onChange={(event) => setAttributeDefinitionEditor((prev) => (prev ? { ...prev, slug: event.target.value } : prev))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.attributeDisplayType}</Label>
                    <Select value={attributeDefinitionEditor.displayType} onValueChange={(value) => setAttributeDefinitionEditor((prev) => (prev ? { ...prev, displayType: value as AttributeDefinition["displayType"] } : prev))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">{labels.attributeDisplayText}</SelectItem>
                        <SelectItem value="COLOR">{labels.attributeDisplayColor}</SelectItem>
                        <SelectItem value="NUMBER">{labels.attributeDisplayNumber}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.page}</Label>
                    <Input type="number" min="0" step="1" value={attributeDefinitionEditor.sortOrder} onChange={(event) => setAttributeDefinitionEditor((prev) => (prev ? { ...prev, sortOrder: event.target.value } : prev))} />
                  </div>
                </div>

                <div className="mt-auto flex justify-between gap-2 border-t border-neutral-200 p-5">
                  <Button type="button" variant="outline" disabled={loading} onClick={() => {
                    const definition = attributeDefinitionOptions.find((item) => item.id === attributeDefinitionEditor.id);
                    if (definition) {
                      void deleteAttributeDefinition(definition);
                    }
                  }}>
                    {labels.delete}
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" disabled={loading} onClick={closeAttributeDefinitionEditor}>{labels.cancel}</Button>
                    <Button type="button" disabled={loading} onClick={saveAttributeDefinitionEditor}>{labels.save}</Button>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}

          {variantGenerationOpen ? (
            <div className="absolute inset-0 z-10">
              <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-black/20" onClick={closeVariantGenerationModal} />
              <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-neutral-200 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.variantsTitle}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{labels.generateVariantsTitle}</h3>
                    <p className="mt-1 text-sm text-neutral-500">{labels.generateVariantsHint}</p>
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={closeVariantGenerationModal} disabled={loading}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid gap-4 p-5">
                  {selectedVariantAxisDefinitions.some((definition) => (variantGenerationSuggestions[definition.id] ?? []).length > 0) ? (
                    <div className="flex justify-end">
                      <Button type="button" size="sm" variant="outline" onClick={applyAllVariantGenerationSuggestions}>
                        {labels.generateVariantsUseAllSuggestions}
                      </Button>
                    </div>
                  ) : null}
                  {selectedVariantAxisDefinitions.map((definition) => (
                    <div key={`generator-${definition.id}`} className="grid gap-2">
                      <Label>{definition.name}</Label>
                      <Input
                        value={variantGenerationValues[definition.id] ?? ""}
                        onChange={(event) => setVariantGenerationValues((prev) => ({ ...prev, [definition.id]: event.target.value }))}
                        placeholder={labels.generateVariantsValues}
                      />
                      {variantGenerationSuggestions[definition.id]?.length ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-neutral-500">{labels.generateVariantsSuggestions}</span>
                          {variantGenerationSuggestions[definition.id].map((suggestion) => (
                            <button
                              key={`${definition.id}-${suggestion}`}
                              type="button"
                              className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                              onClick={() => applyVariantGenerationSuggestion(definition.id, suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex justify-end gap-2 border-t border-neutral-200 p-5">
                  <Button type="button" variant="secondary" disabled={loading} onClick={closeVariantGenerationModal}>{labels.cancel}</Button>
                  <Button type="button" disabled={loading} onClick={generateVariantRows}>{labels.generateVariantsApply}</Button>
                </div>
              </aside>
            </div>
          ) : null}

          {quickCreateDrawerMode ? (
            <div className="absolute inset-0 z-10">
              <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-black/20" onClick={closeQuickCreateDrawer} />
              <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-neutral-200 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">
                      {quickCreateDrawerMode === "brand" ? labels.createBrand : labels.createSupplier}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {quickCreateDrawerMode === "brand"
                        ? "Ürün formundan çıkmadan yeni marka kaydı oluşturun."
                        : "Ürün formundan çıkmadan yeni tedarikçi kaydı oluşturun."}
                    </p>
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={closeQuickCreateDrawer} disabled={loading}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {quickCreateDrawerMode === "brand" ? (
                  <div className="grid gap-4 p-5">
                    <div className="grid gap-2">
                      <Label>{labels.brandName}</Label>
                      <Input value={brandCreateForm.name} onChange={(event) => setBrandCreateForm((prev) => ({ ...prev, name: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.slug}</Label>
                      <Input value={brandCreateForm.slug} onChange={(event) => setBrandCreateForm((prev) => ({ ...prev, slug: event.target.value }))} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={closeQuickCreateDrawer} disabled={loading}>{labels.cancel}</Button>
                      <Button type="button" disabled={loading} onClick={createBrandOption}>{labels.createBrand}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 p-5">
                    <div className="grid gap-2">
                      <Label>{labels.supplierName}</Label>
                      <Input value={supplierCreateForm.name} onChange={(event) => setSupplierCreateForm((prev) => ({ ...prev, name: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.slug}</Label>
                      <Input value={supplierCreateForm.slug} onChange={(event) => setSupplierCreateForm((prev) => ({ ...prev, slug: event.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{labels.supplierTaxNumber}</Label>
                      <Input value={supplierCreateForm.taxNumber} onChange={(event) => setSupplierCreateForm((prev) => ({ ...prev, taxNumber: event.target.value }))} />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>{labels.supplierEmail}</Label>
                        <Input value={supplierCreateForm.email} onChange={(event) => setSupplierCreateForm((prev) => ({ ...prev, email: event.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>{labels.supplierPhone}</Label>
                        <Input value={supplierCreateForm.phone} onChange={(event) => setSupplierCreateForm((prev) => ({ ...prev, phone: event.target.value }))} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={closeQuickCreateDrawer} disabled={loading}>{labels.cancel}</Button>
                      <Button type="button" disabled={loading} onClick={createSupplierOption}>{labels.createSupplier}</Button>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
