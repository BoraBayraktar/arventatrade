import { z } from "zod";

import { redisCache } from "@/lib/redis";
import type {
  AdminIntegrationJobItem,
  AdminIntegrationJobListResult,
  AdminIntegrationListQuery,
  DispatchIntegrationJobsInput,
  DispatchIntegrationJobsResult,
  IntegrationDeadLetterItem,
  IntegrationDeadLetterListResult,
  ProcessIntegrationQueueInput,
  ProcessIntegrationQueueResult,
  RetryDeadLetterInput,
  StockSyncDashboardResult,
} from "@/modules/integration/contracts/integration.contract";
import type { ChannelConnector } from "@/modules/integration/connectors/channel.connector";
import { N11Connector } from "@/modules/integration/connectors/n11.connector";
import { TrendyolConnector } from "@/modules/integration/connectors/trendyol.connector";
import { IntegrationRepository } from "@/modules/integration/repositories/integration.repository";

const listQuerySchema = z.object({
  channel: z.enum(["TRENDYOL", "N11"]).optional(),
  jobType: z.enum(["PRODUCT_SYNC", "PRICE_SYNC", "STOCK_SYNC"]).optional(),
  status: z.enum(["PENDING", "PROCESSING", "SUCCESS", "FAILED", "DEAD_LETTER"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const dispatchSchema = z.object({
  channel: z.enum(["TRENDYOL", "N11"]),
  jobType: z.enum(["PRODUCT_SYNC", "PRICE_SYNC", "STOCK_SYNC"]),
  entityType: z.enum(["PRODUCT"]),
  entityIds: z.array(z.string().trim().min(1)).min(1).max(100),
  maxAttempts: z.coerce.number().int().min(1).max(10).optional(),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  idempotencySuffix: z.string().trim().min(1).max(120).optional(),
});

const processSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const retrySchema = z.object({
  jobId: z.string().trim().min(1),
  resolvedByUserId: z.string().trim().min(1),
});

const connectors: Record<"TRENDYOL" | "N11", ChannelConnector> = {
  TRENDYOL: new TrendyolConnector(),
  N11: new N11Connector(),
};

async function invalidateIntegrationCache() {
  await redisCache.delByPrefix("inventory:integrations:");
}

function mapJob(item: {
  id: string;
  idempotencyKey: string;
  channel: "TRENDYOL" | "N11";
  jobType: "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC";
  entityType: "PRODUCT";
  entityId: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "DEAD_LETTER";
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  lastAttemptAt: Date | null;
  processedAt: Date | null;
  lastError: string | null;
  createdAt: Date;
}): AdminIntegrationJobItem {
  return {
    id: item.id,
    idempotencyKey: item.idempotencyKey,
    channel: item.channel,
    jobType: item.jobType,
    entityType: item.entityType,
    entityId: item.entityId,
    status: item.status,
    attemptCount: item.attemptCount,
    maxAttempts: item.maxAttempts,
    nextAttemptAt: item.nextAttemptAt.toISOString(),
    lastAttemptAt: item.lastAttemptAt ? item.lastAttemptAt.toISOString() : null,
    processedAt: item.processedAt ? item.processedAt.toISOString() : null,
    lastError: item.lastError,
    createdAt: item.createdAt.toISOString(),
  };
}

function mapDeadLetter(item: {
  id: string;
  jobId: string;
  channel: "TRENDYOL" | "N11";
  jobType: "PRODUCT_SYNC" | "PRICE_SYNC" | "STOCK_SYNC";
  entityType: "PRODUCT";
  entityId: string;
  lastError: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: Date;
  resolved: boolean;
}): IntegrationDeadLetterItem {
  return {
    id: item.id,
    jobId: item.jobId,
    channel: item.channel,
    jobType: item.jobType,
    entityType: item.entityType,
    entityId: item.entityId,
    lastError: item.lastError,
    attemptCount: item.attemptCount,
    maxAttempts: item.maxAttempts,
    createdAt: item.createdAt.toISOString(),
    resolved: item.resolved,
  };
}

export class IntegrationService {
  constructor(private readonly repository: IntegrationRepository) {}

  async listJobs(query: AdminIntegrationListQuery): Promise<AdminIntegrationJobListResult> {
    const parsed = listQuerySchema.parse(query);
    const [items, total] = await Promise.all([
      this.repository.listJobs(parsed),
      this.repository.countJobs(parsed),
    ]);

    return {
      items: items.map(mapJob),
      page: parsed.page,
      pageSize: parsed.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
    };
  }

  async dispatchJobs(input: DispatchIntegrationJobsInput): Promise<DispatchIntegrationJobsResult> {
    const parsed = dispatchSchema.parse(input);
    const jobs = await this.repository.dispatchJobs(parsed);

    const accepted = jobs.filter((item) => !item.deduplicated).length;
    const deduplicated = jobs.filter((item) => item.deduplicated).length;

    const result = {
      accepted,
      deduplicated,
      jobs: jobs.map((item) => mapJob(item.job!)),
    };
    await invalidateIntegrationCache();
    return result;
  }

  async processQueue(input: ProcessIntegrationQueueInput): Promise<ProcessIntegrationQueueResult> {
    const parsed = processSchema.parse(input);
    const reserved = await this.repository.reserveJobs(parsed.limit);

    let success = 0;
    let failed = 0;
    let deadLetter = 0;

    for (const job of reserved) {
      try {
        const connector = connectors[job.channel];
        await connector.dispatch({
          id: job.id,
          channel: job.channel,
          jobType: job.jobType,
          entityType: job.entityType,
          entityId: job.entityId,
          payload: (job.payload as Record<string, unknown> | null) ?? null,
        });

        await this.repository.markJobSuccess(job.id);
        success += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN_CONNECTOR_ERROR";
        const next = await this.repository.markJobFailure({
          id: job.id,
          lastError: message,
          attemptCount: job.attemptCount,
          maxAttempts: job.maxAttempts,
          retryDelayMinutes: 1,
        });

        if (next.status === "DEAD_LETTER") {
          deadLetter += 1;
        } else {
          failed += 1;
        }
      }
    }

    const result = {
      processed: reserved.length,
      success,
      failed,
      deadLetter,
    };
    await invalidateIntegrationCache();
    return result;
  }

  async listDeadLetters(): Promise<IntegrationDeadLetterListResult> {
    const items = await this.repository.listDeadLetters();
    return {
      items: items.map(mapDeadLetter),
    };
  }

  async retryDeadLetter(input: RetryDeadLetterInput) {
    const parsed = retrySchema.parse(input);
    const retried = await this.repository.retryDeadLetter(parsed);

    if (!retried) {
      throw new Error("Dead letter not found");
    }

    const result = mapJob(retried);
    await invalidateIntegrationCache();
    return result;
  }

  async getStockSyncDashboard(): Promise<StockSyncDashboardResult> {
    const [recentJobs, counts] = await Promise.all([
      this.repository.listRecentStockSyncJobs(12),
      this.repository.countStockSyncJobsByStatus(),
    ]);

    return {
      pendingCount: counts.PENDING ?? 0,
      processingCount: counts.PROCESSING ?? 0,
      failedCount: counts.FAILED ?? 0,
      deadLetterCount: counts.DEAD_LETTER ?? 0,
      successCount: counts.SUCCESS ?? 0,
      recentJobs: recentJobs.map(mapJob),
    };
  }
}

export const integrationService = new IntegrationService(new IntegrationRepository());
