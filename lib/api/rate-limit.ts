// Advanced rate limiting with sliding window and user-based throttling
import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessful?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory storage with optimized cleanup
class RateLimitStore {
  private store = new Map<
    string,
    { count: number; resetTime: number; requests: number[] }
  >();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  // Sliding window rate limiting
  increment(
    key: string,
    windowMs: number,
    maxRequests: number
  ): RateLimitResult {
    const now = Date.now();
    const resetTime = now + windowMs;

    let data = this.store.get(key);

    if (!data || data.resetTime < now) {
      // Create new window
      data = { count: 1, resetTime, requests: [now] };
      this.store.set(key, data);

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    // Clean old requests from sliding window
    const windowStart = now - windowMs;
    data.requests = data.requests.filter(
      (timestamp) => timestamp > windowStart
    );
    data.count = data.requests.length;

    if (data.count >= maxRequests) {
      // Rate limit exceeded
      const oldestRequest = data.requests[0];
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);

      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: oldestRequest + windowMs,
        retryAfter,
      };
    }

    // Add current request
    data.requests.push(now);
    data.count++;
    this.store.set(key, data);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - data.count,
      resetTime: data.requests[0] + windowMs,
    };
  }

  // Get current status without incrementing
  status(key: string, windowMs: number, maxRequests: number): RateLimitResult {
    const now = Date.now();
    const data = this.store.get(key);

    if (!data || data.resetTime < now) {
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests,
        resetTime: now + windowMs,
      };
    }

    // Clean old requests
    const windowStart = now - windowMs;
    const activeRequests = data.requests.filter(
      (timestamp) => timestamp > windowStart
    );

    return {
      success: activeRequests.length < maxRequests,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - activeRequests.length),
      resetTime: activeRequests[0]
        ? activeRequests[0] + windowMs
        : now + windowMs,
    };
  }

  clear() {
    this.store.clear();
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global rate limit store
const globalStore = new RateLimitStore();

// Default key generators
const defaultKeyGenerators = {
  ip: (req: NextRequest) => {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const remoteAddr = req.headers.get("x-remote-addr");

    return (
      forwardedFor?.split(",")[0]?.trim() || realIp || remoteAddr || "unknown"
    );
  },

  user: (req: NextRequest) => {
    // Extract user ID from various sources
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        // In a real app, decode JWT token here
        return `user-${token.substring(0, 10)}`;
      } catch {
        return defaultKeyGenerators.ip(req);
      }
    }
    return defaultKeyGenerators.ip(req);
  },

  endpoint: (req: NextRequest) => {
    const ip = defaultKeyGenerators.ip(req);
    const endpoint = req.nextUrl.pathname;
    return `${ip}-${endpoint}`;
  },
};

// Rate limiting middleware
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerators.ip,
    skipSuccessful = false,
    skipFailedRequests = false,
  } = config;

  return {
    check: (req: NextRequest): RateLimitResult => {
      const key = keyGenerator(req);
      return globalStore.increment(key, windowMs, maxRequests);
    },

    status: (req: NextRequest): RateLimitResult => {
      const key = keyGenerator(req);
      return globalStore.status(key, windowMs, maxRequests);
    },
  };
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiting
  api: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: defaultKeyGenerators.ip,
  }),

  // Authentication endpoints
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: defaultKeyGenerators.ip,
  }),

  // Contact form submissions
  contact: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyGenerator: defaultKeyGenerators.ip,
  }),

  // Search requests
  search: createRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30,
    keyGenerator: defaultKeyGenerators.ip,
  }),

  // Article views (more lenient)
  views: createRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    keyGenerator: defaultKeyGenerators.ip,
  }),

  // Admin actions
  admin: createRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 200,
    keyGenerator: defaultKeyGenerators.user,
  }),
};

// Rate limit response helper
export function createRateLimitResponse(
  result: RateLimitResult,
  message?: string
) {
  const headers = new Headers({
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetTime.toString(),
  });

  if (result.retryAfter) {
    headers.set("Retry-After", result.retryAfter.toString());
  }

  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message: message || "Too many requests, please try again later.",
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers,
    }
  );
}

// Middleware wrapper for Next.js API routes
export function withRateLimit(rateLimit: ReturnType<typeof createRateLimit>) {
  return function (handler: Function): Function {
    return async (req: NextRequest, ...args: any[]) => {
      const result = rateLimit.check(req);

      if (!result.success) {
        return createRateLimitResponse(result);
      }

      // Add rate limit headers to successful responses
      const response = await (handler as any)(req, ...args);

      if (response instanceof Response) {
        response.headers.set("X-RateLimit-Limit", result.limit.toString());
        response.headers.set(
          "X-RateLimit-Remaining",
          result.remaining.toString()
        );
        response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
      }

      return response;
    };
  };
}

// Usage examples for different endpoints
export const apiRateLimit = withRateLimit(rateLimiters.api);
export const authRateLimit = withRateLimit(rateLimiters.auth);
export const contactRateLimit = withRateLimit(rateLimiters.contact);
export const searchRateLimit = withRateLimit(rateLimiters.search);
export const viewsRateLimit = withRateLimit(rateLimiters.views);
export const adminRateLimit = withRateLimit(rateLimiters.admin);

// Cleanup function for graceful shutdown
export function cleanupRateLimiting() {
  globalStore.destroy();
}

// Performance monitoring
export function getRateLimitStats() {
  return {
    activeKeys: globalStore["store"].size,
    uptime: process.uptime(),
  };
}
