import { unstable_cache } from "next/cache";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticleByIdAdmin,
  getAllArticlesAdmin,
  getAnalyticsData,
  getArticles,
  getArticlesByCategory,
  getAuthorInfo,
  getPopularSearches,
  getSearchSuggestions,
  getSitemapEntries,
  advancedSearchArticles,
  searchArticles,
  trackArticleEngagement,
  trackArticleView,
  updateArticle,
} from "@/lib/db/article-repository";

export {
  advancedSearchArticles,
  createArticle,
  deleteArticle,
  getArticleById,
  getArticleByIdAdmin,
  getAllArticlesAdmin,
  getAnalyticsData,
  getArticles,
  getArticlesByCategory,
  getAuthorInfo,
  getPopularSearches,
  getSearchSuggestions,
  getSitemapEntries,
  searchArticles,
  trackArticleEngagement,
  trackArticleView,
  updateArticle,
};

export const getRecentArticlesCached = unstable_cache(
  async (limit: number = 10) => getArticles(limit),
  ["recent-articles"],
  {
    revalidate: 60,
    tags: ["articles"],
  },
);

export const getFeaturedArticlesCached = unstable_cache(
  async (limit: number = 6) => getArticles(limit, true),
  ["featured-articles"],
  {
    revalidate: 180,
    tags: ["articles", "featured"],
  },
);

export const getArticlesByCategoryCached = unstable_cache(
  async (categorySlug: string, limit?: number) =>
    getArticlesByCategory(categorySlug, limit),
  ["category-articles"],
  {
    revalidate: 120,
    tags: ["articles", "categories"],
  },
);

export const getArticleByIdCached = unstable_cache(
  async (id: string) => getArticleById(id),
  ["article-by-id"],
  {
    revalidate: 300,
    tags: ["articles"],
  },
);
