"use client";

import { useLanguage } from "@/lib/language-context";
import { useState, useEffect, useMemo, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { ArticleInterface } from "@/lib/db";

interface BreakingNewsTickerProps {
  articles?: ArticleInterface[];
  isVisible?: boolean;
  onClose?: () => void;
}

export const BreakingNewsTicker = memo(function BreakingNewsTicker({
  articles = [],
  isVisible = true,
  onClose,
}: BreakingNewsTickerProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch swipe state for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Handle swipe left/right
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          // Swipe left: next
          setCurrentIndex((prev) => (prev + 1) % newsItems.length);
        } else {
          // Swipe right: prev
          setCurrentIndex(
            (prev) => (prev - 1 + newsItems.length) % newsItems.length
          );
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Memoize sorted articles to prevent unnecessary recalculations
  const sortedArticles = useMemo(() => {
    return articles
      .sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      )
      .slice(0, 4); // Show max 4 featured articles
  }, [articles]);

  // Default featured articles if no articles provided - memoized
  const defaultItems: ArticleInterface[] = useMemo(
    () => [
      {
        id: "default-1",
        title_en: "In-depth analysis: Libya's economic transformation",
        title_ar: "تحليل متعمق: التحول الاقتصادي في ليبيا",
        published_at: new Date().toISOString(),
        content_en: "",
        content_ar: "",
        excerpt_en: "",
        excerpt_ar: "",
        image_url: "",
        category_id: "",
        is_featured: true,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "default-2",
        title_en: "Special report: Regional diplomatic initiatives",
        title_ar: "تقرير خاص: المبادرات الدبلوماسية الإقليمية",
        published_at: new Date().toISOString(),
        content_en: "",
        content_ar: "",
        excerpt_en: "",
        excerpt_ar: "",
        image_url: "",
        category_id: "",
        is_featured: true,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "default-3",
        title_en: "Featured story: Building sustainable partnerships",
        title_ar: "قصة مميزة: بناء شراكات مستدامة",
        published_at: new Date().toISOString(),
        content_en: "",
        content_ar: "",
        excerpt_en: "",
        excerpt_ar: "",
        image_url: "",
        category_id: "",
        is_featured: true,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    []
  );

  const newsItems = useMemo(() => {
    return sortedArticles.length > 0 ? sortedArticles : defaultItems;
  }, [sortedArticles, defaultItems]);

  useEffect(() => {
    if (newsItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [newsItems.length]);

  // Poll for new featured articles every 30 seconds
  useEffect(() => {
    const poll = setInterval(() => {
      router.refresh();
    }, 30000); // 30 seconds
    return () => clearInterval(poll);
  }, [router]);

  if (newsItems.length === 0) return null;
  const currentItem = newsItems[currentIndex];
  const displayText =
    language === "ar" ? currentItem.title_ar : currentItem.title_en;
  return (
    <div
      className="bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden w-full"
      role="banner"
      aria-label="Featured articles"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex items-center py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 mr-2 sm:mr-4 rtl:mr-0 rtl:ml-2 sm:rtl:ml-4">
            <div className="bg-white text-red-600 px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wide shadow-sm border border-red-200">
              {t("breaking", "Breaking", "عاجل")}
            </div>
            {/* Hide moving dots on mobile */}
            <div className="hidden sm:flex gap-1" aria-hidden="true">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-300 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="relative h-8 sm:h-10 flex items-center">
              <Link
                href={`/article/${currentItem.id}`}
                className="absolute inset-0 flex items-center text-base sm:text-lg font-semibold animate-in slide-in-from-right-4 duration-700 hover:text-red-100 transition-colors cursor-pointer pr-2 sm:pr-4"
                role="alert"
                aria-live="polite"
              >
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {displayText}
                </span>
              </Link>
            </div>
          </div>
          {newsItems.length > 1 && (
            <div
              className="flex gap-1 sm:gap-2 ml-2 sm:ml-4 rtl:ml-0 rtl:mr-2 sm:rtl:mr-4"
              role="tablist"
              aria-label="Featured articles navigation"
            >
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 ${
                    index === currentIndex
                      ? "bg-white shadow-sm"
                      : "bg-red-300 hover:bg-red-200"
                  }`}
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Go to featured article ${index + 1}`}
                />
              ))}
            </div>
          )}
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 sm:ml-3 rtl:ml-0 rtl:mr-2 sm:rtl:mr-3 p-0.5 sm:p-1 hover:bg-red-800 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
              aria-label={t(
                "close_featured_articles",
                "Close featured articles",
                "إغلاق المقالات المميزة"
              )}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
