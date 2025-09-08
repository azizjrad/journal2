import {
  getArticles,
  getCategoriesCached,
  getRecentArticlesCached,
  getFeaturedArticlesCached,
  type Article,
  type Category,
} from "@/lib/db";
import { FixedHeaderWrapper } from "@/components/fixed-header-wrapper";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Metadata } from "next";
import { NewsPageContent } from "@/components/news-page-content";

export const metadata: Metadata = {
  title: "All News - Digital Journal - الجريدة الرقمية",
  description:
    "Browse all news articles from Digital Journal. Stay updated with the latest breaking news, politics, business, technology, and more from around the world - تصفح جميع الأخبار من الجريدة الرقمية",
  keywords: [
    "news",
    "all articles",
    "latest news",
    "breaking news",
    "digital journal",
    "أخبار",
    "جميع الأخبار",
    "آخر الأخبار",
  ],
  openGraph: {
    title: "All News - Digital Journal",
    description:
      "Browse all news articles from Digital Journal. Latest breaking news and updates from around the world.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All News - Digital Journal",
    description:
      "Browse all news articles from Digital Journal. Latest breaking news and updates from around the world.",
  },
};

interface NewsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

const ARTICLES_PER_PAGE = 24;

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

  const [allArticles, categories, featuredArticles] = await Promise.all([
    getArticles(), // Get all articles
    getCategoriesCached(),
    getFeaturedArticlesCached(5), // Get featured articles for ticker
  ]);

  // Calculate pagination
  const totalArticles = allArticles.length;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
  const paginatedArticles = allArticles.slice(
    offset,
    offset + ARTICLES_PER_PAGE
  );

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "All News" }];

  return (
    <div className="min-h-screen bg-gray-50">
      <FixedHeaderWrapper categories={categories} articles={featuredArticles} />
      <div style={{ paddingTop: "140px" }}>
        {" "}
        {/* Space for fixed header */}
        <Breadcrumb items={breadcrumbItems} />
        <NewsPageContent
          paginatedArticles={paginatedArticles}
          currentPage={currentPage}
          totalPages={totalPages}
          totalArticles={totalArticles}
        />
      </div>

      <Footer categories={categories} />
    </div>
  );
}
