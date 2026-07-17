export type AdminFinanceReportMetric = {
  label: string;
  value: number;
  currency?: string;
  tone: "neutral" | "success" | "warning";
  href: string;
  hint: string;
};

export type AdminFinanceReportCard = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export type AdminFinanceReportsOverview = {
  metrics: AdminFinanceReportMetric[];
  cards: AdminFinanceReportCard[];
};

export type AdminFinanceReportDetailMetric = {
  label: string;
  value: number;
  currency?: string;
  tone: "neutral" | "success" | "warning";
  hint: string;
};

export type AdminFinanceReportDetailRow = {
  id: string;
  label: string;
  supportingText: string;
  primaryValue: number;
  primaryCurrency?: string;
  secondaryValue?: number;
  secondaryCurrency?: string;
  tone?: "neutral" | "success" | "warning";
  href?: string;
};

export type AdminFinanceReportTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export type AdminFinanceReportTableRow = {
  id: string;
  href?: string;
  cells: Record<string, string>;
};

export type AdminFinanceReportTable = {
  title: string;
  description: string;
  columns: AdminFinanceReportTableColumn[];
  rows: AdminFinanceReportTableRow[];
};

export type AdminFinanceReportDetail = {
  title: string;
  description: string;
  metrics: AdminFinanceReportDetailMetric[];
  rows: AdminFinanceReportDetailRow[];
  table?: AdminFinanceReportTable | null;
};
