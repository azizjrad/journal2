"use client";

import { useLanguage } from "@/lib/context/language-context";
import { Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Article {
  id: string | number;
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
  lead?: Article;
  items: Article[];
}

export function HeroSection({ lead, items }: HeroSectionProps) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";

  if (!lead) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? "ar-TN" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const leadTitle = isArabic ? lead.title_ar : lead.title_en;
  const leadExcerpt = isArabic ? lead.excerpt_ar : lead.excerpt_en;
  const leadCategory = isArabic ? lead.category_name_ar : lead.category_name_en;

  return (
    <section className="min-w-0">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600">
          {t("dispatch_index", "Dispatch Index", "فهرس التقارير")}
        </h2>
        <div className="h-px flex-1 bg-stone-300" />
      </div>

      <Link
        href={`/article/${lead.id}`}
        className="group grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start pb-6 border-b border-stone-200"
      >
        <div className="md:col-span-5 lg:col-span-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200 border border-stone-200">
            <Image
              src={lead.image_url || "/placeholder.svg"}
              alt={leadTitle}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">
            {leadCategory && (
              <span className="font-semibold text-[#7a3030]">
                {leadCategory}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(lead.published_at)}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-slate-950 group-hover:text-slate-700 transition-colors">
            {leadTitle}
          </h1>
          {leadExcerpt && (
            <p className="mt-2.5 text-sm md:text-base text-slate-600 leading-relaxed line-clamp-2 max-w-3xl">
              {leadExcerpt}
            </p>
          )}
        </div>
      </Link>

      {items.length > 0 && (
        <div className="divide-y divide-stone-200">
          {items.map((article) => {
            const title = isArabic ? article.title_ar : article.title_en;
            const excerpt = isArabic ? article.excerpt_ar : article.excerpt_en;
            const category = isArabic
              ? article.category_name_ar
              : article.category_name_en;
            return (
              <Link
                key={`dispatch-${article.id}`}
                href={`/article/${article.id}`}
                className="group grid grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)] gap-4 py-4 items-start"
              >
                <div className="relative h-[72px] sm:h-[84px] w-24 sm:w-28 overflow-hidden bg-stone-200 border border-stone-200">
                  <Image
                    src={article.image_url || "/placeholder.svg"}
                    alt={title}
                    fill
                    sizes="112px"
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
                  <h3 className="text-[15px] md:text-base font-semibold leading-snug text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed line-clamp-1 sm:line-clamp-2">
                      {excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
