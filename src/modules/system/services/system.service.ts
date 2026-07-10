import type { ReadinessResult } from "@/modules/system/contracts/system.contract";
import { SystemRepository } from "@/modules/system/repositories/system.repository";

async function measureDependency(task: () => Promise<void>) {
  const startedAt = Date.now();

  try {
    await task();

    return {
      status: "ok" as const,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      status: "degraded" as const,
      durationMs: Date.now() - startedAt,
      errorCode: error instanceof Error ? error.message : String(error),
    };
  }
}

export class SystemService {
  constructor(private readonly repository: SystemRepository) {}

  async checkReadiness(): Promise<ReadinessResult> {
    const [database, redis] = await Promise.all([
      measureDependency(() => this.repository.checkDatabase()),
      measureDependency(() => this.repository.checkRedis()),
    ]);

    if (database.status === "ok" && redis.status === "ok") {
      return {
        status: "ready",
        database,
        redis,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: "not-ready",
      database,
      redis,
      timestamp: new Date().toISOString(),
    };
  }
}

export const systemService = new SystemService(new SystemRepository());
