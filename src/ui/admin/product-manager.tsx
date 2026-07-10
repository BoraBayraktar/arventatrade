"use client";

import { useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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

type Product = {
  id: string;
  slug: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string;
  productType: "PHYSICAL" | "SERVICE" | "RAW_MATERIAL" | "SEMI_FINISHED";
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
  preferredSalesWarehouseId: string | null;
  preferredPurchaseWarehouseId: string | null;
  imageUrl: string;
  imageUrls?: string[];
  features: ProductFeature[];
  categoryId: string | null;
  categoryName: string | null;
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
  unitType: string;
  price: string;
  purchasePrice: string;
  compareAtPrice: string;
  stock: string;
  vatRate: string;
  stockTrackingEnabled: string;
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
  };
  categories: Category[];
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
  unitType: string;
  price: string;
  purchasePrice: string;
  compareAtPrice: string;
  stock: string;
  vatRate: string;
  stockTrackingEnabled: boolean;
  preferredSalesWarehouseId: string;
  preferredPurchaseWarehouseId: string;
  imageUrl: string;
  imageUrls: string[];
  categoryId: string;
  features: ProductFeature[];
};

type DrawerMode = "create" | "edit";

const NONE_VALUE = "__none__";
const MAX_PRODUCT_IMAGES = 6;

const PRODUCT_TYPE_OPTIONS = [
  { value: "PHYSICAL", tr: "Fiziksel", en: "Physical" },
  { value: "SERVICE", tr: "Hizmet", en: "Service" },
  { value: "RAW_MATERIAL", tr: "Hammadde", en: "Raw Material" },
  { value: "SEMI_FINISHED", tr: "Yarı Mamul", en: "Semi Finished" },
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

  return {
    slug: form.slug,
    sku: form.sku,
    barcode: form.barcode.trim() || null,
    name: form.name,
    description: form.description,
    productType: form.productType,
    unitType: form.unitType,
    price: Number(form.price),
    purchasePrice: form.purchasePrice.trim() ? Number(form.purchasePrice) : null,
    compareAtPrice,
    stock: stockTrackingEnabled ? Number(form.stock) : 0,
    vatRate: Number(form.vatRate),
    stockTrackingEnabled,
    preferredSalesWarehouseId: form.preferredSalesWarehouseId.trim() || null,
    preferredPurchaseWarehouseId: form.preferredPurchaseWarehouseId.trim() || null,
    imageUrl: mainImage,
    imageUrls,
    features,
    categoryId: form.categoryId || null,
  };
}

function createEmptyFeature(): ProductFeature {
  return {
    key: "",
    value: "",
    highlighted: false,
  };
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
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency,
  }).format(price);
}

function formatDiscount(discountRate: number | null) {
  if (!discountRate || discountRate <= 0) {
    return "-";
  }

  return `%${discountRate}`;
}

export function ProductManager({
  labels,
  locale,
  initialResult,
  initialQuery,
  categories,
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [drawerFullscreen, setDrawerFullscreen] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const emptyForm = useMemo<ProductForm>(
    () => ({
      slug: "",
      sku: "",
      barcode: "",
      name: "",
      description: "",
      productType: "PHYSICAL",
      unitType: "PIECE",
      price: "",
      purchasePrice: "",
      compareAtPrice: "",
      stock: "0",
      vatRate: "20",
      stockTrackingEnabled: true,
      preferredSalesWarehouseId: "",
      preferredPurchaseWarehouseId: "",
      imageUrl: "",
      imageUrls: [],
      categoryId: "",
      features: [],
    }),
    [],
  );

  const [createForm, setCreateForm] = useState<ProductForm>(emptyForm);
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm);

  const activeForm = drawerMode === "edit" ? editForm : createForm;
  const activeTitle = drawerMode === "edit" ? labels.edit : labels.createTitle;
  const activeSubmit = drawerMode === "edit" ? labels.save : labels.create;
  const isStockManaged = activeForm.stockTrackingEnabled && activeForm.productType !== "SERVICE";

  function pushQuery(next: { search: string; categoryId: string; page: number }) {
    const params = new URLSearchParams();

    if (next.search.trim()) {
      params.set("search", next.search.trim());
    }

    if (next.categoryId.trim()) {
      params.set("categoryId", next.categoryId.trim());
    }

    if (next.page > 1) {
      params.set("page", String(next.page));
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function validateForm(form: ProductForm) {
    const requiresStock = form.stockTrackingEnabled && form.productType !== "SERVICE";

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
    patchActiveForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateDrawer() {
    setError(null);
    setEditingId(null);
    setCreateForm(emptyForm);
    setImageFiles([]);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
    setDrawerFullscreen(false);
    setDrawerMode("create");
  }

  function openEditDrawer(product: Product) {
    setError(null);
    setEditingId(product.id);
    setEditForm({
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode ?? "",
      name: product.name,
      description: product.description,
      productType: product.productType,
      unitType: product.unitType,
      price: String(product.price),
      purchasePrice: product.purchasePrice ? String(product.purchasePrice) : "",
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      vatRate: String(product.vatRate),
      stockTrackingEnabled: product.stockTrackingEnabled,
      preferredSalesWarehouseId: product.preferredSalesWarehouseId ?? "",
      preferredPurchaseWarehouseId: product.preferredPurchaseWarehouseId ?? "",
      imageUrl: product.imageUrl,
      imageUrls: (product.imageUrls ?? []).slice(0, MAX_PRODUCT_IMAGES - 1),
      categoryId: product.categoryId ?? "",
      features: product.features.length > 0 ? product.features.map((feature) => ({ ...feature })) : [],
    });
    setImageFiles([]);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
    setDrawerFullscreen(false);
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
    setError(null);
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
    pushQuery({ search: searchQuery, categoryId: categoryFilter, page: 1 });
  }

  function goToPage(nextPage: number) {
    pushQuery({ search: searchQuery, categoryId: categoryFilter, page: nextPage });
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{labels.listTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">{initialResult.total} ürün listeleniyor</p>
        </div>
        <Button type="button" onClick={openCreateDrawer}>
          {labels.createTitle}
        </Button>
      </div>

      <div className="p-5">
        {error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
        <form className="mb-5 grid gap-3 md:grid-cols-[1fr_240px_auto]" onSubmit={applyFilters}>
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
          <Button type="submit" variant="secondary">
            {labels.search}
          </Button>
        </form>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <div className="hidden grid-cols-[80px_1.2fr_1fr_180px_100px_120px_190px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
            <span>Görsel</span>
            <span>{labels.name}</span>
            <span>{labels.category}</span>
            <span>{labels.price}</span>
            <span>{labels.discount}</span>
            <span>{labels.stockStatus}</span>
            <span className="text-right">İşlem</span>
          </div>

          {initialResult.items.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">{labels.empty}</p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {initialResult.items.map((product) => (
                <article key={product.id} className="grid gap-4 p-4 lg:grid-cols-[80px_1.2fr_1fr_180px_100px_120px_190px] lg:items-center">
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
                  <p className="text-sm text-neutral-600">{product.categoryName ?? labels.notSpecified}</p>
                  <div className="text-sm">
                    <p className="font-semibold text-neutral-950">{formatPrice(product.price, product.currency, locale)}</p>
                    {product.compareAtPrice ? (
                      <p className="text-xs text-neutral-500 line-through">{formatPrice(product.compareAtPrice, product.currency, locale)}</p>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-green-700">{formatDiscount(product.discountRate)}</p>
                  <p className={`text-sm font-medium ${product.inStock ? "text-emerald-700" : "text-red-600"}`}>
                    {product.inStock ? labels.inStock : labels.outOfStock} ({product.stock})
                  </p>
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
                  aria-label={locale === "tr" ? (drawerFullscreen ? "Daralt" : "Tam ekran") : (drawerFullscreen ? "Collapse" : "Fullscreen")}
                  title={locale === "tr" ? (drawerFullscreen ? "Daralt" : "Tam ekran") : (drawerFullscreen ? "Collapse" : "Fullscreen")}
                >
                  {drawerFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={closeDrawer} disabled={loading}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <form className="grid gap-4 p-5" onSubmit={submitProduct}>
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
              <div className="grid gap-2">
                <Label>{labels.name}</Label>
                <Input value={activeForm.name} onChange={(event) => patchActiveField("name", event.target.value)} required />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{labels.productType}</Label>
                  <Select value={activeForm.productType} onValueChange={(value) => patchActiveField("productType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {locale === "tr" ? option.tr : option.en}
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
                          {locale === "tr" ? option.tr : option.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{labels.description}</Label>
                <Textarea value={activeForm.description} onChange={(event) => patchActiveField("description", event.target.value)} required />
              </div>
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
                          placeholder={locale === "tr" ? "Tip" : "Type"}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>{labels.featureValue}</Label>
                        <Input
                          value={feature.value}
                          onChange={(event) => patchFeature(index, { value: event.target.value })}
                          placeholder={locale === "tr" ? "Kule Tipi" : "Tower"}
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
                  <Label>{labels.purchasePrice}</Label>
                  <Input type="number" min="0" step="0.01" value={activeForm.purchasePrice} onChange={(event) => patchActiveField("purchasePrice", event.target.value)} />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{labels.compareAtPrice}</Label>
                  <Input type="number" min="0" step="0.01" value={activeForm.compareAtPrice} onChange={(event) => patchActiveField("compareAtPrice", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>{labels.vatRate}</Label>
                  <Input type="number" min="0" max="100" step="1" value={activeForm.vatRate} onChange={(event) => patchActiveField("vatRate", event.target.value)} required />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
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
                <div className="grid gap-2">
                  <Label>{labels.category}</Label>
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
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
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
                <div className="grid gap-2">
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
              <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={activeForm.productType === "SERVICE" ? false : activeForm.stockTrackingEnabled}
                  onChange={(event) => patchActiveForm((prev) => ({ ...prev, stockTrackingEnabled: event.target.checked }))}
                  disabled={activeForm.productType === "SERVICE"}
                />
                {labels.stockTrackingEnabled}
              </label>
              <div className="grid gap-2">
                <p className="text-xs text-neutral-500">{locale === "tr" ? `Toplam görsel adedi: ${getGalleryImages(activeForm).length}/${MAX_PRODUCT_IMAGES}` : `Total image count: ${getGalleryImages(activeForm).length}/${MAX_PRODUCT_IMAGES}`}</p>
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
                    <p className="text-xs text-neutral-500">{locale === "tr" ? "Bir görseli ana görsel olarak seçin." : "Select one image as the main image."}</p>
                    <p className="text-xs text-neutral-400">{locale === "tr" ? "Ana görsel, ürün listesi ve detay sayfasında öne çıkan görsel olarak kullanılır." : "The main image is used as the featured image on product listings and detail pages."}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {getGalleryImages(activeForm).map((url) => {
                        const isMain = url === activeForm.imageUrl;

                        return (
                          <div key={url} className={`overflow-hidden rounded-lg border ${isMain ? "border-emerald-500" : "border-neutral-200"} bg-white`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="h-32 w-full object-cover" />
                            <div className="flex items-center justify-between gap-2 p-2">
                              <Button type="button" size="sm" variant={isMain ? "default" : "outline"} onClick={() => setMainImage(url)}>
                                {isMain ? (locale === "tr" ? "Ana Görsel" : "Main Image") : (locale === "tr" ? "Ana Yap" : "Set Main")}
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => removeImage(url)}>
                                {locale === "tr" ? "Sil" : "Remove"}
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
        </div>
      ) : null}
    </section>
  );
}
