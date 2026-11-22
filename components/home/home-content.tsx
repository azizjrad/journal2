"use client";

import { memo } from "react";
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
  categories: Category[];
  featuredCategoryArticles?: FeaturedCategoryArticle[];
  bigStoryArticle?: BigStoryArticle | null;
}

const MemoizedHeroSection = memo(HeroSection);
const MemoizedLatestNewsSection = memo(LatestNewsSection);

function HomeContentComponent({
  featuredArticles,
  otherArticles,
  recentArticles,
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

  return (
    <main className="bg-[#f8f7f4]">
      <MemoizedHeroSection lead={lead} items={indexList} />

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
