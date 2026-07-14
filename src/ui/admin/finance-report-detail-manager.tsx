import Link from "next/link";

import type { AdminFinanceReportDetail } from "@/modules/finance/contracts/reports.contract";

type Labels = {
  primaryValue: string;
  secondaryValue: string;
};

type Props = {
  report: AdminFinanceReportDetail;
  labels: Labels;
};

function formatMetricValue(value: number, currency?: string) {
  if (!currency) {
    return value.toLocaleString("tr-TR");
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function resolveToneClass(tone: "neutral" | "success" | "warning") {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-neutral-200 bg-white text-neutral-950";
}

export function FinanceReportDetailManager({ report, labels }: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950">{report.title}</h1>
          <p className="text-sm text-neutral-600">{report.description}</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {report.metrics.map((metric) => (
          <article key={metric.label} className={`rounded-3xl border p-5 shadow-sm ${resolveToneClass(metric.tone)}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold">{formatMetricValue(metric.value, metric.currency)}</p>
            <p className="mt-2 text-sm opacity-80">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          {report.rows.map((row) => {
            const content = (
              <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-neutral-950">{row.label}</h2>
                  <p className="text-sm text-neutral-600">{row.supportingText}</p>
                </div>
                <div className="flex flex-col gap-2 text-sm md:items-end">
                  <span className="font-medium text-neutral-950">
                    {labels.primaryValue}: {formatMetricValue(row.primaryValue, row.primaryCurrency)}
                  </span>
                  {row.secondaryValue !== undefined ? (
                    <span className="text-neutral-600">
                      {labels.secondaryValue}: {formatMetricValue(row.secondaryValue, row.secondaryCurrency)}
                    </span>
                  ) : null}
                </div>
              </div>
            );

            if (!row.href) {
              return <div key={row.id}>{content}</div>;
            }

            return (
              <Link key={row.id} href={row.href} className="block transition hover:-translate-y-0.5">
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
