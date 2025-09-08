"use client";

import { useLanguage } from "@/lib/language-context";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArticleInterface } from "@/lib/db";
import { getAuthorDisplayText } from "@/lib/author-utils";

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

  const title = language === "ar" ? article.title_ar : article.title_en;
  const excerpt = language === "ar" ? article.excerpt_ar : article.excerpt_en;
  const categoryName =
    language === "ar" ? article.category_name_ar : article.category_name_en;

  return (
    <article className="border-b border-gray-200 pb-8 last:border-b-0">
      <Link href={`/article/${article.id}`} className="group block">
        <div className="flex gap-6">
          {/* Article Image */}
          <div className="flex-shrink-0 w-48 h-32 relative overflow-hidden bg-gray-100 rounded-lg">
            <Image
              src={article.image_url || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            {categoryName && (
              <div className="mb-3">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium uppercase tracking-wide"
                >
                  {categoryName}
                </Badge>
              </div>
            )}

            {/* Article Title */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
              {title}
            </h2>

            {/* Article Excerpt */}
            <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3">
              {excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {/* Author */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium uppercase tracking-wide">
                  {article.author_role && article.author_name
                    ? getAuthorDisplayText(
                        article.author_role,
                        article.author_name
                      )
                    : t("by_author", "BY AUTHOR", "بقلم الكاتب")}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time
                  dateTime={article.published_at}
                  className="uppercase tracking-wide"
                >
                  {formatDate(article.published_at)}
                </time>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
