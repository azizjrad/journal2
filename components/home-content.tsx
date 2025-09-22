"use client";

import { memo } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { LatestNewsSection } from "@/components/home/latest-news-section";

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
}

// Memoized child components for better performance
const MemoizedHeroSection = memo(HeroSection);
const MemoizedLatestNewsSection = memo(LatestNewsSection);

function HomeContentComponent({
  featuredArticles,
  otherArticles,
  recentArticles,
  categories,
}: HomeContentProps) {
  return (
    <main className="bg-stone-100">
      {/* Hero Section with Breaking News and Featured Stories */}
      <MemoizedHeroSection
        featuredArticles={featuredArticles}
        recentArticles={recentArticles}
      />

      {/* Latest News Grid */}
      <MemoizedLatestNewsSection articles={otherArticles} />
    </main>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export const HomeContent = memo(HomeContentComponent);
