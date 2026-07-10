"use client";

import { useMemo, useState } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type JobStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "DEAD_LETTER";
type Channel = "TRENDYOL" | "N11";
type JobType = "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC";
type DrawerMode = "create" | "process";

type Job = {
  id: string;
  idempotencyKey: string;
  channel: Channel;
  jobType: JobType;
  entityType: "PRODUCT";
  entityId: string;
  status: JobStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lastAttemptAt: string | null;
  processedAt: string | null;
  lastError: string | null;
  createdAt: string;
};

type DeadLetter = {
  id: string;
  jobId: string;
  channel: Channel;
  jobType: JobType;
  entityType: "PRODUCT";
  entityId: string;
  lastError: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
  resolved: boolean;
};

type Labels = {
  title: string;
  subtitle: string;
  createJob: string;
  processQueue: string;
  deadLetters: string;
  jobs: string;
  channel: string;
  jobType: string;
  status: string;
  entityId: string;
  actions: string;
  retry: string;
  operationFailed: string;
  loading: string;
  forceFail: string;
  openCreateDrawer: string;
  openProcessDrawer: string;
  drawerCreateTitle: string;
  drawerProcessTitle: string;
  drawerDescription: string;
  entityIds: string;
  entityIdsHint: string;
  stockSyncHint: string;
  genericSyncHint: string;
  maxAttempts: string;
  idempotencySuffix: string;
  integrationReference: string;
  trigger: string;
  triggerPreset: string;
  stockSyncReferenceHint: string;
  stockSyncTriggerHint: string;
  triggerManualDispatch: string;
  triggerManualAdjustment: string;
  triggerOrderCommit: string;
  triggerStockCount: string;
  triggerTransfer: string;
  triggerPurchaseReceipt: string;
  triggerPriceUpdate: string;
  triggerProductUpdate: string;
  queueLimit: string;
  apply: string;
  close: string;
  filterSearch: string;
  filterStatus: string;
  filterChannel: string;
  filterJobType: string;
  clearFilters: string;
  summaryPending: string;
  summaryProcessing: string;
  summarySuccess: string;
  summaryFailed: string;
  summaryDeadLetter: string;
  emptyJobs: string;
  nextAttemptAt: string;
  lastError: string;
  createdAt: string;
  all: string;
  validationEntityIds: string;
  validationQueueLimit: string;
};

const JOB_TYPE_TRIGGER_PRESETS: Record<JobType, string[]> = {
  STOCK_SYNC: [
    "MANUAL_ADJUSTMENT",
    "ORDER_COMMIT",
    "STOCK_COUNT",
    "TRANSFER",
    "PURCHASE_RECEIPT",
    "MANUAL_DISPATCH",
  ],
  PRODUCT_SYNC: [
    "PRODUCT_UPDATE",
    "MANUAL_DISPATCH",
  ],
  PRICE_SYNC: [
    "PRICE_UPDATE",
    "MANUAL_DISPATCH",
  ],
};

function triggerLabel(trigger: string, labels: Labels) {
  if (trigger === "MANUAL_ADJUSTMENT") {
    return labels.triggerManualAdjustment;
  }

  if (trigger === "ORDER_COMMIT") {
    return labels.triggerOrderCommit;
  }

  if (trigger === "STOCK_COUNT") {
    return labels.triggerStockCount;
  }

  if (trigger === "TRANSFER") {
    return labels.triggerTransfer;
  }

  if (trigger === "PURCHASE_RECEIPT") {
    return labels.triggerPurchaseReceipt;
  }

  if (trigger === "PRICE_UPDATE") {
    return labels.triggerPriceUpdate;
  }

  if (trigger === "PRODUCT_UPDATE") {
    return labels.triggerProductUpdate;
  }

  return labels.triggerManualDispatch;
}

function defaultTriggerForJobType(jobType: JobType) {
  return JOB_TYPE_TRIGGER_PRESETS[jobType][0] ?? "MANUAL_DISPATCH";
}

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(status: JobStatus) {
  if (status === "SUCCESS") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "PROCESSING") {
    return "bg-sky-100 text-sky-700";
  }

  if (status === "FAILED") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "DEAD_LETTER") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-neutral-100 text-neutral-700";
}

export function IntegrationManager({
  locale,
  labels,
  canManage,
  initialJobs,
  initialDeadLetters,
}: {
  locale: string;
  labels: Labels;
  canManage: boolean;
  initialJobs: Job[];
  initialDeadLetters: DeadLetter[];
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [deadLetters, setDeadLetters] = useState<DeadLetter[]>(initialDeadLetters);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [drawerFullscreen, setDrawerFullscreen] = useState(false);
  const [channel, setChannel] = useState<Channel>("TRENDYOL");
  const [jobType, setJobType] = useState<JobType>("STOCK_SYNC");
  const [entityIds, setEntityIds] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [idempotencySuffix, setIdempotencySuffix] = useState("");
  const [reference, setReference] = useState("");
  const [trigger, setTrigger] = useState("MANUAL_DISPATCH");
  const [queueLimit, setQueueLimit] = useState("20");
  const [forceFail, setForceFail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [channelFilter, setChannelFilter] = useState<"all" | Channel>("all");
  const [jobTypeFilter, setJobTypeFilter] = useState<"all" | JobType>("all");

  const summary = useMemo(() => ({
    pending: jobs.filter((item) => item.status === "PENDING").length,
    processing: jobs.filter((item) => item.status === "PROCESSING").length,
    success: jobs.filter((item) => item.status === "SUCCESS").length,
    failed: jobs.filter((item) => item.status === "FAILED").length,
    deadLetter: jobs.filter((item) => item.status === "DEAD_LETTER").length,
  }), [jobs]);

  const isStockSync = jobType === "STOCK_SYNC";
  const triggerOptions = JOB_TYPE_TRIGGER_PRESETS[jobType];

  const filteredJobs = useMemo(() => [...jobs]
    .filter((item) => (
      (search.trim().length === 0
        || item.entityId.toLowerCase().includes(search.trim().toLowerCase())
        || item.idempotencyKey.toLowerCase().includes(search.trim().toLowerCase()))
      && (statusFilter === "all" || item.status === statusFilter)
      && (channelFilter === "all" || item.channel === channelFilter)
      && (jobTypeFilter === "all" || item.jobType === jobTypeFilter)
    ))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt)), [channelFilter, jobTypeFilter, jobs, search, statusFilter]);

  async function refresh() {
    const [jobsResponse, deadLettersResponse] = await Promise.all([
      fetch("/api/admin/integrations/jobs?page=1&pageSize=50"),
      fetch("/api/admin/integrations/dead-letters"),
    ]);

    if (!jobsResponse.ok || !deadLettersResponse.ok) {
      throw new Error(labels.operationFailed);
    }

    const jobsPayload = await jobsResponse.json() as { items: Job[] };
    const deadPayload = await deadLettersResponse.json() as { items: DeadLetter[] };
    setJobs(jobsPayload.items);
    setDeadLetters(deadPayload.items);
  }

  function openDrawer(mode: DrawerMode) {
    setDrawerMode(mode);
    setDrawerFullscreen(false);
    setError(null);

    if (mode === "create") {
      setChannel("TRENDYOL");
      setJobType("STOCK_SYNC");
      setEntityIds("");
      setMaxAttempts("3");
      setIdempotencySuffix("");
      setReference("");
      setTrigger(defaultTriggerForJobType("STOCK_SYNC"));
      setForceFail(false);
    } else {
      setQueueLimit("20");
    }
  }

  function closeDrawer() {
    if (busy) {
      return;
    }

    setDrawerMode(null);
    setDrawerFullscreen(false);
  }

  async function createJob() {
    const normalizedEntityIds = entityIds
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (normalizedEntityIds.length === 0) {
      setError(labels.validationEntityIds);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const payload = {
        channel,
        jobType,
        entityType: "PRODUCT" as const,
        entityIds: normalizedEntityIds,
        maxAttempts: Number(maxAttempts || "3"),
        idempotencySuffix: idempotencySuffix.trim() || undefined,
        payload: {
          forceFail,
          ...(reference.trim() ? { reference: reference.trim() } : {}),
          ...(trigger.trim() ? { trigger: trigger.trim() } : {}),
        },
      };

      const response = await fetch("/api/admin/integrations/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responsePayload = await response.json().catch(() => null) as { message?: string } | null;
        setError(responsePayload?.message ?? labels.operationFailed);
        return;
      }

      await refresh();
      closeDrawer();
    } catch {
      setError(labels.operationFailed);
    } finally {
      setBusy(false);
    }
  }

  async function processQueue() {
    const limit = Number(queueLimit || "20");
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      setError(labels.validationQueueLimit);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/integrations/worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit }),
      });

      if (!response.ok) {
        const responsePayload = await response.json().catch(() => null) as { message?: string } | null;
        setError(responsePayload?.message ?? labels.operationFailed);
        return;
      }

      await refresh();
      closeDrawer();
    } catch {
      setError(labels.operationFailed);
    } finally {
      setBusy(false);
    }
  }

  async function retryDeadLetter(jobId: string) {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/integrations/dead-letters/${jobId}/retry`, {
        method: "POST",
      });

      if (!response.ok) {
        const responsePayload = await response.json().catch(() => null) as { message?: string } | null;
        setError(responsePayload?.message ?? labels.operationFailed);
        return;
      }

      await refresh();
    } catch {
      setError(labels.operationFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white shadow-sm">
      <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.15),_transparent_55%),radial-gradient(circle_at_left,_rgba(245,158,11,0.10),_transparent_45%)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{labels.title}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{labels.title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">{labels.subtitle}</p>
      </div>

      {error ? (
        <p className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="grid gap-4 border-b border-neutral-200 p-5 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.summaryPending}</p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">{summary.pending}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.summaryProcessing}</p>
          <p className="mt-2 text-lg font-semibold text-sky-700">{summary.processing}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.summarySuccess}</p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">{summary.success}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.summaryFailed}</p>
          <p className="mt-2 text-lg font-semibold text-amber-700">{summary.failed}</p>
        </article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.summaryDeadLetter}</p>
          <p className="mt-2 text-lg font-semibold text-rose-700">{summary.deadLetter}</p>
        </article>
      </div>

      <div className="border-b border-neutral-200 bg-white/90 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={labels.filterSearch}
              className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
            />
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value as "all" | Channel)}
              className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
            >
              <option value="all">{labels.filterChannel}: {labels.all}</option>
              <option value="TRENDYOL">TRENDYOL</option>
              <option value="N11">N11</option>
            </select>
            <select
              value={jobTypeFilter}
              onChange={(event) => setJobTypeFilter(event.target.value as "all" | JobType)}
              className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
            >
              <option value="all">{labels.filterJobType}: {labels.all}</option>
              <option value="PRODUCT_SYNC">PRODUCT_SYNC</option>
              <option value="PRICE_SYNC">PRICE_SYNC</option>
              <option value="STOCK_SYNC">STOCK_SYNC</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | JobStatus)}
              className="h-11 rounded-xl border border-neutral-300 px-3 text-sm outline-none transition focus:border-neutral-500"
            >
              <option value="all">{labels.filterStatus}: {labels.all}</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="DEAD_LETTER">DEAD_LETTER</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setChannelFilter("all");
              setJobTypeFilter("all");
            }}>
              {labels.clearFilters}
            </Button>
            <Button type="button" onClick={() => openDrawer("create")}>
              {labels.openCreateDrawer}
            </Button>
            {canManage ? (
              <Button type="button" variant="secondary" onClick={() => openDrawer("process")}>
                {labels.openProcessDrawer}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-b border-neutral-200 bg-white/90 p-5">
        <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{labels.jobs}</h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
          <div className="hidden grid-cols-[110px_140px_120px_1fr_140px_160px] gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
            <span>{labels.channel}</span>
            <span>{labels.jobType}</span>
            <span>{labels.status}</span>
            <span>{labels.entityId}</span>
            <span>{labels.nextAttemptAt}</span>
            <span>{labels.createdAt}</span>
          </div>

          {filteredJobs.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">{labels.emptyJobs}</p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {filteredJobs.map((item) => (
                <article key={item.id} className="grid gap-3 p-4 lg:grid-cols-[110px_140px_120px_1fr_140px_160px] lg:items-center">
                  <p className="font-medium text-neutral-900">{item.channel}</p>
                  <p className="text-neutral-700">{item.jobType}</p>
                  <p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </p>
                  <div className="min-w-0">
                    <p className="break-all text-neutral-700">{item.entityId}</p>
                    <p className="mt-1 truncate text-xs text-neutral-500">{item.idempotencyKey}</p>
                    {item.lastError ? (
                      <p className="mt-1 text-xs text-red-600">{labels.lastError}: {item.lastError}</p>
                    ) : null}
                  </div>
                  <p className="text-sm text-neutral-500">{formatDate(item.nextAttemptAt, locale)}</p>
                  <p className="text-sm text-neutral-500">{formatDate(item.createdAt, locale)}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/90 p-5">
        <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{labels.deadLetters}</h3>
        <div className="mt-3 divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
          {deadLetters.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">{labels.emptyJobs}</p>
          ) : deadLetters.map((item) => (
            <article key={item.id} className="grid gap-3 p-4 lg:grid-cols-[110px_140px_1fr_auto] lg:items-center">
              <p className="text-sm font-medium text-neutral-900">{item.channel}</p>
              <p className="text-sm text-neutral-700">{item.jobType}</p>
              <div>
                <p className="text-sm text-neutral-700">{item.entityId}</p>
                <p className="mt-1 text-xs text-red-600">{item.lastError}</p>
              </div>
              {canManage ? (
                <Button type="button" variant="secondary" onClick={() => retryDeadLetter(item.jobId)} disabled={busy}>
                  {labels.retry}
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      {drawerMode ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-black/30" onClick={closeDrawer} aria-label={labels.close} />
          <aside className={`absolute right-0 top-0 flex h-full w-full flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl ${drawerFullscreen ? "max-w-none" : "max-w-2xl"}`}>
            <div className="flex items-start justify-between border-b border-neutral-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{labels.title}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">
                  {drawerMode === "create" ? labels.drawerCreateTitle : labels.drawerProcessTitle}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{labels.drawerDescription}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDrawerFullscreen((prev) => !prev)}
                  disabled={busy}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
                  aria-label={drawerFullscreen ? "Collapse" : "Fullscreen"}
                >
                  {drawerFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={busy}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
                  aria-label={labels.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5">
              {drawerMode === "create" ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.channel}</label>
                      <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)} className="h-11 rounded-xl border border-neutral-300 px-3 text-sm">
                        <option value="TRENDYOL">TRENDYOL</option>
                        <option value="N11">N11</option>
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.jobType}</label>
                      <select
                        value={jobType}
                        onChange={(event) => {
                          const nextJobType = event.target.value as JobType;
                          setJobType(nextJobType);
                          setTrigger(defaultTriggerForJobType(nextJobType));
                        }}
                        className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                      >
                        <option value="PRODUCT_SYNC">PRODUCT_SYNC</option>
                        <option value="PRICE_SYNC">PRICE_SYNC</option>
                        <option value="STOCK_SYNC">STOCK_SYNC</option>
                      </select>
                    </div>
                  </div>

                  <div className={`rounded-2xl border px-4 py-3 text-sm ${
                    isStockSync
                      ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700"
                  }`}>
                    {isStockSync ? labels.stockSyncHint : labels.genericSyncHint}
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-neutral-600">{labels.entityIds}</label>
                    <textarea
                      value={entityIds}
                      onChange={(event) => setEntityIds(event.target.value)}
                      rows={6}
                      placeholder={labels.entityIdsHint}
                      className="rounded-xl border border-neutral-300 px-3 py-3 text-sm"
                    />
                    <p className="text-xs text-neutral-500">{labels.entityIdsHint}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-1">
                      <label className="text-xs font-medium text-neutral-600">{labels.maxAttempts}</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={maxAttempts}
                        onChange={(event) => setMaxAttempts(event.target.value)}
                        className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                      />
                    </div>
                    {isStockSync ? (
                      <div className="grid gap-1">
                        <label className="text-xs font-medium text-neutral-600">{labels.idempotencySuffix}</label>
                        <input
                          value={idempotencySuffix}
                          onChange={(event) => setIdempotencySuffix(event.target.value)}
                          className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                        />
                      </div>
                    ) : null}
                  </div>

                  {isStockSync ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-1">
                        <label className="text-xs font-medium text-neutral-600">{labels.integrationReference}</label>
                        <input
                          value={reference}
                          onChange={(event) => setReference(event.target.value)}
                          className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                        />
                        <p className="text-xs text-neutral-500">{labels.stockSyncReferenceHint}</p>
                      </div>
                      <div className="grid gap-1">
                        <label className="text-xs font-medium text-neutral-600">{labels.triggerPreset}</label>
                        <select
                          value={trigger}
                          onChange={(event) => setTrigger(event.target.value)}
                          className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                        >
                          {triggerOptions.map((option) => (
                            <option key={option} value={option}>
                              {triggerLabel(option, labels)}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-neutral-500">{labels.stockSyncTriggerHint}</p>
                      </div>
                    </div>
                  ) : null}

                  <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <input type="checkbox" checked={forceFail} onChange={(event) => setForceFail(event.target.checked)} />
                    {labels.forceFail}
                  </label>
                </>
              ) : (
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-neutral-600">{labels.queueLimit}</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={queueLimit}
                    onChange={(event) => setQueueLimit(event.target.value)}
                    className="h-11 rounded-xl border border-neutral-300 px-3 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-5 py-4">
              <Button type="button" variant="secondary" onClick={closeDrawer} disabled={busy}>
                {labels.close}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  void (drawerMode === "create" ? createJob() : processQueue());
                }}
                disabled={busy}
              >
                {busy ? labels.loading : labels.apply}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
