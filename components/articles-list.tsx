"use client";

import { useState } from "react";
import { SearchResultCard } from "@/components/search-result-card";
import { ArticleInterface } from "@/lib/db";

interface ArticlesListProps {
  articles: ArticleInterface[];
  title?: string;
  subtitle?: string;
}

export function ArticlesList({ articles, title, subtitle }: ArticlesListProps) {
  const [displayCount, setDisplayCount] = useState(10);

  const displayedArticles = articles.slice(0, displayCount);
  const hasMore = articles.length > displayCount;

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 10, articles.length));
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          No results found
        </h2>
        <p className="text-gray-600 text-lg">
          Try adjusting your search terms or browse our latest articles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-8">
        {displayedArticles.map((article, index) => (
          <SearchResultCard
            key={`article-${article.id || index}`}
            article={article}
          />
        ))}
      </div>

      {/* More Stories Button */}
      {hasMore && (
        <div className="text-center pt-8">
          <button
            onClick={loadMore}
            className="bg-black text-white px-8 py-3 text-sm font-bold tracking-wider hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95 rounded"
          >
            MORE STORIES
          </button>
        </div>
      )}
    </div>
  );
}
