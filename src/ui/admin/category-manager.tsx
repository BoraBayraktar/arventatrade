"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
};

type ParentCategoryOption = {
  id: string;
  name: string;
  parentId: string | null;
};

type Labels = {
  title: string;
  createTitle: string;
  listTitle: string;
  search: string;
  slug: string;
  name: string;
  productCount: string;
  parentCategory: string;
  noParent: string;
  page: string;
  prev: string;
  next: string;
  save: string;
  create: string;
  edit: string;
  delete: string;
  cancel: string;
  empty: string;
  opFailed: string;
  validationRequired: string;
  validationDeleteBlocked: string;
  loading: string;
};

type Props = {
  initialResult: {
    items: Category[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  parentCandidates: ParentCategoryOption[];
  labels: Labels;
  canDelete: boolean;
};

type DrawerMode = "create" | "edit";

type CategoryForm = {
  slug: string;
  name: string;
  parentId: string;
};

const emptyForm: CategoryForm = {
  slug: "",
  name: "",
  parentId: "",
};

function mapPayload(form: CategoryForm) {
  return {
    slug: form.slug,
    name: form.name,
    parentId: form.parentId.trim() ? form.parentId : null,
  };
}

export function CategoryManager({ initialResult, parentCandidates, labels, canDelete }: Props) {
  const [result, setResult] = useState(initialResult);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CategoryForm>(emptyForm);
  const [editForm, setEditForm] = useState<CategoryForm>(emptyForm);

  const activeForm = drawerMode === "edit" ? editForm : createForm;
  const activeTitle = drawerMode === "edit" ? labels.edit : labels.createTitle;
  const activeSubmit = drawerMode === "edit" ? labels.save : labels.create;

  const candidateById = useMemo(() => {
    return new Map(parentCandidates.map((item) => [item.id, item]));
  }, [parentCandidates]);

  const getCategoryBreadcrumb = (categoryId: string) => {
    const path: string[] = [];
    const visited = new Set<string>();
    let cursor: string | null = categoryId;

    while (cursor) {
      if (visited.has(cursor)) {
        break;
      }

      visited.add(cursor);

      const node = candidateById.get(cursor);
      if (!node) {
        break;
      }

      path.unshift(node.name);
      cursor = node.parentId;
    }

    return path.join(" > ");
  };

  const getCategoryDepth = (categoryId: string) => {
    let depth = 0;
    const visited = new Set<string>();
    let cursor: string | null = categoryId;

    while (cursor) {
      if (visited.has(cursor)) {
        break;
      }

      visited.add(cursor);

      const node = candidateById.get(cursor);
      if (!node || !node.parentId) {
        break;
      }

      depth += 1;
      cursor = node.parentId;
    }

    return depth;
  };

  const getParentBreadcrumb = (category: Category) => {
    if (!category.parentId) {
      return labels.noParent;
    }

    const path: string[] = [];
    const visited = new Set<string>();
    let cursor: string | null = category.parentId;

    while (cursor) {
      if (visited.has(cursor)) {
        break;
      }

      visited.add(cursor);

      const node = candidateById.get(cursor);
      if (!node) {
        break;
      }

      path.unshift(node.name);
      cursor = node.parentId;
    }

    if (path.length === 0) {
      return category.parentName ?? labels.noParent;
    }

    return path.join(" > ");
  };

  const parentSelectOptions = useMemo(() => {
    return parentCandidates
      .map((item) => ({
        ...item,
        depth: getCategoryDepth(item.id),
        label: getCategoryBreadcrumb(item.id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr"));
  }, [parentCandidates]);

  function patchActiveField(field: keyof CategoryForm, value: string) {
    if (drawerMode === "edit") {
      setEditForm((prev) => ({ ...prev, [field]: value }));
      return;
    }

    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(form: CategoryForm) {
    if (!form.slug.trim() || !form.name.trim()) {
      return labels.validationRequired;
    }

    return null;
  }

  async function fetchCategories(nextQuery: string, page: number) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) {
      params.set("search", nextQuery.trim());
    }
    params.set("page", String(page));
    params.set("pageSize", String(result.pageSize));

    const response = await fetch(`/api/admin/categories?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(payload?.message ?? labels.opFailed);
    }

    const payload = (await response.json()) as typeof initialResult;
    setResult(payload);
  }

  function openCreateDrawer() {
    setError(null);
    setEditingId(null);
    setCreateForm(emptyForm);
    setDrawerMode("create");
  }

  function openEditDrawer(category: Category) {
    setError(null);
    setEditingId(category.id);
    setEditForm({
      slug: category.slug,
      name: category.name,
      parentId: category.parentId ?? "",
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

  async function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetchCategories(query, 1);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function goToPage(nextPage: number) {
    setLoading(true);
    setError(null);

    try {
      await fetchCategories(query, nextPage);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function submitCategory(event: React.FormEvent<HTMLFormElement>) {
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
      const response = await fetch(drawerMode === "edit" && editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories", {
        method: drawerMode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mapPayload(form)),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      setCreateForm(emptyForm);
      setDrawerMode(null);
      setEditingId(null);
      await fetchCategories(query, result.page);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(category: Category) {
    if (category.productCount > 0) {
      setError(labels.validationDeleteBlocked);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.opFailed);
        return;
      }

      await fetchCategories(query, Math.min(result.page, Math.max(1, result.totalPages)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : labels.opFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{labels.listTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">{result.total} kategori listeleniyor</p>
        </div>
        <Button type="button" onClick={openCreateDrawer}>{labels.createTitle}</Button>
      </div>

      <div className="p-5">
        {error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <form className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={applyFilters}>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} />
          <Button type="submit" variant="secondary" disabled={loading}>{labels.search}</Button>
        </form>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <div className="hidden grid-cols-[1fr_1fr_1fr_120px_190px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
            <span>{labels.name}</span>
            <span>{labels.slug}</span>
            <span>{labels.parentCategory}</span>
            <span>{labels.productCount}</span>
            <span className="text-right">Islem</span>
          </div>

          {result.items.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">{labels.empty}</p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {result.items.map((category) => (
                <article key={category.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr_1fr_120px_190px] lg:items-center">
                  <div>
                    <h3 className="font-medium text-neutral-950">{category.name}</h3>
                  </div>
                  <p className="text-sm text-neutral-500">{category.slug}</p>
                  <p className="text-sm text-neutral-500">{getParentBreadcrumb(category)}</p>
                  <p className="text-sm font-semibold text-neutral-950">{category.productCount}</p>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button type="button" size="sm" variant="secondary" disabled={loading} onClick={() => openEditDrawer(category)}>{labels.edit}</Button>
                    {canDelete ? (
                      <Button type="button" size="sm" variant="destructive" disabled={loading || category.productCount > 0} onClick={() => deleteCategory(category)}>{labels.delete}</Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" disabled={result.page <= 1 || loading} onClick={() => goToPage(Math.max(1, result.page - 1))}>{labels.prev}</Button>
          <span className="text-sm text-neutral-500">{labels.page} {result.page}/{result.totalPages}</span>
          <Button type="button" variant="secondary" disabled={result.page >= result.totalPages || loading} onClick={() => goToPage(Math.min(result.totalPages, result.page + 1))}>{labels.next}</Button>
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

            <form className="grid gap-4 p-5" onSubmit={submitCategory}>
              <div className="grid gap-2">
                <Label>{labels.slug}</Label>
                <Input value={activeForm.slug} onChange={(event) => patchActiveField("slug", event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>{labels.name}</Label>
                <Input value={activeForm.name} onChange={(event) => patchActiveField("name", event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>{labels.parentCategory}</Label>
                <select
                  value={activeForm.parentId}
                  onChange={(event) => patchActiveField("parentId", event.target.value)}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                >
                  <option value="">{labels.noParent}</option>
                  {parentSelectOptions
                    .filter((item) => (drawerMode === "edit" ? item.id !== editingId : true))
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {`${"-- ".repeat(item.depth)}${item.label}`}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-neutral-200 pt-5">
                <Button type="button" variant="secondary" onClick={closeDrawer} disabled={loading}>{labels.cancel}</Button>
                <Button type="submit" disabled={loading}>{loading ? labels.loading : activeSubmit}</Button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
