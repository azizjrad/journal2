"use client";

import { useLanguage } from "@/lib/language-context";
import { ShareButtons } from "@/components/share-buttons";

interface ShareButtonsSectionProps {
  article: {
    id?: string | number;
    title_en: string;
    title_ar: string;
  };
}

export function ShareButtonsSection({ article }: ShareButtonsSectionProps) {
  const { language, t } = useLanguage();

  const getTitle = () => {
    return language === "ar" ? article.title_ar : article.title_en;
  };

  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {t("shareArticle", "Share this article", "شارك هذا المقال")}
      </h3>
      <ShareButtons
        title={getTitle()}
        url={`$${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/article/${article.id}`}
        articleId={article.id?.toString()}
      />
    </>
  );
}
