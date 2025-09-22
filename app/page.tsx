import {
  getArticles,
  getCategoriesCached,
  getFeaturedArticlesCached,
  getRecentArticlesCached,
  ArticleInterface,
  CategoryInterface,
} from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { FixedHeaderWrapper } from "@/components/fixed-header-wrapper";
import { HomeBreadcrumb } from "@/components/home-breadcrumb";
import { HomeContent, Article, Category } from "@/components/home-content";
import { Footer } from "@/components/footer";

export default async function HomePage() {
  // DEBUG: Log featuredArticlesRaw and featuredArticles to troubleshoot empty homepage
  // Remove these logs after debugging
  function debugLog(label: string, data: any) {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] ${label}:`, JSON.stringify(data, null, 2));
  }
  // Try to get featured articles from Redis cache
  let featuredArticlesRaw: ArticleInterface[];
  try {
    const redis = await getRedis();
    const cached = await redis.get("featuredArticles");
    if (cached) {
      featuredArticlesRaw = JSON.parse(cached);
      debugLog("featuredArticlesRaw (from Redis)", featuredArticlesRaw);
    } else {
      featuredArticlesRaw = await getFeaturedArticlesCached(5);
      debugLog("featuredArticlesRaw (from DB)", featuredArticlesRaw);
      await redis.set("featuredArticles", JSON.stringify(featuredArticlesRaw), {
        EX: 60,
      }); // cache for 60s
    }
  } catch (e) {
    // Fallback to DB if Redis fails
    featuredArticlesRaw = await getFeaturedArticlesCached(5);
    debugLog("featuredArticlesRaw (from DB fallback)", featuredArticlesRaw);
  }

  // Other data loads as before
  const [otherArticlesRaw, categoriesRaw, recentArticlesRaw] =
    await Promise.all([
      getArticles(12),
      getCategoriesCached(),
      getRecentArticlesCached(10),
    ]);

  // Convert to minimal types for HomeContent
  function toMinimalArticle(a: ArticleInterface): Article | null {
    if (typeof a.id === "string" && a.id.length > 0) {
      return {
        id: a.id,
        title_en: a.title_en,
        title_ar: a.title_ar,
        excerpt_en: a.excerpt_en,
        excerpt_ar: a.excerpt_ar,
        image_url: a.image_url,
        published_at: a.published_at,
        category_name_en: a.category_name_en,
        category_name_ar: a.category_name_ar,
        category_slug: a.category_slug,
        is_featured: a.is_featured,
      };
    }
    return null;
  }
  function toMinimalCategory(c: CategoryInterface): Category | null {
    if (typeof c.id === "string" && c.id.length > 0) {
      return {
        id: c.id,
        name_en: c.name_en,
        name_ar: c.name_ar,
        slug: c.slug,
      };
    }
    return null;
  }

  const featuredArticles: Article[] = featuredArticlesRaw
    .map(toMinimalArticle)
    .filter((a): a is Article => a !== null);
  debugLog("featuredArticles (final for HomeContent)", featuredArticles);
  const otherArticles: Article[] = otherArticlesRaw
    .map(toMinimalArticle)
    .filter((a): a is Article => a !== null);
  const recentArticles: Article[] = recentArticlesRaw
    .map(toMinimalArticle)
    .filter((a): a is Article => a !== null);
  const categories: Category[] = categoriesRaw
    .map(toMinimalCategory)
    .filter((c): c is Category => c !== null);

  return (
    <div className="min-h-screen bg-stone-100">
      <FixedHeaderWrapper
        categories={categoriesRaw}
        articles={featuredArticlesRaw}
      />
      <div style={{ paddingTop: "140px" }}>
        {/* Space for fixed header */}
        <HomeBreadcrumb />
        <HomeContent
          featuredArticles={featuredArticles}
          otherArticles={otherArticles}
          recentArticles={recentArticles}
          categories={categories}
        />
      </div>
      <Footer categories={categoriesRaw} />
    </div>
  );
}
