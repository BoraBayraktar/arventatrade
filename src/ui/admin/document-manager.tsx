"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminBusinessDocumentDetail,
  AdminBusinessDocumentListResult,
} from "@/modules/documents/contracts/document.contract";

type Labels = {
  title: string;
  description: string;
  createTitle: string;
  documentNumber: string;
  documentType: string;
  documentStatus: string;
  issueDate: string;
  counterparty: string;
  externalReference: string;
  externalSystemStatus: string;
  orderNumber: string;
  inventoryTransactionNumber: string;
  note: string;
  create: string;
  saving: string;
  search: string;
  noResults: string;
  viewLines: string;
  notSpecified: string;
  queueDispatch: string;
  queueing: string;
  dispatchHistory: string;
  dispatchProvider: string;
  dispatchError: string;
  dispatchQueuedAt: string;
  noDispatchHistory: string;
  providerSelection: string;
  providerNone: string;
  selectSupplier: string;
  selectCustomerAccount: string;
  searchCounterparty: string;
  noCounterpartyResults: string;
  queueStatusSync: string;
  statusSyncing: string;
  badgeNotSent: string;
  badgeQueued: string;
  badgeSent: string;
  badgeFailed: string;
  slaAttention: string;
  slaCritical: string;
  slaQueuedStale: string;
};

type Props = {
  locale: string;
  result: AdminBusinessDocumentListResult;
  providerOptions: Array<{ id: string; displayName: string; isDefault: boolean }>;
  supplierOptions: Array<{ id: string; name: string; description: string | null }>;
  customerAccountOptions: Array<{ id: string; name: string; description: string | null }>;
  initialSearch: string;
  labels: Labels;
};

function subscribeNoop() {
  return () => {};
}

function getCurrentDateTimeLocalValue() {
  return new Date().toISOString().slice(0, 16);
}

function getExternalStatusBadgeClass(status: "NOT_SENT" | "QUEUED" | "SENT" | "FAILED") {
  switch (status) {
    case "SENT":
      return "rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700";
    case "QUEUED":
      return "rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700";
    case "FAILED":
      return "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700";
    default:
      return "rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700";
  }
}

function getExternalStatusLabel(
  status: "NOT_SENT" | "QUEUED" | "SENT" | "FAILED",
  labels: Pick<Labels, "badgeNotSent" | "badgeQueued" | "badgeSent" | "badgeFailed">,
) {
  switch (status) {
    case "SENT":
      return labels.badgeSent;
    case "QUEUED":
      return labels.badgeQueued;
    case "FAILED":
      return labels.badgeFailed;
    default:
      return labels.badgeNotSent;
  }
}

function getSlaBadge(item: AdminBusinessDocumentListResult["items"][number], labels: Pick<Labels, "slaAttention" | "slaCritical" | "slaQueuedStale">) {
  const ageHours = (Date.now() - new Date(item.issueDate).getTime()) / (1000 * 60 * 60);

  if (item.externalSystemStatus === "NOT_SENT") {
    if (ageHours >= 72) {
      return {
        className: "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700",
        label: labels.slaCritical,
      };
    }

    if (ageHours >= 24) {
      return {
        className: "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700",
        label: labels.slaAttention,
      };
    }
  }

  if (item.externalSystemStatus === "QUEUED" && ageHours >= 24) {
    return {
      className: "rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700",
      label: labels.slaQueuedStale,
    };
  }

  return null;
}

export function DocumentManager({ locale, result, providerOptions, supplierOptions, customerAccountOptions, initialSearch, labels }: Props) {
  const router = useRouter();
  const defaultDateTimeLocal = useSyncExternalStore(
    subscribeNoop,
    getCurrentDateTimeLocalValue,
    () => "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminBusinessDocumentDetail | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [statusSyncingId, setStatusSyncingId] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentType, setDocumentType] = useState<"PURCHASE_DOCUMENT" | "DELIVERY_NOTE" | "E_INVOICE" | "E_DISPATCH">("PURCHASE_DOCUMENT");
  const [issueDate, setIssueDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [customerAccountId, setCustomerAccountId] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [externalSystemStatus, setExternalSystemStatus] = useState<"NOT_SENT" | "QUEUED" | "SENT" | "FAILED">("NOT_SENT");
  const [providerConfigId, setProviderConfigId] = useState<string>(providerOptions.find((item) => item.isDefault)?.id ?? "");
  const [orderNumber, setOrderNumber] = useState("");
  const [inventoryTransactionNumber, setInventoryTransactionNumber] = useState("");
  const [note, setNote] = useState("");

  async function createDocument() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentNumber,
          documentType,
          issueDate: new Date(issueDate || defaultDateTimeLocal).toISOString(),
          supplierId: supplierId || undefined,
          customerAccountId: customerAccountId || undefined,
          externalReference: externalReference.trim() || undefined,
          externalSystemStatus,
          providerConfigId: providerConfigId || undefined,
          orderNumber: orderNumber.trim() || undefined,
          inventoryTransactionNumber: inventoryTransactionNumber.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? "Belge kaydedilemedi.");
        return;
      }

      router.refresh();
      setDocumentNumber("");
      setSupplierId("");
      setCustomerAccountId("");
      setExternalReference("");
      setProviderConfigId(providerOptions.find((item) => item.isDefault)?.id ?? "");
      setOrderNumber("");
      setInventoryTransactionNumber("");
      setNote("");
    } catch {
      setError("Belge kaydedilemedi.");
    } finally {
      setPending(false);
    }
  }

  const usesSupplierCounterparty = documentType === "PURCHASE_DOCUMENT" || documentType === "DELIVERY_NOTE";

  async function openDetail(id: string) {
    const response = await fetch(`/api/admin/documents/${id}`, { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as { item: AdminBusinessDocumentDetail };
    setDetail(payload.item);
  }

  async function updateStatus(id: string, status: "DRAFT" | "LINKED" | "ISSUED" | "CANCELLED") {
    const response = await fetch(`/api/admin/documents/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      if (detail?.id === id) {
        const payload = (await response.json()) as { item: AdminBusinessDocumentDetail };
        setDetail(payload.item);
      }
      router.refresh();
    }
  }

  async function queueDispatch(id: string, selectedProviderConfigId?: string | null) {
    setDispatchingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/documents/${id}/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerConfigId: selectedProviderConfigId ?? undefined }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? "Belge gönderim kuyruğuna alınamadı.");
        return;
      }

      const payload = (await response.json()) as { item: AdminBusinessDocumentDetail };
      if (detail?.id === id) {
        setDetail(payload.item);
      }

      router.refresh();
    } catch {
      setError("Belge gönderim kuyruğuna alınamadı.");
    } finally {
      setDispatchingId(null);
    }
  }

  async function queueStatusSync(id: string, selectedProviderConfigId?: string | null) {
    setStatusSyncingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/documents/${id}/status-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerConfigId: selectedProviderConfigId ?? undefined }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? "Belge durum senkronu kuyruğuna alınamadı.");
        return;
      }

      const payload = (await response.json()) as { item: AdminBusinessDocumentDetail };
      if (detail?.id === id) {
        setDetail(payload.item);
      }

      router.refresh();
    } catch {
      setError("Belge durum senkronu kuyruğuna alınamadı.");
    } finally {
      setStatusSyncingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
          <p className="text-sm text-neutral-600">{labels.description}</p>
        </div>
        <form action={`/${locale}/admin/documents`} className="mt-4">
          <Input
            type="search"
            name="search"
            defaultValue={initialSearch}
            placeholder={labels.search}
          />
        </form>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">{labels.createTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} placeholder={labels.documentNumber} />
          <Select value={documentType} onValueChange={(value) => setDocumentType(value as typeof documentType)}>
            <SelectTrigger>
              <SelectValue placeholder={labels.documentType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PURCHASE_DOCUMENT">Satın alma belgesi</SelectItem>
              <SelectItem value="DELIVERY_NOTE">İrsaliye</SelectItem>
              <SelectItem value="E_INVOICE">E-fatura</SelectItem>
              <SelectItem value="E_DISPATCH">E-irsaliye</SelectItem>
            </SelectContent>
          </Select>
          <Input type="datetime-local" value={issueDate || defaultDateTimeLocal} onChange={(event) => setIssueDate(event.target.value)} />
          <SearchableSelect
            value={usesSupplierCounterparty ? supplierId : customerAccountId}
            onValueChange={(value) => {
              if (usesSupplierCounterparty) {
                setSupplierId(value);
                return;
              }
              setCustomerAccountId(value);
            }}
            options={(usesSupplierCounterparty ? supplierOptions : customerAccountOptions).map((item) => ({
              value: item.id,
              label: item.name,
              description: item.description,
            }))}
            placeholder={usesSupplierCounterparty ? labels.selectSupplier : labels.selectCustomerAccount}
            searchPlaceholder={labels.searchCounterparty}
            emptyLabel={labels.noCounterpartyResults}
          />
          <Input value={externalReference} onChange={(event) => setExternalReference(event.target.value)} placeholder={labels.externalReference} />
          <Select value={externalSystemStatus} onValueChange={(value) => setExternalSystemStatus(value as typeof externalSystemStatus)}>
            <SelectTrigger>
              <SelectValue placeholder={labels.externalSystemStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT_SENT">Gönderilmedi</SelectItem>
              <SelectItem value="QUEUED">Kuyrukta</SelectItem>
              <SelectItem value="SENT">Gönderildi</SelectItem>
              <SelectItem value="FAILED">Hata aldı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={providerConfigId || "__none__"} onValueChange={(value) => setProviderConfigId(value === "__none__" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder={`${labels.providerSelection}: ${labels.providerNone}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{labels.providerSelection}: {labels.providerNone}</SelectItem>
              {providerOptions.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder={labels.orderNumber} />
          <Input value={inventoryTransactionNumber} onChange={(event) => setInventoryTransactionNumber(event.target.value)} placeholder={labels.inventoryTransactionNumber} />
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={labels.note} rows={4} className="md:col-span-2" />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={() => void createDocument()} disabled={pending}>
            {pending ? labels.saving : labels.create}
          </Button>
        </div>
      </section>

      <section className="grid gap-3">
        {result.items.length === 0 ? (
          <article className="rounded-3xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 shadow-sm">{labels.noResults}</article>
        ) : result.items.map((item) => {
          const slaBadge = getSlaBadge(item, labels);

          return (
          <article key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item.documentType}</Badge>
                  <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">{item.status}</Badge>
                  <Badge className={getExternalStatusBadgeClass(item.externalSystemStatus)}>
                    {getExternalStatusLabel(item.externalSystemStatus, labels)}
                  </Badge>
                  {slaBadge ? (
                    <Badge className={slaBadge.className}>
                      {slaBadge.label}
                    </Badge>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-neutral-950">{item.documentNumber}</h3>
                <p className="mt-1 text-sm text-neutral-600">{item.counterpartyName}</p>
                <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-4">
                  <p>{labels.issueDate}: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.issueDate))}</p>
                  <p>{labels.providerSelection}: {item.providerDisplayName ?? labels.notSpecified}</p>
                  <p>{labels.orderNumber}: {item.orderNumber ?? labels.notSpecified}</p>
                  <p>{labels.inventoryTransactionNumber}: {item.inventoryTransactionNumber ?? labels.notSpecified}</p>
                  <p>{labels.externalReference}: {item.externalReference ?? labels.notSpecified}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => void openDetail(item.id)} variant="secondary">
                  {labels.viewLines}
                </Button>
                {(item.documentType === "E_INVOICE" || item.documentType === "E_DISPATCH") ? (
                  <Button type="button" onClick={() => void queueDispatch(item.id, item.providerConfigId)} disabled={dispatchingId === item.id} variant="secondary">
                    {dispatchingId === item.id ? labels.queueing : labels.queueDispatch}
                  </Button>
                ) : null}
                {(item.documentType === "E_INVOICE" || item.documentType === "E_DISPATCH") ? (
                  <Button type="button" onClick={() => void queueStatusSync(item.id, item.providerConfigId)} disabled={statusSyncingId === item.id} variant="secondary">
                    {statusSyncingId === item.id ? labels.statusSyncing : labels.queueStatusSync}
                  </Button>
                ) : null}
                <Button type="button" onClick={() => void updateStatus(item.id, "ISSUED")} variant="secondary">
                  Issued
                </Button>
                <Button type="button" onClick={() => void updateStatus(item.id, "CANCELLED")} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          </article>
        )})}
      </section>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/35">
          <div className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{detail.documentType}</p>
                <h3 className="mt-1 text-xl font-semibold text-neutral-950">{detail.documentNumber}</h3>
              </div>
              <Button type="button" onClick={() => setDetail(null)} variant="secondary" size="sm">
                Kapat
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
                <p>{labels.counterparty}: {detail.counterpartyName}</p>
                <p className="mt-2">{labels.providerSelection}: {detail.providerDisplayName ?? labels.notSpecified}</p>
                <p className="mt-2">{labels.orderNumber}: {detail.orderNumber ?? labels.notSpecified}</p>
                <p className="mt-2">{labels.inventoryTransactionNumber}: {detail.inventoryTransactionNumber ?? labels.notSpecified}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
                <p>{labels.documentStatus}: {detail.status}</p>
                <p className="mt-2">{labels.externalSystemStatus}: {getExternalStatusLabel(detail.externalSystemStatus, labels)}</p>
                <p className="mt-2">{labels.externalReference}: {detail.externalReference ?? labels.notSpecified}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {detail.lines.map((line) => (
                <article key={line.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  <p className="font-semibold text-neutral-950">{line.productName}</p>
                  <p className="mt-1">{line.productSku} • {line.quantity}</p>
                </article>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-neutral-950">{labels.dispatchHistory}</h4>
              {detail.dispatches.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">{labels.noDispatchHistory}</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {detail.dispatches.map((dispatch) => (
                    <article key={dispatch.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                      <p className="font-semibold text-neutral-950">{dispatch.channel} • {dispatch.status}</p>
                      <p className="mt-1">{labels.dispatchProvider}: {dispatch.providerKey}</p>
                      <p className="mt-1">{labels.externalReference}: {dispatch.externalReference ?? labels.notSpecified}</p>
                      <p className="mt-1">{labels.dispatchQueuedAt}: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dispatch.queuedAt))}</p>
                      <p className="mt-1">{labels.dispatchError}: {dispatch.errorMessage ?? labels.notSpecified}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
