"use client";

import { useLanguage } from "@/lib/language-context";
import { ArticleCard } from "@/components/article-card";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  title_en: string;
  title_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  image_url: string;
  published_at: string;
  category_name_en?: string;
  category_name_ar?: string;
  category_slug?: string;
  is_featured: boolean;
}

interface LatestNewsSectionProps {
  articles: Article[];
}

export function LatestNewsSection({ articles }: LatestNewsSectionProps) {
  const { language, t } = useLanguage();

  return (
    <div className="container mx-auto px-4 lg:px-6 py-20">
      {/* Section Header */}
      <div className="text-center mb-16">
        {/* Removed Fresh Updates span and icon */}

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {t("latest_news", "Latest News", "آخر الأخبار")}
        </h2>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {t(
            "latest_description",
            "Stay ahead with our most recent coverage of breaking news, trending stories, and in-depth reporting",
            "ابق في المقدمة مع تغطيتنا الأحدث للأخبار العاجلة والقصص الرائجة والتقارير المتعمقة"
          )}
        </p>

        <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto"></div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
        {" "}
        {articles.map((article, index) => (
          <div
            key={article.id}
            className="group transform hover:scale-[1.02] transition-all duration-300 opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "forwards",
            }}
          >
            <ArticleCard article={article} />
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link
          href="/news"
          className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group"
        >
          <span className="mr-3">
            {t("view_all_news", "View All News", "عرض جميع الأخبار")}
          </span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}
