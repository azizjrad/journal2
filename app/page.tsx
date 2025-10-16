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
import {
  FeaturedCategorySection,
  FeaturedCategoryArticle,
} from "@/components/featured-category-section";
import { BigStoryArticle } from "@/components/big-story-section";
import { getArticlesByCategory, getAuthorInfo } from "@/lib/db";
import MainLayout from "@/components/main-layout";

export default async function HomePage() {
  // Fetch latest article for each main category and big story
  const [business, culture, politics, science, bigStory] = await Promise.all([
    getArticlesByCategory("business", 1),
    getArticlesByCategory("culture", 1),
    getArticlesByCategory("politics", 1),
    getArticlesByCategory("science", 1),
    getArticlesByCategory("the-big-story", 1),
  ]);

  const featuredCategoryArticles: FeaturedCategoryArticle[] = [
    business[0] && {
      id: business[0].id,
      title: business[0].title_en || business[0].title_ar,
      title_ar: business[0].title_ar || business[0].title_en,
      image_url: business[0].image_url,
      category: "business",
      categoryLabel: "BUSINESS",
      href: `/article/${business[0].id}`,
    },
    culture[0] && {
      id: culture[0].id,
      title: culture[0].title_en || culture[0].title_ar,
      title_ar: culture[0].title_ar || culture[0].title_en,
      image_url: culture[0].image_url,
      category: "culture",
      categoryLabel: "CULTURE",
      href: `/article/${culture[0].id}`,
    },
    politics[0] && {
      id: politics[0].id,
      title: politics[0].title_en || politics[0].title_ar,
      title_ar: politics[0].title_ar || politics[0].title_en,
      image_url: politics[0].image_url,
      category: "politics",
      categoryLabel: "POLITICS",
      href: `/article/${politics[0].id}`,
    },
    science[0] && {
      id: science[0].id,
      title: science[0].title_en || science[0].title_ar,
      title_ar: science[0].title_ar || science[0].title_en,
      image_url: science[0].image_url,
      category: "science",
      categoryLabel: "SCIENCE",
      href: `/article/${science[0].id}`,
    },
  ].filter(Boolean) as FeaturedCategoryArticle[];

  // Prepare big story article for the new section
  let bigStoryArticle = null;
  if (bigStory[0]) {
    let authorName = "";
    if (bigStory[0].author_id) {
      const authorInfo = await getAuthorInfo(bigStory[0].author_id);
      authorName = authorInfo?.name || "";
    }
    bigStoryArticle = {
      id: bigStory[0].id || "",
      title: bigStory[0].title_en || bigStory[0].title_ar,
      title_ar: bigStory[0].title_ar || bigStory[0].title_en,
      image_url: bigStory[0].image_url,
      category: "the-big-story",
      categoryLabel:
        bigStory[0].category_name_en?.toUpperCase() || "THE BIG STORY",
      categoryLabel_ar:
        bigStory[0].category_name_ar?.toUpperCase() ||
        bigStory[0].category_name_en?.toUpperCase() ||
        "THE BIG STORY",
      href: `/article/${bigStory[0].id}`,
      authors: authorName,
      excerpt: bigStory[0].excerpt_en || "",
      excerpt_ar: bigStory[0].excerpt_ar || "",
      content_en: bigStory[0].content_en || "",
      content_ar: bigStory[0].content_ar || "",
    };
  }

  // Try to get featured articles from Redis cache
  let featuredArticlesRaw: ArticleInterface[];
  try {
    const redis = await getRedis();
    const cached = await redis.get("featuredArticles");
    if (cached) {
      featuredArticlesRaw = JSON.parse(cached);
    } else {
      featuredArticlesRaw = await getFeaturedArticlesCached(5);
      await redis.set("featuredArticles", JSON.stringify(featuredArticlesRaw), {
        EX: 60,
      }); // cache for 60s
    }
  } catch (e) {
    // Fallback to DB if Redis fails
    featuredArticlesRaw = await getFeaturedArticlesCached(5);
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
    <MainLayout>
      <div className="min-h-screen bg-stone-100">
        <FixedHeaderWrapper
          categories={categoriesRaw}
          articles={featuredArticlesRaw}
        />
        <div style={{ paddingTop: "140px" }}>
          {/* Space for fixed header */}
          <HomeBreadcrumb />
          {/* Removed duplicate Featured Category Section; now only rendered inside HomeContent */}
          <HomeContent
            featuredArticles={featuredArticles}
            otherArticles={otherArticles}
            recentArticles={recentArticles}
            categories={categories}
            featuredCategoryArticles={featuredCategoryArticles}
            bigStoryArticle={bigStoryArticle}
          />
        </div>
        <Footer categories={categoriesRaw} />
      </div>
    </MainLayout>
  );
}
