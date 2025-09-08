import {
  getArticles,
  getArticlesByCategory,
  getCategoryBySlug,
  getCategories,
  getCategoriesCached,
  getArticlesByCategoryCached,
  getRecentArticlesCached,
  getFeaturedArticlesCached,
} from "@/lib/db";
import Header from "@/components/header";
import { BreakingNewsTicker } from "@/components/breaking-news-ticker";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const [articles, category, categories, featuredArticles] = await Promise.all([
    getArticlesByCategoryCached(resolvedParams.slug),
    getCategoryBySlug(resolvedParams.slug),
    getCategoriesCached(),
    getFeaturedArticlesCached(5), // Get featured articles for ticker
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      <BreakingNewsTicker articles={featuredArticles} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category.name_en}</h1>
          <h2 className="text-2xl font-bold text-muted-foreground" dir="rtl">
            {category.name_ar}
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No articles found in this category.
            </p>
          </div>
        )}
      </main>
      <Footer categories={categories} />
    </div>
  );
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const categories = await getCategoriesCached();
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Add metadata generation for categories
export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const resolvedParams = await params;
    const category = await getCategoryBySlug(resolvedParams.slug);
    if (!category) {
      return {
        title: "Category Not Found",
      };
    }
    return {
      title: `${category.name_en} | ${category.name_ar}`,
      description: category.meta_description_en || category.name_en,
    };
  } catch (error) {
    return {
      title: "Category",
    };
  }
}
