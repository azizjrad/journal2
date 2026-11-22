import {
  getCategoriesCached,
  getCategoryBySlug,
} from "@/lib/services/category-service";
import {
  getArticlesByCategoryCached,
} from "@/lib/content/article-service";
import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CategoryPageView } from "@/components/articles/category-page-view";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const [articles, category, categories] = await Promise.all([
    getArticlesByCategoryCached(resolvedParams.slug),
    getCategoryBySlug(resolvedParams.slug),
    getCategoriesCached(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <Header categories={categories} />
      <CategoryPageView
        category={{ name_en: category.name_en, name_ar: category.name_ar }}
        articles={articles}
      />
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