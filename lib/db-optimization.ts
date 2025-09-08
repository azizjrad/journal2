// Database query optimization utilities
import mongoose from "mongoose";

// Query optimization helpers
export class QueryOptimizer {
  // Optimize MongoDB aggregation pipelines
  static optimizeAggregation(pipeline: any[]) {
    const optimized = [...pipeline];

    // Move $match stages to the beginning for better performance
    const matchStages = optimized.filter((stage) => stage.$match);
    const otherStages = optimized.filter((stage) => !stage.$match);

    // Sort $match stages by selectivity (more selective first)
    matchStages.sort((a, b) => {
      const aKeys = Object.keys(a.$match);
      const bKeys = Object.keys(b.$match);

      // Prefer exact matches over regex
      const aExact = aKeys.some((key) => typeof a.$match[key] !== "object");
      const bExact = bKeys.some((key) => typeof b.$match[key] !== "object");

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return 0;
    });

    return [...matchStages, ...otherStages];
  }

  // Create optimized index suggestions
  static suggestIndexes(collection: string, queries: any[]) {
    const indexSuggestions = new Map<
      string,
      { fields: string[]; frequency: number }
    >();

    queries.forEach((query) => {
      const fields = Object.keys(query).sort();
      const key = fields.join("_");

      if (indexSuggestions.has(key)) {
        indexSuggestions.get(key)!.frequency++;
      } else {
        indexSuggestions.set(key, { fields, frequency: 1 });
      }
    });

    return Array.from(indexSuggestions.entries())
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .map(([key, data]) => ({
        collection,
        fields: data.fields,
        frequency: data.frequency,
        indexSpec: data.fields.reduce(
          (acc, field) => ({ ...acc, [field]: 1 }),
          {}
        ),
      }));
  }

  // Batch query operations for better performance
  static async batchFind<T>(
    model: mongoose.Model<T>,
    queries: any[],
    options: { batchSize?: number; projection?: any } = {}
  ): Promise<T[][]> {
    const { batchSize = 10, projection } = options;
    const results: T[][] = [];

    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchPromises = batch.map((query) =>
        model.find(query, projection).lean().exec()
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  // Optimize text search queries
  static optimizeTextSearch(searchTerm: string) {
    if (!searchTerm || searchTerm.length < 2) {
      return null;
    }

    // Clean and optimize search term
    const cleaned = searchTerm
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+/g, " "); // Normalize whitespace

    if (cleaned.length < 2) {
      return null;
    }

    // Create different search strategies based on term length
    if (cleaned.length <= 3) {
      // Short terms: exact word match
      return { $text: { $search: `"${cleaned}"` } };
    } else if (cleaned.length <= 10) {
      // Medium terms: phrase + individual words
      const words = cleaned.split(" ");
      if (words.length === 1) {
        return { $text: { $search: cleaned } };
      } else {
        return {
          $or: [
            { $text: { $search: `"${cleaned}"` } }, // Exact phrase
            { $text: { $search: cleaned } }, // Individual words
          ],
        };
      }
    } else {
      // Long terms: use individual words
      return { $text: { $search: cleaned } };
    }
  }
}

// Connection pool optimization
export class ConnectionOptimizer {
  // Monitor connection pool health
  static getPoolStats() {
    const connection = mongoose.connection;

    if (connection.readyState !== 1) {
      return { status: "disconnected", healthy: false };
    }

    return {
      status: "connected",
      healthy: true,
      readyState: connection.readyState,
      // Note: Some pool stats may not be available in all MongoDB driver versions
      name: connection.name,
      host: connection.host,
      port: connection.port,
    };
  }

  // Optimize connection for specific use cases
  static getOptimizedConnectionOptions(
    useCase: "read-heavy" | "write-heavy" | "balanced" = "balanced"
  ) {
    const baseOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: "majority" as const,
      compressors: "zlib" as const,
      zlibCompressionLevel: 6 as const,
    };

    switch (useCase) {
      case "read-heavy":
        return {
          ...baseOptions,
          maxPoolSize: 15,
          readPreference: "secondaryPreferred" as const,
          readConcern: { level: "local" as const },
        };

      case "write-heavy":
        return {
          ...baseOptions,
          maxPoolSize: 10,
          readPreference: "primary" as const,
          writeConcern: { w: "majority" as const, j: true },
        };

      case "balanced":
      default:
        return {
          ...baseOptions,
          maxPoolSize: 12,
          readPreference: "primaryPreferred" as const,
        };
    }
  }
}

// Query performance monitoring
export class QueryMonitor {
  private static queryLog = new Map<
    string,
    { count: number; totalTime: number; avgTime: number }
  >();

  // Monitor query performance
  static async measureQuery<T>(
    queryName: string,
    queryFunction: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFunction();
      const duration = Date.now() - startTime;

      this.recordQueryTime(queryName, duration);

      if (duration > 1000) {
        // Log slow queries
        console.warn(`⚠️ Slow query detected: ${queryName} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Query failed: ${queryName} after ${duration}ms`, error);
      throw error;
    }
  }

  private static recordQueryTime(queryName: string, duration: number) {
    const existing = this.queryLog.get(queryName) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
    };

    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;

    this.queryLog.set(queryName, existing);
  }

  // Get performance statistics
  static getStats() {
    return Array.from(this.queryLog.entries())
      .map(([query, stats]) => ({ query, ...stats }))
      .sort((a, b) => b.avgTime - a.avgTime);
  }

  // Clear statistics
  static clearStats() {
    this.queryLog.clear();
  }
}

// Common optimized query patterns
export const OptimizedQueries = {
  // Efficient pagination with cursor-based approach
  async findWithCursor<T>(
    model: mongoose.Model<T>,
    filter: any = {},
    options: {
      limit?: number;
      cursor?: any;
      sortField?: string;
      sortOrder?: 1 | -1;
      projection?: any;
    } = {}
  ) {
    const {
      limit = 20,
      cursor,
      sortField = "_id",
      sortOrder = -1,
      projection,
    } = options;

    let query = { ...filter };

    if (cursor) {
      const operator = sortOrder === 1 ? "$gt" : "$lt";
      query[sortField] = { [operator]: cursor };
    }

    const results = await model
      .find(query, projection)
      .sort({ [sortField]: sortOrder })
      .limit(limit + 1) // Get one extra to check if there are more
      .lean()
      .exec();

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? items[items.length - 1][sortField] : null;

    return {
      items,
      hasMore,
      nextCursor,
    };
  },

  // Optimized article search with scoring
  async searchArticles(
    searchTerm: string,
    options: {
      limit?: number;
      skip?: number;
      filters?: any;
      includeUnpublished?: boolean;
    } = {}
  ) {
    const {
      limit = 20,
      skip = 0,
      filters = {},
      includeUnpublished = false,
    } = options;

    const textQuery = QueryOptimizer.optimizeTextSearch(searchTerm);
    if (!textQuery) {
      return { articles: [], total: 0 };
    }

    const baseFilter = {
      ...filters,
      ...(!includeUnpublished && { is_published: true }),
    };

    const pipeline = QueryOptimizer.optimizeAggregation([
      { $match: { ...baseFilter, ...textQuery } },
      {
        $addFields: {
          score: { $meta: "textScore" },
          // Boost recent articles
          recencyBoost: {
            $divide: [
              {
                $subtract: [
                  new Date(),
                  { $dateFromString: { dateString: "$published_at" } },
                ],
              },
              1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
            ],
          },
        },
      },
      { $sort: { score: { $meta: "textScore" }, recencyBoost: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title_en: 1,
          title_ar: 1,
          excerpt_en: 1,
          excerpt_ar: 1,
          image_url: 1,
          published_at: 1,
          category_name_en: 1,
          category_name_ar: 1,
          category_slug: 1,
          is_featured: 1,
          score: 1,
        },
      },
    ]);

    const [articles, totalResult] = await Promise.all([
      mongoose.connection.db
        .collection("articles")
        .aggregate(pipeline)
        .toArray(),
      mongoose.connection.db
        .collection("articles")
        .countDocuments({ ...baseFilter, ...textQuery }),
    ]);

    return { articles, total: totalResult };
  },

  // Optimized analytics aggregation
  async getAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            articleId: "$articleId",
          },
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalViews: { $sum: "$views" },
          uniqueArticles: { $sum: 1 },
          totalUniqueUsers: { $sum: { $size: "$uniqueUsers" } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    return await mongoose.connection.db
      .collection("analytics")
      .aggregate(pipeline)
      .toArray();
  },
};

// Database health checker
export class DatabaseHealth {
  static async checkHealth() {
    const health = {
      connected: false,
      latency: 0,
      indexes: [],
      issues: [] as string[],
    };

    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      health.latency = Date.now() - start;
      health.connected = true;

      // Check indexes
      const collections = ["articles", "users", "categories", "analytics"];
      for (const collectionName of collections) {
        try {
          const indexes = await mongoose.connection.db
            .collection(collectionName)
            .listIndexes()
            .toArray();
          health.indexes.push({
            collection: collectionName,
            count: indexes.length,
          });
        } catch (error) {
          health.issues.push(`Failed to check indexes for ${collectionName}`);
        }
      }

      // Performance warnings
      if (health.latency > 100) {
        health.issues.push(`High database latency: ${health.latency}ms`);
      }
    } catch (error) {
      health.issues.push(`Database connection failed: ${error}`);
    }

    return health;
  }
}
