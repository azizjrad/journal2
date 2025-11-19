"use client";

import { useLanguage } from "@/lib/language-context";
import { SearchBar } from "@/components/search-bar";
import { SearchSortDropdown } from "@/components/search-sort-dropdown";
import { ArticlesList } from "@/components/articles-list";
import { SearchFilters } from "@/lib/db";
import { useEffect, useRef } from "react";

interface SearchPageContentProps {
  filters: SearchFilters;
  hasFilters: boolean;
  articleResults: any[];
  latestArticles: any[];
  popularSearches: Array<{ text: string; count?: number }>;
}

export function SearchPageContent({
  filters,
  hasFilters,
  articleResults,
  latestArticles,
  popularSearches,
}: SearchPageContentProps) {
  const { language, t } = useLanguage();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Scroll to results when filters change
  useEffect(() => {
    if (hasFilters && resultsRef.current) {
      const yOffset = -100; // Offset from top (adjust for header)
      const element = resultsRef.current;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [filters.query, filters.sortBy, filters.sortOrder, hasFilters]);

  // Determine current sort value for dropdown
  const getCurrentSort = () => {
    if (filters.sortBy === "date") {
      return filters.sortOrder === "asc" ? "date_asc" : "date_desc";
    }
    return filters.sortBy || "relevance";
  };

  return (
    <main className="container mx-auto px-4 lg:px-6">
      {/* Hero Search Section */}
      <div className="py-12 md:py-24 text-center border-b border-gray-200">
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-8 md:mb-20 px-4">
          {t("search_stories_from", "Search stories from", "ابحث في القصص من")}{" "}
          <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            {t("site_title", "DIGITAL JOURNAL", "الجريدة الرقمية")}
          </span>
        </h1>

        {/* Enhanced Search Bar */}
        <SearchBar
          initialQuery={filters.query}
          popularSearches={popularSearches}
        />

        {/* Sort by option always visible */}
        <div className="mt-8 flex justify-end max-w-5xl mx-auto px-4">
          <SearchSortDropdown currentSort={getCurrentSort()} />
        </div>
      </div>

      {/* Content Section */}
      <div className="py-12" ref={resultsRef}>
        {/* Results Header - only show when there's a search */}
        {hasFilters && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold text-gray-900">
                {articleResults.length.toLocaleString()}+{" "}
                {t("results_found", "results found", "نتيجة موجودة")}
              </div>
              {filters.query && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
                  {t("for", "for", "لـ")} "{filters.query}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Articles Display */}
        {hasFilters ? (
          // Show search results
          articleResults.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("no_results_found", "No results found", "لا توجد نتائج")}
              </h2>
              <p className="text-gray-600 text-lg">
                {t(
                  "try_adjusting_search",
                  "Try adjusting your search terms or browse our latest articles below.",
                  "حاول تعديل مصطلحات البحث أو تصفح أحدث مقالاتنا أدناه."
                )}
              </p>

              {/* Show some articles as fallback */}
              <div className="mt-12">
                <ArticlesList
                  articles={latestArticles.slice(0, 20)}
                  title={t(
                    "latest_articles",
                    "Latest Articles",
                    "أحدث المقالات"
                  )}
                />
              </div>
            </div>
          ) : (
            <ArticlesList articles={articleResults} />
          )
        ) : (
          // Show latest articles when no search
          <ArticlesList articles={latestArticles} />
        )}
      </div>
    </main>
  );
}
