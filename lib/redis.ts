import { createClient, RedisClientType } from "redis";

let redis: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (!redis) {
    try {
      redis = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        socket: {
          connectTimeout: 5000,
        },
        retry_strategy: (options) => {
          if (options.error && options.error.code === "ECONNREFUSED") {
            console.error("Redis connection refused");
            return new Error("Redis connection refused");
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.error("Redis retry time exhausted");
            return new Error("Retry time exhausted");
          }
          if (options.attempt > 10) {
            console.error("Redis max retry attempts reached");
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      redis.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      redis.on("connect", () => {
        console.log("✅ Redis connected successfully");
      });

      redis.on("ready", () => {
        console.log("✅ Redis ready for operations");
      });

      await redis.connect();
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  }
  return redis;
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
