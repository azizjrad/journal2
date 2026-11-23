"use client";

import { useLanguage } from "@/lib/context/language-context";
import { SearchBar } from "@/components/search/search-bar";
import { SearchSortDropdown } from "@/components/search/search-sort-dropdown";
import { ArticlesList } from "@/components/articles/articles-list";
import type { SearchFilters } from "@/lib/content/types";
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
  const { t } = useLanguage();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasFilters && resultsRef.current) {
      const yOffset = -100;
      const element = resultsRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [filters.query, filters.sortBy, filters.sortOrder, hasFilters]);

  const getCurrentSort = () => {
    if (filters.sortBy === "date") {
      return filters.sortOrder === "asc" ? "date_asc" : "date_desc";
    }
    return filters.sortBy || "relevance";
  };

  return (
    <main className="container mx-auto px-4 lg:px-6">
      <div className="py-10 md:py-16 text-center border-b border-stone-200">
        <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-3">
          {t("search_kicker", "Search", "البحث")}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-8">
          {t("search_title", "Search The Maghreb Corridor", "ابحث في نشرة الممر المغاربي")}
        </h1>
        <SearchBar initialQuery={filters.query} popularSearches={popularSearches} />
        <div className="mt-8 flex justify-center md:justify-end max-w-4xl mx-auto">
          <SearchSortDropdown currentSort={getCurrentSort()} />
        </div>
      </div>

      <div className="py-10 md:py-12" ref={resultsRef}>
        {hasFilters && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center flex-wrap gap-3">
              <div className="text-base font-medium text-slate-900">
                {articleResults.length.toLocaleString()} {t("results_found", "results", "نتيجة")}
              </div>
              {filters.query && (
                <div className="bg-stone-100 border border-stone-200 text-slate-700 px-3 py-1.5 rounded-full text-sm">
                  {t("for", "for", "لـ")} "{filters.query}"
                </div>
              )}
            </div>
          </div>
        )}

        {hasFilters ? (
          articleResults.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-slate-950 mb-3">
                {t("no_results_found", "No results found", "لا توجد نتائج")}
              </h2>
              <p className="text-slate-600">
                {t(
                  "try_adjusting_search",
                  "Try adjusting your search terms or browse the latest dispatches below.",
                  "جرّب تعديل كلمات البحث أو تصفح أحدث التقارير أدناه.",
                )}
              </p>
              <div className="mt-10 text-start">
                <ArticlesList articles={latestArticles.slice(0, 20)} title={t("latest_articles", "Latest dispatches", "أحدث التقارير")} />
              </div>
            </div>
          ) : (
            <ArticlesList articles={articleResults} />
          )
        ) : (
          <ArticlesList articles={latestArticles} title={t("latest_articles", "Latest dispatches", "أحدث التقارير")} />
        )}
      </div>
    </main>
  );
}