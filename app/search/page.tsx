import {
  advancedSearchArticles,
  getCategories,
  SearchFilters,
  getPopularSearches,
  getArticles,
} from "@/lib/db";
import Header from "@/components/header";
import { BreakingNewsTicker } from "@/components/breaking-news-ticker";
import { Footer } from "@/components/footer";
import { SearchPageContent } from "@/components/search-page-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - Digital Journal",
  description:
    "Search through thousands of articles covering technology, politics, culture, and more from our expert journalists.",
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  // Build search filters from URL params
  const filters: SearchFilters = {
    query: resolvedSearchParams.q || "",
    categoryId: resolvedSearchParams.category || undefined,
    dateFrom: resolvedSearchParams.dateFrom || undefined,
    dateTo: resolvedSearchParams.dateTo || undefined,
    tags: resolvedSearchParams.tags
      ? resolvedSearchParams.tags.split(",")
      : undefined,
    sortBy:
      (resolvedSearchParams.sortBy as "date" | "relevance") || "relevance",
    sortOrder: (resolvedSearchParams.sortOrder as "asc" | "desc") || "desc",
  };

  const hasFilters =
    filters.query ||
    filters.categoryId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.tags?.length;

  const [searchResults, categories, popularSearches, latestArticles] =
    await Promise.all([
      hasFilters ? advancedSearchArticles(filters) : Promise.resolve([]),
      getCategories(),
      getPopularSearches(),
      getArticles(50), // Get more articles for pagination
    ]);

  // Ensure searchResults is always an array
  const articleResults = Array.isArray(searchResults) ? searchResults : [];

  return (
    <div className="min-h-screen bg-white">
      <Header categories={categories} />
      <BreakingNewsTicker articles={latestArticles.slice(0, 5)} />

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
