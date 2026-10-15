import {
  Article,
  ArticleEngagement,
  ArticleView,
  Category,
  Tag,
} from "../models/Article";
import { Types } from "mongoose";
import { User } from "../models/User";
import { dbConnect } from "./connection";
import { sanitizeInput, validateInput } from "./input-validation";
import { convertDoc } from "./serialization";
import type {
  ArticleInterface,
  ArticleWithAuthor,
  AnalyticsData,
  ArticleViewData,
  SearchFilters,
  SearchSuggestion,
} from "@/lib/content/types";

export async function getArticles(
  limit?: number,
  featured?: boolean,
): Promise<ArticleViewData[]> {
  await dbConnect();

  const query: Record<string, unknown> = { is_published: true };
  if (featured) {
    query.is_featured = true;
  }

  const articlesQuery = Article.find(query)
    .populate("category_id", "name_en name_ar slug")
    .populate("tags", "name_en name_ar slug")
    .sort({ published_at: -1 });

  if (limit) {
    articlesQuery.limit(limit);
  }

  const articles = await articlesQuery.lean();
  const articlesWithCategories = articles.map(
    (article: any): ArticleViewData => {
      const converted = convertDoc<ArticleViewData>(article)!;
      const category = article.category_id;

      return {
        ...converted,
        category_id: category?._id?.toString() ?? converted.category_id,
        category_name_en: category?.name_en,
        category_name_ar: category?.name_ar,
        category_slug: category?.slug,
      };
    },
  );

  return enrichArticlesWithAuthor(articlesWithCategories);
}

export async function getArticleById(
  id: string,
): Promise<ArticleViewData | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const article = await Article.findOne({
    _id: new Types.ObjectId(id),
    is_published: true,
  })
    .populate("category_id", "name_en name_ar slug")
    .populate("tags", "name_en name_ar slug")
    .lean();

  if (!article) return null;

  const converted = convertDoc<ArticleViewData>(article)!;
  const category = (article as any).category_id;
  const articleWithCategory: ArticleViewData = {
    ...converted,
    category_id: category?._id?.toString() ?? converted.category_id,
    category_name_en: category?.name_en,
    category_name_ar: category?.name_ar,
    category_slug: category?.slug,
  };

  const enrichedArticles = await enrichArticlesWithAuthor([
    articleWithCategory,
  ]);
  return enrichedArticles[0];
}

export async function getArticleByIdAdmin(
  id: string,
): Promise<ArticleInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const article = await Article.findById(id)
    .populate("category_id", "name_en name_ar slug")
    .lean();

  if (!article) return null;

  return {
    ...(convertDoc(article) as any),
    image_url: (article as any).image_url,
    category_name_en: (article as any).category_id?.name_en,
    category_name_ar: (article as any).category_id?.name_ar,
    category_slug: (article as any).category_id?.slug,
  };
}

export async function getAllArticlesAdmin(): Promise<ArticleInterface[]> {
  await dbConnect();

  const articles = await Article.find({})
    .populate("category_id", "name_en name_ar slug")
    .sort({ created_at: -1 })
    .lean();

  return articles.map((article) => {
    const converted = convertDoc<ArticleInterface>(article);
    return {
      ...converted,
      category_name_en: article.category_id?.name_en,
      category_name_ar: article.category_id?.name_ar,
      category_slug: article.category_id?.slug,
    } as ArticleInterface;
  });
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit?: number,
): Promise<ArticleViewData[]> {
  await dbConnect();

  const category = await Category.findOne({ slug: categorySlug });
  if (!category) return [];

  const query = Article.find({
    category_id: category._id,
    is_published: true,
  })
    .populate("category_id", "name_en name_ar slug")
    .populate("tags", "name_en name_ar slug")
    .sort({ published_at: -1 });

  if (limit) {
    query.limit(limit);
  }

  const articles = await query.lean();

  return articles.map((article) => {
    const converted = convertDoc<ArticleViewData>(article)!;
    const category = article.category_id as any;
    return {
      ...converted,
      category_id: category?._id?.toString() ?? converted.category_id,
      category_name_en: category?.name_en,
      category_name_ar: category?.name_ar,
      category_slug: category?.slug,
    };
  });
}

export async function searchArticles(
  searchQuery: string,
): Promise<ArticleViewData[]> {
  await dbConnect();

  if (!searchQuery || searchQuery.trim().length < 2) {
    return [];
  }

  const articles = await Article.find({
    is_published: true,
    $text: { $search: searchQuery },
  })
    .populate("category_id", "name_en name_ar slug")
    .populate("tags", "name_en name_ar slug")
    .sort({ score: { $meta: "textScore" } })
    .limit(50)
    .lean();

  const articlesWithCategories = articles.map((article): ArticleViewData => {
    const converted = convertDoc<ArticleViewData>(article)!;
    const category = article.category_id as any;

    return {
      ...converted,
      category_id: category?._id?.toString() ?? converted.category_id,
      category_name_en: category?.name_en,
      category_name_ar: category?.name_ar,
      category_slug: category?.slug,
    };
  });

  return enrichArticlesWithAuthor(articlesWithCategories);
}

export async function advancedSearchArticles(
  filters: SearchFilters,
): Promise<ArticleViewData[]> {
  await dbConnect();

  try {
    const query: Record<string, any> = { is_published: true };

    if (filters.query && filters.query.trim()) {
      query.$text = { $search: filters.query.trim() };
    }

    if (filters.categoryId && Types.ObjectId.isValid(filters.categoryId)) {
      query.category_id = new Types.ObjectId(filters.categoryId);
    }

    if (filters.dateFrom || filters.dateTo) {
      query.published_at = {};
      if (filters.dateFrom) {
        query.published_at.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.published_at.$lte = new Date(filters.dateTo);
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      const validTagIds = filters.tags
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      if (validTagIds.length > 0) {
        query.tags = { $in: validTagIds };
      }
    }

    let sort: any = { published_at: -1 };
    if (filters.sortBy === "date") {
      sort = { published_at: filters.sortOrder === "asc" ? 1 : -1 };
    } else if (
      filters.sortBy === "relevance" &&
      filters.query &&
      filters.query.trim()
    ) {
      sort = { score: { $meta: "textScore" } };
    }

    const articles = await Article.find(query)
      .populate("category_id", "name_en name_ar slug")
      .populate("tags", "name_en name_ar slug")
      .sort(sort)
      .limit(50)
      .lean();

    return articles.map((article) => {
      const converted = convertDoc<ArticleViewData>(article)!;
      const category = article.category_id as any;
      return {
        ...converted,
        category_id: category?._id?.toString() ?? converted.category_id,
        category_name_en: category?.name_en,
        category_name_ar: category?.name_ar,
        category_slug: category?.slug,
      };
    });
  } catch (error) {
    console.error("Error in advancedSearchArticles:", error);
    return [];
  }
}

export async function getSearchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  await dbConnect();

  if (!query || query.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];

  try {
    const articles = await Article.find({
      is_published: true,
      $or: [
        { title_en: { $regex: query, $options: "i" } },
        { title_ar: { $regex: query, $options: "i" } },
      ],
    })
      .select("title_en title_ar")
      .limit(5)
      .lean();

    articles.forEach((article) => {
      if (
        article.title_en &&
        article.title_en.toLowerCase().includes(query.toLowerCase())
      ) {
        suggestions.push({ text: article.title_en, type: "query" });
      }
      if (
        article.title_ar &&
        article.title_ar.toLowerCase().includes(query.toLowerCase())
      ) {
        suggestions.push({ text: article.title_ar, type: "query" });
      }
    });

    const categories = await Category.find({
      $or: [
        { name_en: { $regex: query, $options: "i" } },
        { name_ar: { $regex: query, $options: "i" } },
      ],
    })
      .select("name_en name_ar")
      .limit(3)
      .lean();

    categories.forEach((category) => {
      if (category.name_en)
        suggestions.push({ text: category.name_en, type: "category" });
      if (category.name_ar)
        suggestions.push({ text: category.name_ar, type: "category" });
    });

    const tags = await Tag.find({
      $or: [
        { name_en: { $regex: query, $options: "i" } },
        { name_ar: { $regex: query, $options: "i" } },
      ],
    })
      .select("name_en name_ar")
      .limit(3)
      .lean();

    tags.forEach((tag) => {
      if (tag.name_en) suggestions.push({ text: tag.name_en, type: "tag" });
      if (tag.name_ar) suggestions.push({ text: tag.name_ar, type: "tag" });
    });
  } catch (error) {
    console.error("Error getting search suggestions:", error);
  }

  return suggestions;
}

export async function getPopularSearches(): Promise<SearchSuggestion[]> {
  return [
    { text: "Politics", type: "query", count: 156 },
    { text: "سياسة", type: "query", count: 134 },
    { text: "Sports", type: "query", count: 98 },
    { text: "رياضة", type: "query", count: 87 },
    { text: "Economy", type: "query", count: 76 },
    { text: "اقتصاد", type: "query", count: 65 },
  ];
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (await Article.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createArticle(
  article: Omit<ArticleInterface, "_id" | "id" | "created_at" | "updated_at">,
) {
  await dbConnect();

  if (!article.title_en || !article.title_ar) {
    throw new Error("Title in both languages is required");
  }
  if (!article.content_en || !article.content_ar) {
    throw new Error("Content in both languages is required");
  }

  if (!article.excerpt_en || article.excerpt_en.trim() === "") {
    article.excerpt_en = article.content_en.substring(0, 150) + "...";
  }
  if (!article.excerpt_ar || article.excerpt_ar.trim() === "") {
    article.excerpt_ar = article.content_ar.substring(0, 150) + "...";
  }
  if (!article.slug || article.slug.trim() === "") {
    article.slug = await generateUniqueSlug(article.title_en);
  }

  const textFields = [
    article.title_en,
    article.title_ar,
    article.excerpt_en,
    article.excerpt_ar,
    article.meta_description_en || "",
    article.meta_description_ar || "",
    article.meta_keywords_en || "",
    article.meta_keywords_ar || "",
    article.slug || "",
  ];

  for (const field of textFields) {
    if (field && !validateInput(field)) {
      throw new Error(
        "Invalid input detected - contains potentially malicious content",
      );
    }
  }

  if (!Types.ObjectId.isValid(article.category_id)) {
    console.error("Invalid category ID provided:", article.category_id);
    throw new Error("Invalid category ID");
  }
  if (article.author_id && !Types.ObjectId.isValid(article.author_id)) {
    console.error("Invalid author ID provided:", article.author_id);
    throw new Error("Invalid author ID");
  }

  try {
    const sanitizedArticle = {
      ...article,
      title_en: sanitizeInput(article.title_en),
      title_ar: sanitizeInput(article.title_ar),
      excerpt_en: sanitizeInput(article.excerpt_en),
      excerpt_ar: sanitizeInput(article.excerpt_ar),
      meta_description_en: article.meta_description_en
        ? sanitizeInput(article.meta_description_en)
        : undefined,
      meta_description_ar: article.meta_description_ar
        ? sanitizeInput(article.meta_description_ar)
        : undefined,
      meta_keywords_en: article.meta_keywords_en
        ? sanitizeInput(article.meta_keywords_en)
        : undefined,
      meta_keywords_ar: article.meta_keywords_ar
        ? sanitizeInput(article.meta_keywords_ar)
        : undefined,
      slug: sanitizeInput(article.slug),
      category_id: new Types.ObjectId(article.category_id),
      author_id: article.author_id
        ? new Types.ObjectId(article.author_id)
        : undefined,
    };

    const result = await Article.create(sanitizedArticle);
    return convertDoc(result);
  } catch (mongoError: any) {
    console.error("MongoDB error during article creation:", mongoError);
    if (mongoError.code === 11000) {
      throw new Error("Article with this title already exists");
    }
    throw new Error(`Database error: ${mongoError.message}`);
  }
}

export async function updateArticle(
  id: string,
  article: Partial<ArticleInterface>,
) {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid article ID");
  }

  const textFields = [
    article.title_en,
    article.title_ar,
    article.content_en,
    article.content_ar,
    article.excerpt_en,
    article.excerpt_ar,
    article.meta_description_en,
    article.meta_description_ar,
    article.meta_keywords_en,
    article.meta_keywords_ar,
    article.slug,
  ].filter(Boolean);

  for (const field of textFields) {
    if (field && !validateInput(field)) {
      throw new Error(
        "Invalid input detected - contains potentially malicious content",
      );
    }
  }

  if (article.category_id && !Types.ObjectId.isValid(article.category_id)) {
    throw new Error("Invalid category ID");
  }

  const sanitizedArticle: any = { ...article };
  if (article.title_en)
    sanitizedArticle.title_en = sanitizeInput(article.title_en);
  if (article.title_ar)
    sanitizedArticle.title_ar = sanitizeInput(article.title_ar);
  if (article.excerpt_en)
    sanitizedArticle.excerpt_en = sanitizeInput(article.excerpt_en);
  if (article.excerpt_ar)
    sanitizedArticle.excerpt_ar = sanitizeInput(article.excerpt_ar);
  if (article.meta_description_en)
    sanitizedArticle.meta_description_en = sanitizeInput(
      article.meta_description_en,
    );
  if (article.meta_description_ar)
    sanitizedArticle.meta_description_ar = sanitizeInput(
      article.meta_description_ar,
    );
  if (article.meta_keywords_en)
    sanitizedArticle.meta_keywords_en = sanitizeInput(article.meta_keywords_en);
  if (article.meta_keywords_ar)
    sanitizedArticle.meta_keywords_ar = sanitizeInput(article.meta_keywords_ar);
  if (article.slug) sanitizedArticle.slug = sanitizeInput(article.slug);
  if (article.category_id)
    sanitizedArticle.category_id = new Types.ObjectId(article.category_id);

  const result = await Article.findByIdAndUpdate(id, sanitizedArticle, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new Error("Article not found");
  }

  return convertDoc(result);
}

export async function deleteArticle(id: string): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid article ID");
  }

  const result = await Article.findByIdAndDelete(id);
  if (!result) {
    throw new Error("Article not found");
  }

  return true;
}

export async function trackArticleView(
  articleId: string,
  ipAddress: string,
  userAgent?: string,
  referer?: string,
  sessionId?: string,
): Promise<void> {
  await dbConnect();

  try {
    if (!Types.ObjectId.isValid(articleId)) {
      return;
    }

    await ArticleView.create({
      article_id: new Types.ObjectId(articleId),
      ip_address: ipAddress,
      user_agent: userAgent,
      referer,
      session_id: sessionId,
    });

    await Article.findByIdAndUpdate(articleId, { $inc: { view_count: 1 } });
  } catch (error) {
    console.error("Error tracking article view:", error);
  }
}

export async function trackArticleEngagement(
  articleId: string,
  engagementType: string,
  ipAddress: string,
  userAgent?: string,
  platform?: string,
): Promise<void> {
  await dbConnect();

  try {
    if (!Types.ObjectId.isValid(articleId)) {
      return;
    }

    await ArticleEngagement.create({
      article_id: new Types.ObjectId(articleId),
      engagement_type: engagementType,
      ip_address: ipAddress,
      user_agent: userAgent,
      platform,
    });

    await Article.findByIdAndUpdate(articleId, {
      $inc: { engagement_count: 1 },
    });
  } catch (error: any) {
    if (error && error.errors) {
      console.error("Error tracking article engagement:", {
        message: error.message,
        errors: error.errors,
        articleId,
        engagementType,
        ipAddress,
        userAgent,
        platform,
      });
    } else {
      console.error("Error tracking article engagement:", error);
    }
  }
}

export async function getAnalyticsData(
  days: number = 30,
): Promise<AnalyticsData> {
  await dbConnect();

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalViews, totalEngagements] = await Promise.all([
      ArticleView.countDocuments({ viewed_at: { $gte: startDate } }),
      ArticleEngagement.countDocuments({ created_at: { $gte: startDate } }),
    ]);

    const popularArticles = await Article.find({ is_published: true })
      .populate("category_id", "name_en name_ar")
      .sort({ view_count: -1 })
      .limit(10)
      .lean();

    const categoryStats = await Article.aggregate([
      { $match: { is_published: true } },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category_id",
          name: { $first: "$category.name_en" },
          count: { $sum: "$view_count" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timelineDates = Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - 1 - index));
      return date;
    });

    const viewsAgg = await ArticleView.aggregate([
      { $match: { viewed_at: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$viewed_at" },
          },
          views: { $sum: 1 },
        },
      },
    ]);
    const viewsMap = Object.fromEntries(
      viewsAgg.map((view) => [view._id, view.views]),
    );
    const viewsTimeline = timelineDates.map((date) => {
      const dateString = date.toISOString().slice(0, 10);
      return { date: dateString, views: viewsMap[dateString] || 0 };
    });

    const engagementAgg = await ArticleEngagement.aggregate([
      { $match: { created_at: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
          },
          engagements: { $sum: 1 },
        },
      },
    ]);
    const engagementMap = Object.fromEntries(
      engagementAgg.map((entry) => [entry._id, entry.engagements]),
    );
    const engagementTimeline = timelineDates.map((date) => {
      const dateString = date.toISOString().slice(0, 10);
      return {
        date: dateString,
        engagements: engagementMap[dateString] || 0,
      };
    });

    return {
      totalViews,
      totalEngagements,
      popularArticles: popularArticles.map((article) => {
        const converted = convertDoc<ArticleInterface>(article);
        return {
          ...converted,
          category_name_en: article.category_id?.name_en,
          category_name_ar: article.category_id?.name_ar,
        } as ArticleInterface;
      }),
      popularCategories: categoryStats.map((category) => ({
        name: category.name,
        count: category.count,
        category_id: category._id.toString(),
      })),
      viewsTimeline,
      engagementTimeline,
      recentActivity: [],
    };
  } catch (error) {
    console.error("Error getting analytics data:", error);
    throw error;
  }
}

export async function getSitemapEntries(): Promise<any[]> {
  await dbConnect();

  try {
    const articles = await Article.find({ is_published: true })
      .populate("category_id", "slug")
      .select("title_en title_ar published_at updated_at category_id")
      .sort({ published_at: -1 })
      .lean();

    const categories = await Category.find({}).select("slug updated_at").lean();
    const sitemapEntries = [
      {
        url: "/",
        last_modified: new Date().toISOString(),
        change_frequency: "daily",
        priority: 1.0,
      },
      ...articles.map((article) => ({
        url: `/article/${article._id}`,
        last_modified: new Date(
          article.updated_at || article.published_at,
        ).toISOString(),
        change_frequency: "weekly",
        priority: 0.8,
      })),
      ...categories.map((category) => ({
        url: `/category/${category.slug}`,
        last_modified: new Date(
          category.updated_at || new Date(),
        ).toISOString(),
        change_frequency: "daily",
        priority: 0.7,
      })),
      {
        url: "/news",
        last_modified: new Date().toISOString(),
        change_frequency: "weekly",
        priority: 0.9,
      },
      {
        url: "/search",
        last_modified: new Date().toISOString(),
        change_frequency: "weekly",
        priority: 0.6,
      },
    ];

    return sitemapEntries;
  } catch (error) {
    console.error("Error generating sitemap entries:", error);
    return [];
  }
}

export async function getAuthorInfo(authorId: string): Promise<{
  name: string;
  role: string;
} | null> {
  try {
    await dbConnect();

    const user = await User.findById(authorId).select(
      "first_name last_name role username",
    );

    if (!user) {
      return null;
    }

    let name = "Author";
    if (user.role === "writer") {
      const firstName = user.first_name || "";
      const lastName = user.last_name || "";
      name = `${firstName} ${lastName}`.trim() || user.username || "Writer";
    }

    return { name, role: user.role };
  } catch (error) {
    console.error("Error getting author info:", error);
    return null;
  }
}

export async function enrichArticlesWithAuthor<
  T extends { author_id?: string },
>(
  articles: T[],
): Promise<Array<T & { author_name?: string; author_role?: string }>> {
  return Promise.all(
    articles.map(async (article) => {
      if (!article.author_id) {
        return article;
      }

      const authorInfo = await getAuthorInfo(article.author_id);
      return {
        ...article,
        author_name: authorInfo?.name,
        author_role: authorInfo?.role,
      };
    }),
  );
}
