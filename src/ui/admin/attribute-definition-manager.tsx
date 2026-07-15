"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminProductAttributeDefinitionItem } from "@/modules/catalog/contracts/catalog-admin.contract";

type Labels = {
  title: string;
  description: string;
  createTitle: string;
  empty: string;
  slug: string;
  attributeName: string;
  attributeDisplayType: string;
  attributeDisplayText: string;
  attributeDisplayColor: string;
  attributeDisplayNumber: string;
  variantAxisUsageCount: string;
  page: string;
  create: string;
  save: string;
  edit: string;
  delete: string;
  cancel: string;
  saving: string;
  search: string;
  importCsv: string;
  exportCsv: string;
  status: string;
  statusActive: string;
  statusArchived: string;
  selectedCount: string;
};

type Props = {
  items: AdminProductAttributeDefinitionItem[];
  labels: Labels;
};

type DrawerMode = "create" | "edit";

type FormState = {
  slug: string;
  name: string;
  displayType: AdminProductAttributeDefinitionItem["displayType"];
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  displayType: "TEXT",
  sortOrder: "0",
  isActive: true,
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function toCsvValue(value: string | number | boolean) {
  const normalized = String(value);
  if (normalized.includes(",") || normalized.includes("\"") || normalized.includes("\n")) {
    return `"${normalized.replaceAll("\"", "\"\"")}"`;
  }
  return normalized;
}

export function AttributeDefinitionManager({ items, labels }: Props) {
  const router = useRouter();
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const filteredItems = useMemo(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase("tr-TR");
    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      [item.name, item.slug, item.displayType].some((value) => value.toLocaleLowerCase("tr-TR").includes(normalized)),
    );
  }, [items, searchQuery]);

  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  function openCreateDrawer() {
    resetMessages();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDrawerMode("create");
  }

  function openEditDrawer(item: AdminProductAttributeDefinitionItem) {
    resetMessages();
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      name: item.name,
      displayType: item.displayType,
      sortOrder: String(item.sortOrder),
      isActive: item.isActive,
    });
    setDrawerMode("edit");
  }

  function closeDrawer() {
    if (pending) {
      return;
    }

    setDrawerMode(null);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredItems.some((item) => item.id === id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredItems.map((item) => item.id)])));
  }

  async function submitForm() {
    setPending(true);
    resetMessages();

    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        displayType: form.displayType,
        sortOrder: Number(form.sortOrder || "0"),
        isActive: form.isActive,
      };

      const response = await fetch(
        drawerMode === "edit" && editingId ? `/api/admin/product-attributes/${editingId}` : "/api/admin/product-attributes",
        {
          method: drawerMode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(body?.message ?? "Ozellik tanimi kaydedilemedi.");
        return;
      }

      closeDrawer();
      router.refresh();
    } catch {
      setError("Ozellik tanimi kaydedilemedi.");
    } finally {
      setPending(false);
    }
  }

  async function deleteItems(ids: string[]) {
    if (ids.length === 0) {
      return;
    }

    setPending(true);
    resetMessages();

    try {
      for (const id of ids) {
        const response = await fetch(`/api/admin/product-attributes/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { message?: string } | null;
          setError(body?.message ?? "Ozellik tanimi silinemedi.");
          setPending(false);
          return;
        }
      }

      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      if (editingId && ids.includes(editingId)) {
        closeDrawer();
      }
      router.refresh();
    } catch {
      setError("Ozellik tanimi silinemedi.");
    } finally {
      setPending(false);
    }
  }

  function exportCsv() {
    resetMessages();
    const header = ["name", "slug", "displayType", "sortOrder", "isActive", "productCount"];
    const rows = items.map((item) => [
      toCsvValue(item.name),
      toCsvValue(item.slug),
      toCsvValue(item.displayType),
      toCsvValue(item.sortOrder),
      toCsvValue(item.isActive),
      toCsvValue(item.productCount),
    ]);
    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product-attribute-definitions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(file: File | null) {
    if (!file) {
      return;
    }

    setImporting(true);
    resetMessages();

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length <= 1) {
        setError("CSV dosyasinda aktarilacak satir bulunamadi.");
        return;
      }

      const header = parseCsvLine(lines[0]).map((value) => value.toLocaleLowerCase("tr-TR"));
      const createdRows: string[] = [];

      for (const line of lines.slice(1)) {
        const columns = parseCsvLine(line);
        const row = Object.fromEntries(header.map((key, index) => [key, columns[index] ?? ""])) as Record<string, string>;

        if (!row.name?.trim() || !row.slug?.trim()) {
          continue;
        }

        const response = await fetch("/api/admin/product-attributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row.name.trim(),
            slug: row.slug.trim(),
            displayType: row.displaytype === "COLOR" || row.displaytype === "NUMBER" ? row.displaytype : "TEXT",
            sortOrder: Number(row.sortorder || "0"),
            isActive: row.isactive ? row.isactive.toLowerCase() !== "false" : true,
          }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { message?: string } | null;
          setError(body?.message ?? "CSV ici aktarma tamamlanamadi.");
          return;
        }

        createdRows.push(row.name.trim());
      }

      setSuccess(`${createdRows.length} ozellik tanimi ice aktarildi.`);
      router.refresh();
    } catch {
      setError("CSV ici aktarma tamamlanamadi.");
    } finally {
      setImporting(false);
      if (importFileInputRef.current) {
        importFileInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{labels.createTitle}</h2>
          <p className="mt-1 text-sm text-neutral-500">{labels.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <input
            ref={importFileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => void importCsv(event.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={importing || pending} onClick={() => importFileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            {labels.importCsv}
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={pending} onClick={exportCsv}>
            <Download className="h-4 w-4" />
            {labels.exportCsv}
          </Button>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={pending || selectedIds.length === 0} onClick={() => void deleteItems(selectedIds)}>
            <Trash2 className="h-4 w-4" />
            {labels.delete} ({selectedIds.length})
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={openCreateDrawer}>
            <Plus className="h-4 w-4" />
            {labels.create}
          </Button>
        </div>
      </div>

      <div className="p-5">
        {error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
        {success ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{success}</p> : null}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={labels.search}
            className="w-full max-w-md"
          />
          <p className="text-sm text-neutral-500">
            {labels.selectedCount}: {selectedIds.length}
          </p>
        </div>

        <div className="grid gap-3 lg:hidden">
          {filteredItems.length === 0 ? (
            <article className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
              {labels.empty}
            </article>
          ) : (
            filteredItems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    aria-label={item.name}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-neutral-950">{item.name}</h3>
                      <span
                        className={
                          item.isActive
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                        }
                      >
                        {item.isActive ? labels.statusActive : labels.statusArchived}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                      <p>{labels.slug}: {item.slug}</p>
                      <p>{labels.attributeDisplayType}: {item.displayType}</p>
                      <p>{labels.page}: {item.sortOrder}</p>
                      <p>{labels.variantAxisUsageCount}: {item.productCount}</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button type="button" size="sm" variant="secondary" className="w-full sm:w-auto" onClick={() => openEditDrawer(item)}>
                        <Pencil className="h-4 w-4" />
                        {labels.edit}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" className="w-full sm:w-auto" disabled={pending} onClick={() => void deleteItems([item.id])}>
                        <Trash2 className="h-4 w-4" />
                        {labels.delete}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} aria-label={labels.selectedCount} />
                  </th>
                  <th className="px-4 py-3">{labels.attributeName}</th>
                  <th className="px-4 py-3">{labels.slug}</th>
                  <th className="px-4 py-3">{labels.attributeDisplayType}</th>
                  <th className="px-4 py-3">{labels.page}</th>
                  <th className="px-4 py-3">{labels.variantAxisUsageCount}</th>
                  <th className="px-4 py-3">{labels.status}</th>
                  <th className="px-4 py-3 text-right">{labels.save}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-500">
                      {labels.empty}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/80">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          aria-label={item.name}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-950">{item.name}</td>
                      <td className="px-4 py-3 text-neutral-600">{item.slug}</td>
                      <td className="px-4 py-3 text-neutral-600">{item.displayType}</td>
                      <td className="px-4 py-3 text-neutral-600">{item.sortOrder}</td>
                      <td className="px-4 py-3 text-neutral-600">{item.productCount}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.isActive
                              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                          }
                        >
                          {item.isActive ? labels.statusActive : labels.statusArchived}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => openEditDrawer(item)}>
                            <Pencil className="h-4 w-4" />
                            {labels.edit}
                          </Button>
                          <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => void deleteItems([item.id])}>
                            <Trash2 className="h-4 w-4" />
                            {labels.delete}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {drawerMode ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label={labels.cancel} className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl sm:max-w-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                <h3 className="mt-1 text-lg font-semibold text-neutral-950 sm:text-xl">
                  {drawerMode === "create" ? labels.createTitle : `${labels.edit}: ${form.name || labels.attributeName}`}
                </h3>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={closeDrawer} disabled={pending}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 px-4 py-5 sm:px-5">
              <div className="grid gap-2">
                <Label>{labels.attributeName}</Label>
                <Input value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>{labels.slug}</Label>
                <Input value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{labels.attributeDisplayType}</Label>
                  <Select value={form.displayType} onValueChange={(value) => updateForm("displayType", value as FormState["displayType"])}>
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
                  <Input type="number" min="0" step="1" value={form.sortOrder} onChange={(event) => updateForm("sortOrder", event.target.value)} />
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateForm("isActive", event.target.checked)}
                />
                {labels.statusActive}
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={closeDrawer} disabled={pending}>
                {labels.cancel}
              </Button>
              <Button type="button" className="w-full sm:w-auto" onClick={() => void submitForm()} disabled={pending}>
                {pending ? labels.saving : drawerMode === "create" ? labels.create : labels.save}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
