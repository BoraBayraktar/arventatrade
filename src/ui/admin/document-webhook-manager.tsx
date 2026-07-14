import type { AdminDocumentProviderConfigItem } from "@/modules/documents/contracts/document.contract";

type Labels = {
  title: string;
  description: string;
  endpoint: string;
  providerCode: string;
  webhookHint: string;
  providerNone: string;
  notSpecified: string;
};

export function DocumentWebhookManager({
  locale,
  items,
  labels,
}: {
  locale: string;
  items: AdminDocumentProviderConfigItem[];
  labels: Labels;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-950">{labels.title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{labels.description}</p>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-neutral-600">{labels.webhookHint}</p>
        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <article className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
              {labels.providerNone}
            </article>
          ) : items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              <p className="font-semibold text-neutral-950">{item.displayName}</p>
              <p className="mt-2">{labels.providerCode}: {item.providerCode}</p>
              <p className="mt-1 break-all">{labels.endpoint}: {`/${locale}/api/integrations/documents/webhook/${item.providerCode}`}</p>
              <p className="mt-1">{item.endpointUrl ?? labels.notSpecified}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
