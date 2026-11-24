"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/context/language-context";
import { HeroSection } from "@/components/home/hero-section";
import { LatestNewsSection } from "@/components/home/latest-news-section";
import {
  FeaturedCategorySection,
  FeaturedCategoryArticle,
} from "@/components/articles/featured-category-section";
import BigStorySection, {
  BigStoryArticle,
} from "@/components/articles/big-story-section";

export interface Article {
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

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
}

interface HomeContentProps {
  featuredArticles: Article[];
  otherArticles: Article[];
  recentArticles: Article[];
  latestArticles?: Article[];
  categories: Category[];
  featuredCategoryArticles?: FeaturedCategoryArticle[];
  bigStoryArticle?: BigStoryArticle | null;
}

const MemoizedHeroSection = memo(HeroSection);
const MemoizedLatestNewsSection = memo(LatestNewsSection);

function LatestSidebar({ articles }: { articles: Article[] }) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";

  if (!articles.length) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? "ar-TN" : "en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <div className="border border-stone-200 bg-white/70 rounded-md p-4 md:p-5">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600">
            {t("latest", "Latest", "الأحدث")}
          </h2>
          <div className="h-px flex-1 bg-stone-300" />
        </div>
        <div className="divide-y divide-stone-200">
          {articles.map((article, index) => {
            const title = isArabic ? article.title_ar : article.title_en;
            const category = isArabic ? article.category_name_ar : article.category_name_en;
            return (
              <Link
                key={`latest-${article.id}`}
                href={`/article/${article.id}`}
                className="group flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden bg-stone-200 border border-stone-200">
                  <Image
                    src={article.image_url || "/placeholder.svg"}
                    alt={title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    <span className="font-semibold text-[#7a3030]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {category && <span className="truncate max-w-[10rem]">{category}</span>}
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <h3 className="text-sm font-medium leading-snug text-slate-900 group-hover:text-[#7a3030] transition-colors line-clamp-2">
                    {title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          href="/news"
          className="mt-4 inline-flex text-xs font-medium uppercase tracking-[0.12em] text-[#7a3030] hover:text-[#632626]"
        >
          {t("view_all_news", "View all", "عرض الكل")}
        </Link>
      </div>
    </aside>
  );
}

function HomeContentComponent({
  featuredArticles,
  otherArticles,
  recentArticles,
  latestArticles = [],
  categories,
  featuredCategoryArticles = [],
  bigStoryArticle = null,
}: HomeContentProps) {
  const seen = new Set<string>();
  const uniqueById = (arr: Article[]) => {
    const out: Article[] = [];
    for (const a of arr) {
      if (!a?.id || seen.has(a.id)) continue;
      seen.add(a.id);
      out.push(a);
    }
    return out;
  };

  const primaryPool = uniqueById([...featuredArticles, ...recentArticles]);
  const lead = primaryPool[0];
  const indexList = primaryPool.slice(1, 7);
  const moreDispatches = uniqueById(otherArticles).slice(0, 6);

  const latestSeen = new Set<string>();
  const latestSix = (latestArticles.length ? latestArticles : recentArticles)
    .filter((a) => {
      if (!a?.id || latestSeen.has(a.id)) return false;
      latestSeen.add(a.id);
      return true;
    })
    .slice(0, 6);

  return (
    <main className="bg-[#f8f7f4]">
      <div className="container mx-auto px-4 lg:px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3">
            <LatestSidebar articles={latestSix} />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9 min-w-0">
            <MemoizedHeroSection lead={lead} items={indexList} />
          </div>
        </div>
      </div>

      {bigStoryArticle && (
        <div className="container mx-auto px-4 lg:px-6 py-8 md:py-10 border-t border-stone-200">
          <BigStorySection article={bigStoryArticle} />
        </div>
      )}

      {featuredCategoryArticles.length > 0 && (
        <div className="container mx-auto px-4 lg:px-6 py-8 md:py-10 border-t border-stone-200">
          <FeaturedCategorySection articles={featuredCategoryArticles} />
        </div>
      )}

      {moreDispatches.length > 0 && (
        <div className="border-t border-stone-200">
          <MemoizedLatestNewsSection articles={moreDispatches} />
        </div>
      )}
    </main>
  );
}

export const HomeContent = memo(HomeContentComponent);
