"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type JobStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "DEAD_LETTER";

type Job = {
  id: string;
  idempotencyKey: string;
  channel: "TRENDYOL" | "N11";
  jobType: "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC";
  entityType: "PRODUCT";
  entityId: string;
  status: JobStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lastError: string | null;
  createdAt: string;
};

type DeadLetter = {
  id: string;
  jobId: string;
  channel: "TRENDYOL" | "N11";
  jobType: "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC";
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
};

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
  const [channel, setChannel] = useState<"TRENDYOL" | "N11">("TRENDYOL");
  const [jobType, setJobType] = useState<"PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC">("PRODUCT_SYNC");
  const [entityId, setEntityId] = useState("");
  const [forceFail, setForceFail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedJobs = useMemo(() => [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [jobs]);

  async function refresh() {
    const [jobsResponse, deadLettersResponse] = await Promise.all([
      fetch("/api/admin/integrations/jobs?page=1&pageSize=20"),
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

  async function createJob() {
    if (!entityId.trim()) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/integrations/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel,
          jobType,
          entityType: "PRODUCT",
          entityIds: [entityId.trim()],
          payload: { forceFail },
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        setError(payload?.message ?? labels.operationFailed);
        return;
      }

      setEntityId("");
      setForceFail(false);
      await refresh();
    } catch {
      setError(labels.operationFailed);
    } finally {
      setBusy(false);
    }
  }

  async function processQueue() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/integrations/worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit: 20 }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        setError(payload?.message ?? labels.operationFailed);
        return;
      }

      await refresh();
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
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        setError(payload?.message ?? labels.operationFailed);
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
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">{labels.title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{labels.subtitle}</p>

      {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="mt-5 grid gap-3 rounded-xl border border-neutral-200 p-4 md:grid-cols-6">
        <select value={channel} onChange={(event) => setChannel(event.target.value as "TRENDYOL" | "N11")} className="h-10 rounded-md border border-neutral-300 px-3 text-sm">
          <option value="TRENDYOL">TRENDYOL</option>
          <option value="N11">N11</option>
        </select>
        <select value={jobType} onChange={(event) => setJobType(event.target.value as "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC")} className="h-10 rounded-md border border-neutral-300 px-3 text-sm md:col-span-2">
          <option value="PRODUCT_SYNC">PRODUCT_SYNC</option>
          <option value="PRICE_SYNC">PRICE_SYNC</option>
          <option value="STOCK_SYNC">STOCK_SYNC</option>
        </select>
        <input value={entityId} onChange={(event) => setEntityId(event.target.value)} placeholder={labels.entityId} className="h-10 rounded-md border border-neutral-300 px-3 text-sm md:col-span-2" />
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={forceFail} onChange={(event) => setForceFail(event.target.checked)} />
          {labels.forceFail}
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <Button type="button" onClick={createJob} disabled={busy}>{busy ? labels.loading : labels.createJob}</Button>
        {canManage ? (
          <Button type="button" variant="secondary" onClick={processQueue} disabled={busy}>{busy ? labels.loading : labels.processQueue}</Button>
        ) : null}
      </div>

      <h3 className="mt-8 text-lg font-semibold tracking-tight text-neutral-950">{labels.jobs}</h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
        <div className="hidden grid-cols-[120px_140px_120px_1fr_100px_180px] gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:grid">
          <span>{labels.channel}</span>
          <span>{labels.jobType}</span>
          <span>{labels.status}</span>
          <span>{labels.entityId}</span>
          <span>Try</span>
          <span>Date</span>
        </div>

        <div className="divide-y divide-neutral-200">
          {sortedJobs.map((item) => (
            <article key={item.id} className="grid gap-2 p-4 text-sm lg:grid-cols-[120px_140px_120px_1fr_100px_180px] lg:items-center">
              <p className="font-medium text-neutral-900">{item.channel}</p>
              <p className="text-neutral-700">{item.jobType}</p>
              <p className="text-neutral-700">{item.status}</p>
              <p className="break-all text-neutral-700">{item.entityId}</p>
              <p className="text-neutral-700">{item.attemptCount}/{item.maxAttempts}</p>
              <p className="text-neutral-500">{formatDate(item.createdAt, locale)}</p>
            </article>
          ))}
        </div>
      </div>

      <h3 className="mt-8 text-lg font-semibold tracking-tight text-neutral-950">{labels.deadLetters}</h3>
      <div className="mt-3 divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
        {deadLetters.length === 0 ? (
          <p className="p-4 text-sm text-neutral-500">0</p>
        ) : deadLetters.map((item) => (
          <article key={item.id} className="grid gap-3 p-4 lg:grid-cols-[120px_140px_1fr_auto] lg:items-center">
            <p className="text-sm font-medium text-neutral-900">{item.channel}</p>
            <p className="text-sm text-neutral-700">{item.jobType}</p>
            <div>
              <p className="text-sm text-neutral-700">{item.entityId}</p>
              <p className="mt-1 text-xs text-red-600">{item.lastError}</p>
            </div>
            {canManage ? (
              <Button type="button" variant="secondary" onClick={() => retryDeadLetter(item.jobId)} disabled={busy}>{labels.retry}</Button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
