"use client";

import { useLanguage } from "@/lib/context/language-context";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ArticleInterface } from "@/lib/content/types";
import { getAuthorDisplayText } from "@/lib/utils/author-utils";

interface SearchResultCardProps {
  article: ArticleInterface & {
    author_name?: string;
    author_role?: string;
  };
}

export function SearchResultCard({ article }: SearchResultCardProps) {
  const { language, t } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === "ar"
      ? date.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
      : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const title = language === "ar" ? article.title_ar : article.title_en;
  const excerpt = language === "ar" ? article.excerpt_ar : article.excerpt_en;
  const categoryName = language === "ar" ? article.category_name_ar : article.category_name_en;

  return (
    <article className="border-b border-stone-200 pb-8 last:border-b-0">
      <Link href={`/article/${article.id}`} className="group block">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-32 relative overflow-hidden bg-stone-100 rounded-md border border-stone-200">
            <Image
              src={article.image_url || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          </div>
          <div className="flex-1 min-w-0">
            {categoryName && (
              <div className="mb-2.5">
                <Badge variant="secondary" className="bg-stone-100 text-slate-700 hover:bg-stone-100 text-[11px] font-medium uppercase tracking-[0.12em] rounded-sm">
                  {categoryName}
                </Badge>
              </div>
            )}
            <h2 className="text-lg md:text-xl font-semibold text-slate-950 mb-2 line-clamp-2 group-hover:text-[#7a3030] transition-colors">
              {title}
            </h2>
            <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed mb-3 line-clamp-2 md:line-clamp-3">{excerpt}</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 text-xs md:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium tracking-wide">
                  {article.author_role && article.author_name
                    ? getAuthorDisplayText(article.author_role, article.author_name)
                    : t("by_author", "By Author", "بقلم الكاتب")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}