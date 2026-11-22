"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/context/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { memo } from "react";
import { getAuthorDisplayText } from "@/lib/utils/author-utils";
import { ReportButton } from "@/components/shared/report-button";
import type { ArticleCardData } from "@/lib/content/types";

interface ArticleCardProps {
  article: ArticleCardData;
  featured?: boolean;
}

export const ArticleCard = memo(function ArticleCard({
  article,
  featured = false,
}: ArticleCardProps) {
  const { language } = useLanguage();

  const title = language === "ar" ? article.title_ar : article.title_en;
  const excerpt = language === "ar" ? article.excerpt_ar : article.excerpt_en;
  const categoryName =
    language === "ar" ? article.category_name_ar : article.category_name_en;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === "ar"
      ? date.toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  if (featured) {
    return (
      <Card className="overflow-hidden border border-stone-200 shadow-none rounded-none bg-white group">
        <Link href={`/article/${article.id}`} className="block" prefetch={true}>
          <div className="relative aspect-[16/10] bg-stone-200 border-b border-stone-200">
            <Image
              src={article.image_url || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={featured}
            />
          </div>
          <CardContent className="p-5 md:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              {categoryName && (
                <span className="font-semibold text-slate-700 border border-stone-300 px-2 py-0.5 bg-[#f8f7f4]">
                  {categoryName}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 line-clamp-3 leading-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              {title}
            </h2>
            <p className="text-sm md:text-[15px] text-slate-600 line-clamp-3 leading-relaxed mb-4">
              {excerpt}
            </p>
            {article.author_role && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="h-3.5 w-3.5" />
                <span>{getAuthorDisplayText(article.author_role, article.author_name)}</span>
              </div>
            )}
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-none rounded-none bg-transparent group h-full">
      <Link href={`/article/${article.id}`} className="block h-full" prefetch={true}>
        <div className="relative aspect-[16/10] bg-stone-200 border border-stone-200 mb-3 overflow-hidden">
          <Image
            src={article.image_url || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <CardContent className="p-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            {categoryName && <span className="font-semibold text-slate-700">{categoryName}</span>}
            {categoryName && <span className="text-stone-300">•</span>}
            <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
          </div>
          <h3 className="font-semibold text-[17px] mb-2 line-clamp-3 leading-snug text-slate-900 group-hover:text-slate-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mb-3 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.slug}
                  className="inline-block border border-stone-200 text-[11px] text-slate-600 px-2 py-0.5 bg-white"
                >
                  #{tag.name_en}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-stone-200">
            <div className="flex items-center gap-1.5">
              {article.author_role && (
                <>
                  <User className="h-3.5 w-3.5" />
                  <span>{getAuthorDisplayText(article.author_role, article.author_name)}</span>
                </>
              )}
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <ReportButton
                articleId={article.id.toString()}
                articleTitle={title}
                variant="icon"
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
});
