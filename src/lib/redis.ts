import { createClient, type RedisClientType } from "redis";

import { logError } from "@/lib/observability";

type CacheValue = string;

class RedisCache {
  private client: RedisClientType | null = null;
  private initializing = false;

  private async ensureClient() {
    if (!process.env.REDIS_URL) {
      return null;
    }

    if (this.client) {
      return this.client;
    }

    if (this.initializing) {
      return null;
    }

    this.initializing = true;

    try {
      const client = createClient({ url: process.env.REDIS_URL });
      client.on("error", (error) => {
        logError("Redis connection error", { scope: "redis", error: String(error) });
      });
      await client.connect();
      this.client = client;
      return this.client;
    } catch (error) {
      logError("Redis initialization failed", { scope: "redis", error: String(error) });
      return null;
    } finally {
      this.initializing = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.ensureClient();
    if (!client) {
      return null;
    }

    const data = await client.get(key);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number) {
    const client = await this.ensureClient();
    if (!client) {
      return;
    }

    const payload: CacheValue = JSON.stringify(value);
    await client.set(key, payload, { EX: ttlSeconds });
  }

  async del(key: string) {
    const client = await this.ensureClient();
    if (!client) {
      return;
    }

    await client.del(key);
  }

  async delByPrefix(prefix: string) {
    const client = await this.ensureClient();
    if (!client) {
      return;
    }

    const keys = await client.keys(`${prefix}*`);
    if (keys.length === 0) {
      return;
    }

    await client.del(keys);
  }
}

export const redisCache = new RedisCache();
