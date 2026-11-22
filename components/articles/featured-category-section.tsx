import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/context/language-context";

export interface FeaturedCategoryArticle {
  id: string;
  title: string;
  title_ar?: string;
  image_url: string;
  category: string;
  categoryLabel: string;
  href: string;
}

interface Props {
  articles: FeaturedCategoryArticle[];
  small?: boolean;
}

export function FeaturedCategorySection({ articles }: Props) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <section className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600">
          {isArabic ? "ملفات مختارة" : "Selected Coverage"}
        </h2>
        <div className="h-px flex-1 bg-stone-300" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
        {articles.map((article) => (
          <Link key={article.id} href={article.href} className="group block">
            <div className="flex gap-3 items-start">
              {article.image_url && (
                <div className="relative flex-shrink-0 w-[72px] h-[72px] bg-stone-200 border border-stone-200 overflow-hidden">
                  <Image
                    src={article.image_url}
                    alt={isArabic ? article.title_ar || article.title : article.title}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#7a3030] mb-1">
                  {article.categoryLabel}
                </div>
                <div className="font-medium text-slate-900 group-hover:text-slate-700 line-clamp-3 text-sm leading-snug transition-colors">
                  {isArabic ? article.title_ar || article.title : article.title}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
