import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

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

export function FeaturedCategorySection({ articles, small }: Props) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  // Ultra-compact style for homepage
  return (
    <section className="w-full border-b border-gray-300 my-20">
      <div className="flex flex-row gap-4 justify-between items-stretch py-0.5 mb-4 sm:flex-row sm:gap-4 sm:justify-between sm:items-stretch">
        {articles.map((article, idx) => (
          <React.Fragment key={article.id}>
            <div className="flex-1 min-w-[320px] transition-all duration-300 rounded-xl hover:bg-gray-200/50 group py-4 hover:px-5 sm:min-w-[320px] sm:pr-1 sm:py-4 sm:px-2 sm:hover:px-5 px-2">
              <Link href={article.href} className="block group">
                <div className="flex flex-row items-start w-full">
                  <div className="flex flex-col flex-1 min-w-0 justify-start">
                    <div className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
                      {article.categoryLabel}
                    </div>
                    <div className="font-bold text-gray-900 group-hover:text-red-600 line-clamp-3 text-[15px] mt-0 leading-[1.1] transition-colors duration-300">
                      {isArabic
                        ? article.title_ar || article.title
                        : article.title}
                    </div>
                  </div>
                  {article.image_url && (
                    <div className="flex-shrink-0 ml-2">
                      <Image
                        src={article.image_url}
                        alt={
                          isArabic
                            ? article.title_ar || article.title
                            : article.title
                        }
                        width={100}
                        height={65}
                        className="object-cover rounded-lg border border-gray-200 w-[100px] h-[65px] group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                </div>
              </Link>
            </div>
            {/* Separator: vertical on desktop, horizontal on mobile */}
            {idx < articles.length - 1 && (
              <div className="w-full h-px bg-gray-300 my-0.5 rounded-full sm:w-px sm:h-auto sm:self-stretch sm:mx-2 sm:my-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
