"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCustomerAccountItem } from "@/modules/customers/contracts/customer-account.contract";

type Labels = {
  title: string;
  description: string;
  createTitle: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  taxNumber: string;
  address: string;
  note: string;
  create: string;
  saving: string;
  empty: string;
};

type Props = {
  items: AdminCustomerAccountItem[];
  labels: Labels;
};

export function CustomerAccountManager({ items, labels }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    email: "",
    phone: "",
    taxNumber: "",
    address: "",
    note: "",
  });

  async function createItem() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/customer-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? "Müşteri kartı oluşturulamadı.");
        return;
      }

      setForm({
        slug: "",
        name: "",
        email: "",
        phone: "",
        taxNumber: "",
        address: "",
        note: "",
      });
      router.refresh();
    } catch {
      setError("Müşteri kartı oluşturulamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
          <p className="text-sm text-neutral-600">{labels.description}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">{labels.createTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder={labels.slug} />
          <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder={labels.name} />
          <Input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder={labels.email} />
          <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder={labels.phone} />
          <Input value={form.taxNumber} onChange={(event) => setForm((prev) => ({ ...prev, taxNumber: event.target.value }))} placeholder={labels.taxNumber} />
          <Input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} placeholder={labels.address} />
          <Textarea value={form.note} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} placeholder={labels.note} rows={4} className="min-h-[110px] md:col-span-2" />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={() => void createItem()} disabled={pending}>
            {pending ? labels.saving : labels.create}
          </Button>
        </div>
      </section>

      <section className="grid gap-3">
        {items.length === 0 ? (
          <article className="rounded-3xl border border-neutral-200 bg-white p-5 text-sm text-neutral-500 shadow-sm">{labels.empty}</article>
        ) : items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">{item.name}</h2>
            <div className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2 xl:grid-cols-4">
              <p>{labels.slug}: {item.slug}</p>
              <p>{labels.email}: {item.email ?? "-"}</p>
              <p>{labels.phone}: {item.phone ?? "-"}</p>
              <p>{labels.taxNumber}: {item.taxNumber ?? "-"}</p>
            </div>
            {item.address ? <p className="mt-3 text-sm text-neutral-600">{item.address}</p> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
