"use client";

import { useLanguage } from "@/lib/language-context";
import { HeroCarousel } from "@/components/hero-carousel";
import { TrendingUp, Clock } from "lucide-react";
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

interface HeroSectionProps {
  featuredArticles: Article[];
  recentArticles: Article[];
}

export function HeroSection({
  featuredArticles,
  recentArticles,
}: HeroSectionProps) {
  const { language, t } = useLanguage();

  // Get articles for each section
  const todaysPicks = featuredArticles.slice(0, 3); // Left section - Today's Picks (3 articles)
  const mainFeaturedArticles = featuredArticles.slice(0, 5); // Center carousel (5 articles max)
  const mostRecentArticles = recentArticles.slice(0, 5); // Right section - Most Recent (5 articles)

  return (
    <div className="bg-stone-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="container mx-auto px-4 lg:px-6 py-12 relative">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN - Today's Picks */}
          <div className="lg:col-span-3">
            <div className="p-6 h-full">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  {t("todays_picks", "TODAY'S PICKS", "اختيارات اليوم")}
                </div>
              </div>

              {/* Today's Picks Articles */}
              <div className="space-y-6">
                {todaysPicks.map((article, index) => (
                  <div key={`todays-pick-${article.id || index}`}>
                    <Link
                      href={`/article/${article.id}`}
                      className="group block"
                    >
                      <div className="space-y-3">
                        {/* Article Image */}
                        <div className="relative w-full h-32 rounded-lg overflow-hidden">
                          <img
                            src={article.image_url || "/placeholder.svg"}
                            alt={
                              language === "ar"
                                ? article.title_ar
                                : article.title_en
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Article Title */}
                        <h3 className="text-gray-800 text-sm font-semibold leading-tight group-hover:text-red-600 transition-colors line-clamp-3">
                          {language === "ar"
                            ? article.title_ar
                            : article.title_en}
                        </h3>

                        {/* Author */}
                        <p className="text-gray-600 text-xs uppercase tracking-wide">
                          {t("by_author", "BY AUTHOR", "بقلم الكاتب")}
                        </p>
                      </div>
                    </Link>
                    {/* Divider line - except for last item */}
                    {index < todaysPicks.length - 1 && (
                      <div className="border-b border-gray-300 mt-6"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN - Main Carousel */}
          <div className="lg:col-span-6">
            <HeroCarousel articles={mainFeaturedArticles} />
          </div>

          {/* RIGHT COLUMN - Most Recent */}
          <div className="lg:col-span-3">
            <div className="p-6 h-full">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  {t("most_recent", "MOST RECENT", "الأحدث")}
                </div>
              </div>

              {/* Most Recent Articles */}
              <div className="space-y-4">
                {mostRecentArticles.map((article, index) => (
                  <div key={`recent-article-${article.id || index}`}>
                    <Link
                      href={`/article/${article.id}`}
                      className="group block"
                    >
                      <div className="flex items-start space-x-3 rtl:space-x-reverse p-3 rounded-xl hover:bg-gray-200/50 transition-all duration-300">
                        <div className="flex-1 min-w-0">
                          {/* Article Title */}
                          <h4 className="text-gray-800 text-sm font-semibold leading-tight group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                            {language === "ar"
                              ? article.title_ar
                              : article.title_en}
                          </h4>

                          {/* Author & Date */}
                          <div className="space-y-1">
                            <p className="text-gray-600 text-xs uppercase tracking-wide">
                              {t("by_author", "BY AUTHOR", "بقلم الكاتب")}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>
                                {new Date(
                                  article.published_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Small Article Image - moved to right */}
                        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden ml-3">
                          <img
                            src={article.image_url || "/placeholder.svg"}
                            alt={
                              language === "ar"
                                ? article.title_ar
                                : article.title_en
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </Link>
                    {/* Divider line - except for last item */}
                    {index < mostRecentArticles.length - 1 && (
                      <div className="border-b border-gray-300 mt-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
