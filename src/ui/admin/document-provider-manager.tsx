"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminDocumentProviderConfigItem } from "@/modules/documents/contracts/document.contract";

type Labels = {
  title: string;
  description: string;
  providerCode: string;
  providerDisplayName: string;
  providerEndpointUrl: string;
  providerSenderLabel: string;
  providerSenderVkn: string;
  providerUsername: string;
  providerSecret: string;
  providerWebhookSecret: string;
  providerCompanyName: string;
  providerSupportsStatusSync: string;
  providerIsActive: string;
  providerIsDefault: string;
  providerSave: string;
  saving: string;
  providerNone: string;
  notSpecified: string;
  operationFailed: string;
};

export function DocumentProviderManager({
  items,
  labels,
}: {
  items: AdminDocumentProviderConfigItem[];
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerCode, setProviderCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [senderLabel, setSenderLabel] = useState("");
  const [senderVkn, setSenderVkn] = useState("");
  const [username, setUsername] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [supportsStatusSync, setSupportsStatusSync] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(items.length === 0);

  async function saveProvider() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/documents/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerCode,
          channel: "EDOCS_MOCK",
          displayName,
          endpointUrl: endpointUrl || undefined,
          senderLabel: senderLabel || undefined,
          senderVkn: senderVkn || undefined,
          username: username || undefined,
          secretKey: secretKey || undefined,
          webhookSecret: webhookSecret || undefined,
          companyName: companyName || undefined,
          supportsStatusSync,
          isActive,
          isDefault,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? labels.operationFailed);
        return;
      }

      router.refresh();
      setProviderCode("");
      setDisplayName("");
      setEndpointUrl("");
      setSenderLabel("");
      setSenderVkn("");
      setUsername("");
      setSecretKey("");
      setWebhookSecret("");
      setCompanyName("");
      setSupportsStatusSync(true);
      setIsActive(true);
      setIsDefault(false);
    } catch {
      setError(labels.operationFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{labels.description}</p>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {items.length === 0 ? (
              <article className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">{labels.providerNone}</article>
            ) : items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">{item.displayName}</span>
                  {item.isDefault ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{labels.providerIsDefault}</span> : null}
                  {item.isActive ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{labels.providerIsActive}</span> : null}
                </div>
                <p className="mt-2">{labels.providerCode}: {item.providerCode}</p>
                <p className="mt-1">{labels.providerEndpointUrl}: {item.endpointUrl ?? labels.notSpecified}</p>
                <p className="mt-1">{labels.providerUsername}: {item.username ?? labels.notSpecified}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-3 rounded-2xl border border-neutral-200 p-4">
            <input value={providerCode} onChange={(event) => setProviderCode(event.target.value)} placeholder={labels.providerCode} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={labels.providerDisplayName} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={endpointUrl} onChange={(event) => setEndpointUrl(event.target.value)} placeholder={labels.providerEndpointUrl} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={senderLabel} onChange={(event) => setSenderLabel(event.target.value)} placeholder={labels.providerSenderLabel} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={senderVkn} onChange={(event) => setSenderVkn(event.target.value)} placeholder={labels.providerSenderVkn} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={labels.providerUsername} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder={labels.providerSecret} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={webhookSecret} onChange={(event) => setWebhookSecret(event.target.value)} placeholder={labels.providerWebhookSecret} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder={labels.providerCompanyName} className="h-11 rounded-2xl border border-neutral-300 px-3 text-sm" />
            <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={supportsStatusSync} onChange={(event) => setSupportsStatusSync(event.target.checked)} />{labels.providerSupportsStatusSync}</label>
            <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />{labels.providerIsActive}</label>
            <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />{labels.providerIsDefault}</label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="button" onClick={() => void saveProvider()} disabled={pending} className="h-11 rounded-2xl border border-neutral-300 bg-neutral-900 px-5 text-sm font-medium text-white">
              {pending ? labels.saving : labels.providerSave}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
