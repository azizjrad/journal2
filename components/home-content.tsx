"use client";

import { memo } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { LatestNewsSection } from "@/components/home/latest-news-section";
import {
  FeaturedCategorySection,
  FeaturedCategoryArticle,
} from "@/components/featured-category-section";
import BigStorySection, {
  BigStoryArticle,
} from "@/components/big-story-section";

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

// Memoized child components for better performance
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
  return (
    <main className="bg-stone-100">
      {/* Hero Section with Breaking News and Featured Stories */}
      <MemoizedHeroSection
        featuredArticles={featuredArticles}
        recentArticles={recentArticles}
      />

      {/* Big Story Section (above featured categories) */}
      {bigStoryArticle && (
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <BigStorySection article={bigStoryArticle} />
        </div>
      )}

      {/* Featured Category Section (smaller, under big story, before latest news) */}
      {featuredCategoryArticles.length > 0 && (
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <FeaturedCategorySection articles={featuredCategoryArticles} small />
        </div>
      )}

      {/* Latest News Grid */}
      <MemoizedLatestNewsSection articles={otherArticles} />
    </main>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export const HomeContent = memo(HomeContentComponent);
