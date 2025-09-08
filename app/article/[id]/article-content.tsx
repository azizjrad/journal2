"use client";

import { useLanguage } from "@/lib/language-context";
import { Badge } from "@/components/ui/badge";
import { type Article } from "@/lib/db";

interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const { language, t } = useLanguage();

  const getTitle = () => {
    return language === "ar" ? article.title_ar : article.title_en;
  };

  const getContent = () => {
    return language === "ar" ? article.content_ar : article.content_en;
  };

  const getCategoryName = () => {
    return language === "ar"
      ? article.category_name_ar
      : article.category_name_en;
  };

  const getTagName = (tag: any) => {
    return language === "ar" ? tag.name_ar : tag.name_en;
  };

  return (
    <div className="p-6 md:p-10">
      {/* Category Badge */}
      {getCategoryName() && (
        <div className="mb-6">
          <Badge
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm font-semibold"
          >
            {getCategoryName()}
          </Badge>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {t("tags", "Tags:", "العلامات:")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge
                key={tag.slug}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-3 py-1"
              >
                #{getTagName(tag)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Article Content - Single Language */}
      <div
        className={language === "ar" ? "text-right" : ""}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
          {getTitle()}
        </h1>
        <div className="prose prose-lg lg:prose-xl max-w-none text-gray-700 leading-relaxed">
          {getContent()
            .split("\n")
            .map((paragraph: string, index: number) => (
              <p key={index} className="mb-6 text-lg leading-8">
                {paragraph}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
