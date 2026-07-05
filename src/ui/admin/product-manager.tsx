"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n";

type Category = {
  id: string;
  slug: string;
  name: string;
};

type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  discountRate: number | null;
  stock: number;
  inStock: boolean;
  currency: string;
  imageUrl: string;
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
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imageUrl: string;
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
  canDelete: boolean;
};

type ProductForm = {
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
};

type DrawerMode = "create" | "edit";

const NONE_VALUE = "__none__";

function toPayload(form: ProductForm) {
  const compareAtPrice = form.compareAtPrice.trim() ? Number(form.compareAtPrice) : null;

  return {
    slug: form.slug,
    sku: form.sku,
    name: form.name,
    description: form.description,
    price: Number(form.price),
    compareAtPrice,
    stock: Number(form.stock),
    imageUrl: form.imageUrl,
    categoryId: form.categoryId || null,
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

export function ProductManager({ labels, locale, initialResult, initialQuery, categories, canDelete }: ProductManagerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery.search);
  const [categoryFilter, setCategoryFilter] = useState(initialQuery.categoryId);

  const emptyForm = useMemo<ProductForm>(
    () => ({
      slug: "",
      sku: "",
      name: "",
      description: "",
      price: "",
      compareAtPrice: "",
      stock: "0",
      imageUrl: "",
      categoryId: "",
    }),
    [],
  );

  const [createForm, setCreateForm] = useState<ProductForm>(emptyForm);
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm);

  const activeForm = drawerMode === "edit" ? editForm : createForm;
  const activeTitle = drawerMode === "edit" ? labels.edit : labels.createTitle;
  const activeSubmit = drawerMode === "edit" ? labels.save : labels.create;

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
    if (!form.slug.trim() || !form.sku.trim() || !form.name.trim() || !form.description.trim() || !form.price.trim() || !form.stock.trim() || !form.imageUrl.trim()) {
      return labels.validationRequired;
    }

    const numericPrice = Number(form.price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return labels.validationPrice;
    }

    const numericStock = Number(form.stock);
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return labels.validationStock;
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

    return null;
  }

  function patchActiveField(field: keyof ProductForm, value: string) {
    if (drawerMode === "edit") {
      setEditForm((prev) => ({ ...prev, [field]: value }));
      return;
    }

    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateDrawer() {
    setError(null);
    setEditingId(null);
    setCreateForm(emptyForm);
    setDrawerMode("create");
  }

  function openEditDrawer(product: Product) {
    setError(null);
    setEditingId(product.id);
    setEditForm({
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId ?? "",
    });
    setDrawerMode("edit");
  }

  function closeDrawer() {
    if (loading) {
      return;
    }

    setDrawerMode(null);
    setEditingId(null);
    setError(null);
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
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{activeTitle}</h3>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={closeDrawer} disabled={loading}>
                <X className="h-5 w-5" />
              </Button>
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
                <Label>{labels.name}</Label>
                <Input value={activeForm.name} onChange={(event) => patchActiveField("name", event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>{labels.description}</Label>
                <Textarea value={activeForm.description} onChange={(event) => patchActiveField("description", event.target.value)} required />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{labels.price}</Label>
                  <Input type="number" min="0" step="0.01" value={activeForm.price} onChange={(event) => patchActiveField("price", event.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>{labels.compareAtPrice}</Label>
                  <Input type="number" min="0" step="0.01" value={activeForm.compareAtPrice} onChange={(event) => patchActiveField("compareAtPrice", event.target.value)} />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{labels.stock}</Label>
                  <Input type="number" min="0" step="1" value={activeForm.stock} onChange={(event) => patchActiveField("stock", event.target.value)} required />
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
              <div className="grid gap-2">
                <Label>{labels.imageUrl}</Label>
                <Input value={activeForm.imageUrl} onChange={(event) => patchActiveField("imageUrl", event.target.value)} required />
              </div>

              {activeForm.imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeForm.imageUrl} alt="" className="h-52 w-full object-cover" />
                </div>
              ) : null}

              <div className="mt-2 flex justify-end gap-2 border-t border-neutral-200 pt-5">
                <Button type="button" variant="secondary" onClick={closeDrawer} disabled={loading}>
                  {labels.cancel}
                </Button>
                <Button type="submit" disabled={loading}>
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
