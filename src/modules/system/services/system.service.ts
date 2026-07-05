import type { ReadinessResult } from "@/modules/system/contracts/system.contract";
import { SystemRepository } from "@/modules/system/repositories/system.repository";

export class SystemService {
  constructor(private readonly repository: SystemRepository) {}

  async checkReadiness(): Promise<ReadinessResult> {
    try {
      await this.repository.checkDatabase();
      await this.repository.checkRedis();

      return {
        status: "ready",
        database: "ok",
        redis: "ok",
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "not-ready",
        database: "degraded",
        redis: "degraded",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const systemService = new SystemService(new SystemRepository());
