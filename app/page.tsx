import {
  getArticles,
  getCategories,
  getCategoriesCached,
  getFeaturedArticlesCached,
  getRecentArticlesCached,
} from "@/lib/db";
import { FixedHeaderWrapper } from "@/components/fixed-header-wrapper";
import { HomeBreadcrumb } from "@/components/home-breadcrumb";
import { HomeContent } from "@/components/home-content";
import { Footer } from "@/components/footer";

export default async function HomePage() {
  const [otherArticles, featuredArticles, categories, recentArticles] =
    await Promise.all([
      getArticles(12), // Get more regular articles
      getFeaturedArticlesCached(5), // Get 5 featured articles for hero and ticker
      getCategoriesCached(),
      getRecentArticlesCached(10), // Get recent articles (keeping for potential future use)
    ]);

  return (
    <div className="min-h-screen bg-stone-100">
      <FixedHeaderWrapper
        categories={categories
          .filter((cat) => typeof cat.id === "string" && cat.id !== undefined)
          .map((cat) => ({
            ...cat,
            id: Number(cat.id),
          }))}
        articles={featuredArticles
          .filter(
            (article) =>
              typeof article.id === "string" && article.id !== undefined
          )
          .map((article) => ({
            ...article,
            id: Number(article.id),
          }))}
      />
      <div style={{ paddingTop: "140px" }}>
        {" "}
        {/* Space for fixed header */}
        <HomeBreadcrumb />
        <HomeContent
          featuredArticles={featuredArticles}
          otherArticles={otherArticles}
          recentArticles={recentArticles}
          categories={categories}
        />
      </div>
      <Footer categories={categories} />
    </div>
  );
}
