// Simple in-memory cache implementation
// In production, consider using Redis or Memcached

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

// Cache wrapper for async functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlSeconds: number = 300
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = keyGenerator(...args);

    // Try to get from cache first
    const cached = memoryCache.get(cacheKey);
    if (cached !== null) {
      console.log(`Cache HIT for key: ${cacheKey}`);
      return cached;
    }

    // Execute function and cache result
    console.log(`Cache MISS for key: ${cacheKey}`);
    const result = await fn(...args);
    memoryCache.set(cacheKey, result, ttlSeconds);

    return result;
  }) as T;
}

// Predefined cache keys
export const CacheKeys = {
  CATEGORIES: "categories",
  RECENT_ARTICLES: (limit: number) => `recent-articles-${limit}`,
  FEATURED_ARTICLES: (limit: number) => `featured-articles-${limit}`,
  ARTICLE_BY_ID: (id: string) => `article-${id}`,
  ARTICLES_BY_CATEGORY: (category: string, page: number) =>
    `articles-category-${category}-${page}`,
  SEARCH_RESULTS: (query: string, page: number) => `search-${query}-${page}`,
  USER_ARTICLES: (userId: string) => `user-articles-${userId}`,
  ANALYTICS_SUMMARY: "analytics-summary",
  SITEMAP: "sitemap-data",
};

// Cache invalidation helpers
export const invalidateCache = {
  article: (id?: string) => {
    if (id) {
      memoryCache.delete(CacheKeys.ARTICLE_BY_ID(id));
    }
    // Invalidate related caches
    memoryCache.delete(CacheKeys.CATEGORIES);
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((limit) => {
      memoryCache.delete(CacheKeys.RECENT_ARTICLES(limit));
      memoryCache.delete(CacheKeys.FEATURED_ARTICLES(limit));
    });
  },

  category: () => {
    memoryCache.delete(CacheKeys.CATEGORIES);
  },

  search: (query?: string) => {
    if (query) {
      Array.from({ length: 10 }, (_, i) => i + 1).forEach((page) => {
        memoryCache.delete(CacheKeys.SEARCH_RESULTS(query, page));
      });
    }
  },

  all: () => {
    memoryCache.clear();
  },
};
