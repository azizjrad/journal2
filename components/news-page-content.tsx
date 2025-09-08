"use client";

import { useLanguage } from "@/lib/language-context";
import { ArticleCard } from "@/components/article-card";
import { NewsPagination } from "@/components/news-pagination";
import type { Article } from "@/lib/db";

interface NewsPageContentProps {
  paginatedArticles: Article[];
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
    <main className="container mx-auto px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {t("all_news", "All News", "جميع الأخبار")}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          {t(
            "news_description",
            "Stay informed with our comprehensive news coverage. Browse through all articles sorted by publication date.",
            "ابق على اطلاع مع تغطيتنا الإخبارية الشاملة. تصفح جميع المقالات مرتبة حسب تاريخ النشر."
          )}
        </p>
      </div>

      {/* Articles Grid */}
      {paginatedArticles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {paginatedArticles.map((article, index) => (
              <ArticleCard
                key={`news-article-${article.id || index}`}
                article={article}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <NewsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalArticles={totalArticles}
            />
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t(
                "no_articles",
                "No Articles Available",
                "لا توجد مقالات متاحة"
              )}
            </h3>
            <p className="text-gray-600">
              {t(
                "no_articles_description",
                "There are currently no published articles. Please check back later.",
                "لا توجد مقالات منشورة حالياً. يرجى المراجعة لاحقاً."
              )}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
