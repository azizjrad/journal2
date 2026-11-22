"use client";

import { useLanguage } from "@/lib/context/language-context";
import { ArticleCard } from "@/components/articles/article-card";
import { NewsPagination } from "@/components/shared/news-pagination";
import type { ArticleCardData } from "@/lib/content/types";

interface NewsPageContentProps {
  paginatedArticles: ArticleCardData[];
  currentPage: number;
  totalPages: number;
  totalArticles: number;
}

export function NewsPageContent({
  paginatedArticles,
  currentPage,
  totalPages,
  totalArticles,
}: NewsPageContentProps) {
  const { t } = useLanguage();

  return (
    <main className="container mx-auto px-4 lg:px-6 py-10 md:py-14">
      <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-950 mb-3">
          {t("all_dispatches", "All Dispatches", "جميع التقارير")}
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t(
            "dispatches_description",
            "Browse all dispatches and briefings, sorted by publication date.",
            "تصفّح جميع التقارير والإحاطات، مرتبة حسب تاريخ النشر.",
          )}
        </p>
        <div className="mt-6 mx-auto h-px w-24 bg-stone-300" />
      </div>

      {paginatedArticles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
            {paginatedArticles.map((article, index) => (
              <ArticleCard
                key={`news-article-${article.id || index}`}
                article={article}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <NewsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalArticles={totalArticles}
            />
          )}
        </>
      ) : (
        <div className="max-w-xl mx-auto text-center py-16 border border-stone-200 bg-white rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t("no_articles", "No Articles Available", "لا توجد مقالات متاحة")}
          </h3>
          <p className="text-sm text-slate-600">
            {t(
              "no_articles_description",
              "There are currently no published articles. Please check back later.",
              "لا توجد مقالات منشورة حالياً. يرجى المراجعة لاحقاً.",
            )}
          </p>
        </div>
      )}
    </main>
  );
}
