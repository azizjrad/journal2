import { getCategoriesCached } from "@/lib/services/category-service";
import {
  getArticles,
  getFeaturedArticlesCached,
} from "@/lib/content/article-service";
import { FixedHeaderWrapper } from "@/components/layout/fixed-header-wrapper";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { Metadata } from "next";
import { NewsPageContent } from "@/components/shared/news-page-content";

// Enable ISR with revalidation
export const revalidate = 60;

// Dynamic rendering for pagination
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Dispatches - The Maghreb Corridor",
  description:
    "Browse all dispatches and briefings from The Maghreb Corridor, sorted by publication date.",
  keywords: [
    "dispatches",
    "all dispatches",
    "latest dispatches",
    "briefings",
    "The Maghreb Corridor",
    "جميع التقارير",
    "تقارير",
  ],
  openGraph: {
    title: "All Dispatches - The Maghreb Corridor",
    description:
      "Browse all dispatches and briefings from The Maghreb Corridor, sorted by publication date.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Dispatches - The Maghreb Corridor",
    description:
      "Browse all dispatches and briefings from The Maghreb Corridor, sorted by publication date.",
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

  const [allArticles, categories] = await Promise.all([
    getArticles(), // Get all articles
    getCategoriesCached(),
  ]);

  // Calculate pagination
  const totalArticles = allArticles.length;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
  const paginatedArticles = allArticles.slice(
    offset,
    offset + ARTICLES_PER_PAGE,
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "All Dispatches" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <FixedHeaderWrapper categories={categories} />
      <div style={{ paddingTop: "208px" }}>
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