import { prisma } from "@/lib/prisma";
import { redisCache } from "@/lib/redis";

export class SystemRepository {
  async checkDatabase() {
    await prisma.$queryRaw`SELECT 1`;
  }

  async checkRedis() {
    const key = `system:ready:${Date.now()}`;
    await redisCache.set(key, { ok: true }, 5);
    await redisCache.del(key);
  }
}
