export type DependencyHealth = {
  status: "ok" | "degraded";
  durationMs: number;
  errorCode?: string;
};

export type ReadinessResult = {
  status: "ready" | "not-ready";
  database: DependencyHealth;
  redis: DependencyHealth;
  timestamp: string;
};
