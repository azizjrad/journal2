"use client";

import { useLanguage } from "@/lib/context/language-context";
import { Badge } from "@/components/ui/badge";
import type { ArticleTag, ArticleViewData } from "@/lib/content/types";

interface ArticleContentProps {
  article: ArticleViewData;
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

  const getTagName = (tag: ArticleTag) => {
    return language === "ar" ? tag.name_ar : tag.name_en;
  };

  return (
    <div className="p-6 md:p-10">
      {/* Category Badge */}
      {getCategoryName() && (
        <div className="mb-6">
          <Badge
            variant="outline"
            className="border-stone-300 text-slate-700 bg-[#f8f7f4] hover:bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm"
          >
            {getCategoryName()}
          </Badge>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-8 pb-5 border-b border-stone-200">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
            {t("tags", "Tags", "العلامات")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge
                key={tag.slug}
                variant="outline"
                className="border-stone-300 text-slate-600 hover:bg-stone-50 text-xs px-2.5 py-0.5 rounded-sm font-normal"
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
        <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold mb-8 leading-tight tracking-tight text-slate-900 max-w-3xl">
          {getTitle()}
        </h1>
        <div className="max-w-3xl text-slate-700 leading-relaxed">
          {getContent()
            .split("\n")
            .filter((paragraph: string) => paragraph.trim().length > 0)
            .map((paragraph: string, index: number) => (
              <p key={index} className="mb-6 text-[17px] md:text-lg leading-8">
                {paragraph}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
