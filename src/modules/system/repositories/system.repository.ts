import { prisma } from "@/lib/prisma";
import { redisCache } from "@/lib/redis";

const READINESS_TIMEOUT_MS = 2500;

async function withTimeout<T>(task: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("READINESS_TIMEOUT")), timeoutMs);

    task.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export class SystemRepository {
  async checkDatabase() {
    await withTimeout(prisma.$queryRaw`SELECT 1`, READINESS_TIMEOUT_MS);
  }

  async checkRedis() {
    const key = `system:ready:${Date.now()}`;
    await withTimeout(
      (async () => {
        await redisCache.set(key, { ok: true }, 5);
        await redisCache.del(key);
      })(),
      READINESS_TIMEOUT_MS,
    );
  }
}
