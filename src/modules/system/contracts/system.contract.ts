export type ReadinessResult = {
  status: "ready" | "not-ready";
  database: "ok" | "degraded";
  redis: "ok" | "degraded";
  timestamp: string;
};
