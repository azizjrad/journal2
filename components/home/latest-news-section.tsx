"use client";

import { useLanguage } from "@/lib/context/language-context";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  const isArabic = language === "ar";

  if (!articles.length) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? "ar-TN" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="container mx-auto px-4 lg:px-6 py-8 md:py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600">
              {t("more_dispatches", "More Dispatches", "تقارير إضافية")}
            </h2>
            <div className="h-px flex-1 bg-stone-300" />
          </div>
          <Link
            href="/news"
            className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            <span className="mr-1.5 rtl:mr-0 rtl:ml-1.5">
              {t("view_all_news", "View all", "عرض الكل")}
            </span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {articles.map((article) => {
            const title = isArabic ? article.title_ar : article.title_en;
            const excerpt = isArabic ? article.excerpt_ar : article.excerpt_en;
            const category = isArabic
              ? article.category_name_ar
              : article.category_name_en;
            return (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="group grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[104px_minmax(0,1fr)] gap-4 py-4 items-start"
              >
                <div className="relative h-[66px] sm:h-[78px] w-[88px] sm:w-[104px] overflow-hidden bg-stone-200 border border-stone-200">
                  <Image
                    src={article.image_url || "/placeholder.svg"}
                    alt={title}
                    fill
                    sizes="104px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    {category && (
                      <span className="font-semibold text-[#7a3030]">{category}</span>
                    )}
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <h3 className="text-[15px] font-medium leading-snug text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed line-clamp-1 hidden sm:block">
                      {excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
