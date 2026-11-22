"use client";

import { useLanguage } from "@/lib/context/language-context";
import { ArticleCard } from "@/components/articles/article-card";
import type { Article } from "@/lib/types";

interface CategoryPageViewProps {
  category: {
    name_en: string;
    name_ar: string;
  };
  articles: any[];
}

export function CategoryPageView({ category, articles }: CategoryPageViewProps) {
  const { language } = useLanguage();
  const name = language === "ar" ? category.name_ar : category.name_en;

  return (
    <main className="container mx-auto px-4 lg:px-6 py-10 md:py-14">
      <header className="max-w-4xl mx-auto text-center mb-10 md:mb-14">
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-950 mb-3"
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          {name}
        </h1>
        <div className="mt-6 mx-auto h-px w-24 bg-stone-300" />
      </header>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="max-w-xl mx-auto text-center py-16 border border-stone-200 bg-white rounded-lg">
          <p className="text-slate-700 font-medium mb-1">
            {language === "ar"
              ? "لا توجد مقالات في هذا القسم حالياً"
              : "No articles in this category yet"}
          </p>
        </div>
      )}
    </main>
  );
}
