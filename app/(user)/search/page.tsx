import { getCategories } from "@/lib/services/category-service";
import type { SearchFilters } from "@/lib/content/types";
import {
  advancedSearchArticles,
  getArticles,
  getPopularSearches,
} from "@/lib/content/article-service";
import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchPageContent } from "@/components/search/search-page-content";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search - The Maghreb Corridor",
  description:
    "Search dispatches and articles from The Maghreb Corridor.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  const filters: SearchFilters = {
    query: resolvedSearchParams.q || "",
    categoryId: resolvedSearchParams.category || undefined,
    dateFrom: resolvedSearchParams.dateFrom || undefined,
    dateTo: resolvedSearchParams.dateTo || undefined,
    tags: resolvedSearchParams.tags ? resolvedSearchParams.tags.split(",") : undefined,
    sortBy: (resolvedSearchParams.sortBy as "date" | "relevance") || "relevance",
    sortOrder: (resolvedSearchParams.sortOrder as "asc" | "desc") || "desc",
  };

  const hasFilters = Boolean(
    filters.query || filters.categoryId || filters.dateFrom || filters.dateTo || filters.tags?.length,
  );

  const [searchResults, categories, popularSearches, latestArticles] = await Promise.all([
    hasFilters ? advancedSearchArticles(filters) : Promise.resolve([]),
    getCategories(),
    getPopularSearches(),
    getArticles(50),
  ]);

  const articleResults = Array.isArray(searchResults) ? searchResults : [];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <Header categories={categories} />
      <SearchPageContent
        filters={filters}
        hasFilters={hasFilters}
        articleResults={articleResults}
        latestArticles={latestArticles}
        popularSearches={popularSearches}
      />
      <Footer categories={categories} />
    </div>
  );
}
