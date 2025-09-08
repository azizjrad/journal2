// Advanced performance cache with LRU eviction and compression
import { LRUCache } from "lru-cache";

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  compression?: boolean; // Enable compression for large data
}

class PerformanceCache {
  private cache: LRUCache<string, any>;
  private compressionEnabled: boolean;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.maxSize || 1000,
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
    this.compressionEnabled = options.compression || false;
  }

  // Get value from cache
  get<T>(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value && this.compressionEnabled && value.compressed) {
      return this.decompress(value.data);
    }
    return value;
  }

  // Set value in cache
  set(key: string, value: any, ttl?: number): void {
    let dataToStore = value;

    if (this.compressionEnabled && this.shouldCompress(value)) {
      dataToStore = {
        compressed: true,
        data: this.compress(value),
      };
    }

    if (ttl) {
      this.cache.set(key, dataToStore, { ttl });
    } else {
      this.cache.set(key, dataToStore);
    }
  }

  // Check if key exists
  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
    };
  }

  // Compress data (simple JSON compression)
  private compress(data: any): string {
    return JSON.stringify(data);
  }

  // Decompress data
  private decompress(data: string): any {
    return JSON.parse(data);
  }

  // Determine if data should be compressed
  private shouldCompress(data: any): boolean {
    const serialized = JSON.stringify(data);
    return serialized.length > 1024; // Compress if larger than 1KB
  }
}

// Cache instances for different data types
export const articleCache = new PerformanceCache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 500,
  compression: true,
});

export const userCache = new PerformanceCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200,
});

export const analyticsCache = new PerformanceCache({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 50,
});

export const searchCache = new PerformanceCache({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 300,
});

// Cache wrapper for async functions with optimized performance
export function withPerformanceCache<
  T extends (...args: any[]) => Promise<any>
>(
  fn: T,
  cache: PerformanceCache,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    // Check cache first
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      cache.set(key, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }) as T;
}

// Batch cache operations for better performance
export class BatchCache {
  private operations: Array<{
    type: "get" | "set" | "delete";
    key: string;
    value?: any;
    ttl?: number;
  }> = [];
  private cache: PerformanceCache;

  constructor(cache: PerformanceCache) {
    this.cache = cache;
  }

  // Queue get operation
  queueGet(key: string) {
    this.operations.push({ type: "get", key });
    return this;
  }

  // Queue set operation
  queueSet(key: string, value: any, ttl?: number) {
    this.operations.push({ type: "set", key, value, ttl });
    return this;
  }

  // Queue delete operation
  queueDelete(key: string) {
    this.operations.push({ type: "delete", key });
    return this;
  }

  // Execute all queued operations
  execute(): Map<string, any> {
    const results = new Map<string, any>();

    for (const op of this.operations) {
      switch (op.type) {
        case "get":
          results.set(op.key, this.cache.get(op.key));
          break;
        case "set":
          if (op.value !== undefined) {
            this.cache.set(op.key, op.value, op.ttl);
          }
          break;
        case "delete":
          this.cache.delete(op.key);
          break;
      }
    }

    this.operations = []; // Clear operations
    return results;
  }
}

// Cache warming utilities
export class CacheWarmer {
  private cache: PerformanceCache;
  private tasks: Array<() => Promise<any>> = [];

  constructor(cache: PerformanceCache) {
    this.cache = cache;
  }

  // Add warming task
  addTask(key: string, dataProvider: () => Promise<any>, ttl?: number) {
    this.tasks.push(async () => {
      try {
        const data = await dataProvider();
        this.cache.set(key, data, ttl);
        console.log(`Cache warmed: ${key}`);
      } catch (error) {
        console.error(`Cache warming failed for ${key}:`, error);
      }
    });
    return this;
  }

  // Execute all warming tasks
  async warm(concurrency: number = 3): Promise<void> {
    console.log(`Starting cache warming with ${this.tasks.length} tasks...`);

    // Execute tasks in batches to avoid overwhelming the system
    for (let i = 0; i < this.tasks.length; i += concurrency) {
      const batch = this.tasks.slice(i, i + concurrency);
      await Promise.allSettled(batch.map((task) => task()));
    }

    console.log("Cache warming completed");
    this.tasks = []; // Clear tasks
  }
}

// Performance monitoring
export class CacheMonitor {
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  // Record cache hit
  recordHit() {
    this.metrics.hits++;
  }

  // Record cache miss
  recordMiss() {
    this.metrics.misses++;
  }

  // Record cache set
  recordSet() {
    this.metrics.sets++;
  }

  // Record cache delete
  recordDelete() {
    this.metrics.deletes++;
  }

  // Get hit ratio
  getHitRatio(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? this.metrics.hits / total : 0;
  }

  // Get metrics
  getMetrics() {
    return {
      ...this.metrics,
      hitRatio: this.getHitRatio(),
    };
  }

  // Reset metrics
  reset() {
    this.metrics = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }
}

// Global cache monitor
export const cacheMonitor = new CacheMonitor();
