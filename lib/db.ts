import { unstable_cache } from "next/cache";
import mongoose from "mongoose";
import {
  User,
  UserProfile,
  UserSession,
  PasswordResetToken,
  EmailVerificationToken,
  UserActivityLog,
  NewsletterSubscription,
} from "./models/User";
import {
  Article,
  Category,
  Tag,
  ScheduledArticle,
  ArticleView,
  ArticleEngagement,
  Setting,
  SitemapEntry,
  Report,
} from "./models/Article";
import Contact, { ContactInterface } from "./models/Contact";
import { Types } from "mongoose";

// Direct database connection function
export async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI!;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Use global variable to avoid multiple connections
  if ((global as any).mongoose?.conn) {
    return (global as any).mongoose.conn;
  }

  if (!(global as any).mongoose) {
    (global as any).mongoose = { conn: null, promise: null };
  }

  if (!(global as any).mongoose.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: process.env.NODE_ENV === "production" ? 5 : 10, // Limit connections in production
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 30000, // 30 seconds
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      retryWrites: true,
      w: "majority" as const,
    };

    (global as any).mongoose.promise = mongoose.connect(MONGODB_URI, options);
  }

  (global as any).mongoose.conn = await (global as any).mongoose.promise;
  console.log("✅ Connected to MongoDB Atlas successfully");
  return (global as any).mongoose.conn;
}

/**
 * Validate input against common injection patterns
 */
function validateInput(input: string): boolean {
  if (!input) return true; // Allow empty strings

  // Only check for actual script injection patterns, not normal words
  const scriptInjectionPattern = /<script[^>]*>.*?<\/script>/gi;
  const jsEventPattern = /\bon\w+\s*=/i; // onclick=, onload=, etc.
  const jsSchemePattern = /^\s*javascript:/i;
  const vbsSchemePattern = /^\s*vbscript:/i;
  const dataUriPattern = /^\s*data:\s*text\/html/i;

  return (
    !scriptInjectionPattern.test(input) &&
    !jsEventPattern.test(input) &&
    !jsSchemePattern.test(input) &&
    !vbsSchemePattern.test(input) &&
    !dataUriPattern.test(input)
  );
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Type definitions
export interface ArticleInterface {
  _id?: string;
  id?: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  image_url: string;
  category_id: string;
  author_id?: string;
  tags?: string[];
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  category_name_en?: string;
  category_name_ar?: string;
  category_slug?: string;
  view_count?: number;
  engagement_count?: number;
  scheduled_for?: string;
  meta_description_en?: string;
  meta_description_ar?: string;
  meta_keywords_en?: string;
  meta_keywords_ar?: string;
  reading_time_minutes?: number;
  word_count?: number;
  slug?: string;
}

export interface CategoryInterface {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  slug: string;
  created_at: string;
  meta_description_en?: string;
  meta_description_ar?: string;
}

export interface TagInterface {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  created_at: string;
}

export interface UserInterface {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  role: "admin" | "writer" | "user";
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInterface {
  _id?: string;
  id?: string;
  user_id: string;
  display_name?: string;
  website?: string;
  location?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_github?: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  sortBy?: "date" | "relevance";
  sortOrder?: "asc" | "desc";
}

export interface SearchSuggestion {
  text: string;
  type: "query" | "category" | "tag";
  count?: number;
}

export interface AnalyticsData {
  totalViews: number;
  totalEngagements: number;
  popularArticles: ArticleInterface[];
  popularCategories: { name: string; count: number; category_id: string }[];
  viewsTimeline: { date: string; views: number }[];
  engagementTimeline: { date: string; engagements: number }[];
  recentActivity: any[];
}

// Helper function to convert MongoDB doc to plain object with id
function convertDoc(doc: any): any {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map((item) => convertDoc(item));
  }

  // Get plain object
  const obj = doc.toObject ? doc.toObject() : doc;

  // Convert to JSON and back to remove all MongoDB-specific properties
  const serialized = JSON.parse(JSON.stringify(obj));

  // Convert _id to id
  if (serialized._id) {
    serialized.id = serialized._id.toString();
    delete serialized._id;
  }

  // Remove any remaining MongoDB-specific properties
  delete serialized.__v;

  return serialized;
}

// ===============================================
// ARTICLE FUNCTIONS
// ===============================================

export async function getArticles(
  limit?: number,
  featured?: boolean
): Promise<ArticleInterface[]> {
  await dbConnect();

  let query: any = { is_published: true };

  if (featured) {
    query.is_featured = true;
  }

  const articlesQuery = Article.find(query)
    .populate("category_id", "name_en name_ar slug")
    .sort({ published_at: -1 });

  if (limit) {
    articlesQuery.limit(limit);
  }

  const articles = await articlesQuery.lean();

  const articlesWithCategories = articles.map((article: any) => ({
    ...convertDoc(article),
    category_name_en: article.category_id?.name_en,
    category_name_ar: article.category_id?.name_ar,
    category_slug: article.category_id?.slug,
  }));

  // Enrich with author information
  return await enrichArticlesWithAuthor(articlesWithCategories);
}

export async function getArticleById(
  id: string
): Promise<ArticleInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const article = await Article.findOne({
    _id: new Types.ObjectId(id),
    is_published: true,
  })
    .populate("category_id", "name_en name_ar slug")
    .lean();

  if (!article) return null;

  const articleWithCategory = {
    ...convertDoc(article),
    category_name_en: article.category_id?.name_en,
    category_name_ar: article.category_id?.name_ar,
    category_slug: article.category_id?.slug,
  };

  // Enrich with author information
  const enrichedArticles = await enrichArticlesWithAuthor([
    articleWithCategory,
  ]);
  return enrichedArticles[0];
}

export async function getArticleByIdAdmin(
  id: string
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
    ...convertDoc(article),
    category_name_en: article.category_id?.name_en,
    category_name_ar: article.category_id?.name_ar,
    category_slug: article.category_id?.slug,
  };
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit?: number
): Promise<ArticleInterface[]> {
  await dbConnect();

  const category = await Category.findOne({ slug: categorySlug });
  if (!category) return [];

  const query = Article.find({
    category_id: category._id,
    is_published: true,
  })
    .populate("category_id", "name_en name_ar slug")
    .sort({ published_at: -1 });

  if (limit) {
    query.limit(limit);
  }

  const articles = await query.lean();

  return articles.map((article) => ({
    ...convertDoc(article),
    category_name_en: article.category_id?.name_en,
    category_name_ar: article.category_id?.name_ar,
    category_slug: article.category_id?.slug,
  }));
}

export async function searchArticles(
  query: string
): Promise<ArticleInterface[]> {
  await dbConnect();

  if (!query || query.trim().length < 2) {
    return [];
  }

  const articles = await Article.find({
    is_published: true,
    $text: { $search: query },
  })
    .populate("category_id", "name_en name_ar slug")
    .sort({ score: { $meta: "textScore" } })
    .limit(50)
    .lean();

  const articlesWithCategories = articles.map((article) => ({
    ...convertDoc(article),
    category_name_en: article.category_id?.name_en,
    category_name_ar: article.category_id?.name_ar,
    category_slug: article.category_id?.slug,
  }));

  // Enrich with author information
  return await enrichArticlesWithAuthor(articlesWithCategories);
}

export async function advancedSearchArticles(
  filters: SearchFilters
): Promise<ArticleInterface[]> {
  await dbConnect();

  try {
    let query: any = { is_published: true };

    // Text search
    if (filters.query && filters.query.trim()) {
      query.$text = { $search: filters.query.trim() };
    }

    // Category filter
    if (filters.categoryId && Types.ObjectId.isValid(filters.categoryId)) {
      query.category_id = new Types.ObjectId(filters.categoryId);
    }

    // Date filters
    if (filters.dateFrom || filters.dateTo) {
      query.published_at = {};
      if (filters.dateFrom) {
        query.published_at.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.published_at.$lte = new Date(filters.dateTo);
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const validTagIds = filters.tags
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      if (validTagIds.length > 0) {
        query.tags = { $in: validTagIds };
      }
    }

    let sort: any = { published_at: -1 }; // Default to newest first

    // Handle different sorting options
    if (filters.sortBy === "date") {
      // Date sorting
      sort = { published_at: filters.sortOrder === "asc" ? 1 : -1 };
    } else if (
      filters.sortBy === "relevance" &&
      filters.query &&
      filters.query.trim()
    ) {
      // Relevance sorting (only when there's a search query)
      sort = { score: { $meta: "textScore" } };
    }
    // Default remains newest first for all other cases

    const articles = await Article.find(query)
      .populate("category_id", "name_en name_ar slug")
      .populate("tags", "name_en name_ar slug")
      .sort(sort)
      .limit(50)
      .lean();

    return articles.map((article) => ({
      ...convertDoc(article),
      category_name_en: article.category_id?.name_en,
      category_name_ar: article.category_id?.name_ar,
      category_slug: article.category_id?.slug,
    }));
  } catch (error) {
    console.error("Error in advancedSearchArticles:", error);
    return [];
  }
}

export async function getSearchSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  await dbConnect();

  if (!query || query.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];

  try {
    // Article title suggestions
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

    // Category suggestions
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

    // Tag suggestions
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
  // This would typically come from analytics/search logs
  // For now, return some common terms
  return [
    { text: "Politics", type: "query", count: 156 },
    { text: "سياسة", type: "query", count: 134 },
    { text: "Sports", type: "query", count: 98 },
    { text: "رياضة", type: "query", count: 87 },
    { text: "Economy", type: "query", count: 76 },
    { text: "اقتصاد", type: "query", count: 65 },
  ];
}

// ===============================================
// CATEGORY FUNCTIONS
// ===============================================

export async function getCategories(): Promise<CategoryInterface[]> {
  await dbConnect();

  const categories = await Category.find({}).sort({ name_en: 1 }).lean();

  return convertDoc(categories);
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryInterface | null> {
  await dbConnect();

  const category = await Category.findOne({ slug }).lean();
  return convertDoc(category);
}

export async function createCategory(
  category: Omit<CategoryInterface, "_id" | "id" | "created_at">
): Promise<CategoryInterface> {
  await dbConnect();

  // Input validation
  if (!category.name_en || !category.name_ar || !category.slug) {
    throw new Error("Name (both languages) and slug are required");
  }

  // Validate text inputs for security
  if (
    !validateInput(category.name_en) ||
    !validateInput(category.name_ar) ||
    !validateInput(category.slug)
  ) {
    throw new Error("Invalid input detected");
  }

  // Sanitize inputs
  const sanitizedCategory = {
    name_en: sanitizeInput(category.name_en),
    name_ar: sanitizeInput(category.name_ar),
    slug: sanitizeInput(category.slug),
    meta_description_en: category.meta_description_en
      ? sanitizeInput(category.meta_description_en)
      : undefined,
    meta_description_ar: category.meta_description_ar
      ? sanitizeInput(category.meta_description_ar)
      : undefined,
  };

  const result = await Category.create(sanitizedCategory);
  return convertDoc(result);
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryInterface>
): Promise<CategoryInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  // Validate text inputs for security
  const textFields = [
    updates.name_en,
    updates.name_ar,
    updates.slug,
    updates.meta_description_en,
    updates.meta_description_ar,
  ].filter(Boolean);

  for (const field of textFields) {
    if (field && !validateInput(field)) {
      throw new Error("Invalid input detected");
    }
  }

  // Sanitize inputs
  const sanitizedUpdates: any = {};
  if (updates.name_en)
    sanitizedUpdates.name_en = sanitizeInput(updates.name_en);
  if (updates.name_ar)
    sanitizedUpdates.name_ar = sanitizeInput(updates.name_ar);
  if (updates.slug) sanitizedUpdates.slug = sanitizeInput(updates.slug);
  if (updates.meta_description_en)
    sanitizedUpdates.meta_description_en = sanitizeInput(
      updates.meta_description_en
    );
  if (updates.meta_description_ar)
    sanitizedUpdates.meta_description_ar = sanitizeInput(
      updates.meta_description_ar
    );

  const result = await Category.findByIdAndUpdate(id, sanitizedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new Error("Category not found");
  }

  return convertDoc(result);
}

export async function deleteCategory(id: string): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  // Check if category has articles
  const articlesCount = await Article.countDocuments({
    category_id: new Types.ObjectId(id),
  });
  if (articlesCount > 0) {
    throw new Error("Cannot delete category that has articles");
  }

  const result = await Category.findByIdAndDelete(id);
  if (!result) {
    throw new Error("Category not found");
  }

  return true;
}

// Cached versions
export const getCategoriesCached = unstable_cache(
  async () => {
    return getCategories();
  },
  ["categories"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["categories"],
  }
);

// ===============================================
// TAG FUNCTIONS
// ===============================================

export async function getTags(): Promise<TagInterface[]> {
  await dbConnect();

  const tags = await Tag.find({}).sort({ name_en: 1 }).lean();

  return convertDoc(tags);
}

export const getRecentArticlesCached = unstable_cache(
  async (limit: number = 10) => {
    return getArticles(limit);
  },
  ["recent-articles"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ["articles"],
  }
);

export const getFeaturedArticlesCached = unstable_cache(
  async (limit: number = 6) => {
    return getArticles(limit, true);
  },
  ["featured-articles"],
  {
    revalidate: 180, // Cache for 3 minutes
    tags: ["articles", "featured"],
  }
);

export const getArticlesByCategoryCached = unstable_cache(
  async (categorySlug: string, limit?: number) => {
    return getArticlesByCategory(categorySlug, limit);
  },
  ["category-articles"],
  {
    revalidate: 120, // Cache for 2 minutes
    tags: ["articles", "categories"],
  }
);

export const getArticleByIdCached = unstable_cache(
  async (id: string) => {
    return getArticleById(id);
  },
  ["article-by-id"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["articles"],
  }
);

// ===============================================
// ADMIN FUNCTIONS
// ===============================================

export async function getAllArticlesAdmin(): Promise<ArticleInterface[]> {
  await dbConnect();

  const articles = await Article.find({})
    .populate("category_id", "name_en name_ar slug")
    .sort({ created_at: -1 })
    .lean();

  return articles.map((article) => ({
    ...convertDoc(article),
    category_name_en: article.category_id?.name_en,
    category_name_ar: article.category_id?.name_ar,
    category_slug: article.category_id?.slug,
  }));
}

// Generate a URL-friendly slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Generate a unique slug for an article
async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug already exists and increment if needed
  while (await Article.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createArticle(
  article: Omit<ArticleInterface, "_id" | "id" | "created_at" | "updated_at">
) {
  await dbConnect();

  // Input validation
  if (!article.title_en || !article.title_ar) {
    throw new Error("Title in both languages is required");
  }

  if (!article.content_en || !article.content_ar) {
    throw new Error("Content in both languages is required");
  }

  // Generate excerpts if not provided
  if (!article.excerpt_en || article.excerpt_en.trim() === "") {
    article.excerpt_en = article.content_en.substring(0, 150) + "...";
  }

  if (!article.excerpt_ar || article.excerpt_ar.trim() === "") {
    article.excerpt_ar = article.content_ar.substring(0, 150) + "...";
  }

  // Generate slug if not provided
  if (!article.slug || article.slug.trim() === "") {
    article.slug = await generateUniqueSlug(article.title_en);
  }

  // Validate text inputs for security
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
        "Invalid input detected - contains potentially malicious content"
      );
    }
  }

  // Validate category_id
  if (!Types.ObjectId.isValid(article.category_id)) {
    console.error("Invalid category ID provided:", article.category_id);
    throw new Error("Invalid category ID");
  }

  // Validate author_id if provided
  if (article.author_id && !Types.ObjectId.isValid(article.author_id)) {
    console.error("Invalid author ID provided:", article.author_id);
    throw new Error("Invalid author ID");
  }

  try {
    // Sanitize inputs
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

    console.log("Creating article with sanitized data:", {
      title_en: sanitizedArticle.title_en,
      slug: sanitizedArticle.slug,
      category_id: sanitizedArticle.category_id,
      author_id: sanitizedArticle.author_id,
      is_published: sanitizedArticle.is_published,
    });

    const result = await Article.create(sanitizedArticle);
    console.log("Article created successfully with ID:", result._id);
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
  article: Partial<ArticleInterface>
) {
  await dbConnect();

  // Validate article ID
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid article ID");
  }

  // Validate text inputs for security
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
        "Invalid input detected - contains potentially malicious content"
      );
    }
  }

  // Validate category_id if provided
  if (article.category_id && !Types.ObjectId.isValid(article.category_id)) {
    throw new Error("Invalid category ID");
  }

  // Sanitize inputs
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
      article.meta_description_en
    );
  if (article.meta_description_ar)
    sanitizedArticle.meta_description_ar = sanitizeInput(
      article.meta_description_ar
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

export async function deleteArticle(id: string) {
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

// ===============================================
// USER MANAGEMENT FUNCTIONS
// ===============================================

export async function createUser(user: {
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role?: "admin" | "writer" | "user";
  writer_status?: "pending" | "approved" | "rejected" | null;
}): Promise<UserInterface> {
  console.log("🔄 DB: Starting createUser function");
  await dbConnect();

  // Input validation
  if (!user.username || !user.email || !user.password_hash) {
    console.log("❌ DB: Missing required fields");
    throw new Error("Username, email, and password are required");
  }

  // Validate text inputs for security
  if (!validateInput(user.username) || !validateInput(user.email)) {
    console.log("❌ DB: Invalid input detected");
    throw new Error("Invalid input detected");
  }

  // Sanitize inputs
  const sanitizedUser = {
    username: sanitizeInput(user.username.toLowerCase()),
    email: sanitizeInput(user.email.toLowerCase()),
    password_hash: user.password_hash, // Already hashed, don't sanitize
    first_name: user.first_name ? sanitizeInput(user.first_name) : undefined,
    last_name: user.last_name ? sanitizeInput(user.last_name) : undefined,
    role: user.role || "user",
    writer_status: user.writer_status || null,
  };

  console.log("💾 DB: Creating user with sanitized data:", {
    ...sanitizedUser,
    password_hash: "[HASHED]",
  });

  try {
    const result = await User.create(sanitizedUser);
    console.log("✅ DB: User created successfully in database");
    const convertedResult = convertDoc(result);
    console.log("🔄 DB: Converted result:", convertedResult);
    return convertedResult;
  } catch (error) {
    console.error("❌ DB: Error creating user:", error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<UserInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findById(id).select("-password_hash").lean();

  return convertDoc(user);
}

export async function getUserByEmail(
  email: string
): Promise<UserInterface | null> {
  await dbConnect();

  if (!email || !validateInput(email)) {
    throw new Error("Invalid email");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  return convertDoc(user);
}

export async function getUserByEmailWithPassword(
  email: string
): Promise<any | null> {
  await dbConnect();

  if (!email || !validateInput(email)) {
    throw new Error("Invalid email");
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password_hash")
    .lean();

  if (!user) return null;

  // Convert _id to id but keep password_hash
  const userObj = JSON.parse(JSON.stringify(user));
  if (userObj._id) {
    userObj.id = userObj._id.toString();
    delete userObj._id;
  }
  delete userObj.__v;

  return userObj;
}

export async function getUserByUsername(
  username: string
): Promise<UserInterface | null> {
  await dbConnect();

  if (!username || !validateInput(username)) {
    throw new Error("Invalid username");
  }

  const user = await User.findOne({ username: username.toLowerCase() })
    .select("-password_hash")
    .lean();

  return convertDoc(user);
}

export async function updateUser(
  id: string,
  updates: Partial<UserInterface>
): Promise<UserInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  // Validate and sanitize text inputs
  const sanitizedUpdates: any = {};

  if (updates.username) {
    if (!validateInput(updates.username)) throw new Error("Invalid username");
    sanitizedUpdates.username = sanitizeInput(updates.username.toLowerCase());
  }

  if (updates.email) {
    if (!validateInput(updates.email)) throw new Error("Invalid email");
    sanitizedUpdates.email = sanitizeInput(updates.email.toLowerCase());
  }

  if (updates.first_name) {
    if (!validateInput(updates.first_name))
      throw new Error("Invalid first name");
    sanitizedUpdates.first_name = sanitizeInput(updates.first_name);
  }

  if (updates.last_name) {
    if (!validateInput(updates.last_name)) throw new Error("Invalid last name");
    sanitizedUpdates.last_name = sanitizeInput(updates.last_name);
  }

  if (updates.bio) {
    if (!validateInput(updates.bio)) throw new Error("Invalid bio");
    sanitizedUpdates.bio = sanitizeInput(updates.bio);
  }

  if (updates.avatar_url) {
    if (!validateInput(updates.avatar_url))
      throw new Error("Invalid avatar URL");
    sanitizedUpdates.avatar_url = sanitizeInput(updates.avatar_url);
  }

  if (updates.role && ["admin", "writer", "user"].includes(updates.role)) {
    sanitizedUpdates.role = updates.role;
  }

  if (typeof updates.is_active === "boolean") {
    sanitizedUpdates.is_active = updates.is_active;
  }

  if (typeof updates.is_verified === "boolean") {
    sanitizedUpdates.is_verified = updates.is_verified;
  }

  const result = await User.findByIdAndUpdate(id, sanitizedUpdates, {
    new: true,
    runValidators: true,
  }).select("-password_hash");

  if (!result) {
    throw new Error("User not found");
  }

  return convertDoc(result);
}

// Update user writer status and role
export async function updateUserWriterStatus(
  userId: string,
  writerStatus: "pending" | "approved" | "rejected",
  role: "user" | "writer" | "admin"
): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const result = await User.findByIdAndUpdate(
    userId,
    {
      writer_status: writerStatus,
      role: role,
      updated_at: new Date(),
    },
    { new: true }
  );

  if (!result) {
    throw new Error("User not found");
  }
}

export async function updateUserPassword(
  id: string,
  passwordHash: string
): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  const result = await User.findByIdAndUpdate(
    id,
    {
      password_hash: passwordHash,
      updated_at: new Date(),
    },
    { new: true }
  );

  if (!result) {
    throw new Error("User not found or password update failed");
  }

  console.log("✅ Password updated successfully for user:", id);
}

export async function updateLastLogin(id: string): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  await User.findByIdAndUpdate(id, { last_login: new Date() });
}

export async function deleteUser(id: string): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has written articles
  const articlesCount = await Article.countDocuments({
    author_id: new Types.ObjectId(id),
  });

  if (articlesCount > 0) {
    throw new Error(
      "Cannot delete user with published articles. Deactivate instead."
    );
  }

  await User.findByIdAndDelete(id);
}

export async function getAllUsers(role?: string): Promise<UserInterface[]> {
  await dbConnect();

  let query: any = {};
  if (role && ["admin", "writer", "user"].includes(role)) {
    query.role = role;
  }

  const users = await User.find(query)
    .select("-password_hash")
    .sort({ created_at: -1 })
    .lean();

  return convertDoc(users);
}

// User Profile functions
export async function createUserProfile(
  userId: string,
  profile: Partial<UserProfileInterface>
): Promise<UserProfileInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const sanitizedProfile = {
    display_name: profile.display_name || undefined,
    website: profile.website || undefined,
    location: profile.location || undefined,
    social_twitter: profile.social_twitter || undefined,
    social_linkedin: profile.social_linkedin || undefined,
    social_github: profile.social_github || undefined,
    preferences: profile.preferences || {},
  };

  const result = await UserProfile.create({
    user_id: new Types.ObjectId(userId),
    ...sanitizedProfile,
  });

  return convertDoc(result);
}

export async function getUserProfile(
  userId: string
): Promise<UserProfileInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }

  const profile = await UserProfile.findOne({
    user_id: new Types.ObjectId(userId),
  }).lean();

  return convertDoc(profile);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfileInterface>
): Promise<UserProfileInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const sanitizedUpdates: any = {};

  if (updates.display_name !== undefined) {
    sanitizedUpdates.display_name = updates.display_name;
  }
  if (updates.website !== undefined) {
    sanitizedUpdates.website = updates.website;
  }
  if (updates.location !== undefined) {
    sanitizedUpdates.location = updates.location;
  }
  if (updates.social_twitter !== undefined) {
    sanitizedUpdates.social_twitter = updates.social_twitter;
  }
  if (updates.social_linkedin !== undefined) {
    sanitizedUpdates.social_linkedin = updates.social_linkedin;
  }
  if (updates.social_github !== undefined) {
    sanitizedUpdates.social_github = updates.social_github;
  }
  if (updates.preferences !== undefined) {
    sanitizedUpdates.preferences = updates.preferences;
  }

  // Try to update existing profile, or create if doesn't exist
  let result = await UserProfile.findOneAndUpdate(
    { user_id: new Types.ObjectId(userId) },
    sanitizedUpdates,
    { new: true, runValidators: true }
  );

  if (!result) {
    // Create new profile if doesn't exist
    result = await UserProfile.create({
      user_id: new Types.ObjectId(userId),
      ...sanitizedUpdates,
    });
  }

  return convertDoc(result);
}

// Activity logging function
export async function logUserActivity(
  userId: string,
  action: string,
  description?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await dbConnect();

  // Skip logging for development mode or invalid user IDs
  if (!Types.ObjectId.isValid(userId)) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔧 Development mode: Skipping user activity logging for:",
        userId
      );
      return;
    }
    throw new Error("Invalid user ID");
  }

  try {
    await UserActivityLog.create({
      user_id: new Types.ObjectId(userId),
      action,
      description,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}

// Email verification token functions
export async function createEmailVerificationToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<any> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  // Invalidate any existing tokens for this user
  await EmailVerificationToken.updateMany(
    { user_id: new Types.ObjectId(userId), used: false },
    { used: true }
  );

  const result = await EmailVerificationToken.create({
    user_id: new Types.ObjectId(userId),
    token,
    expires_at: expiresAt,
  });

  return convertDoc(result);
}

export async function getEmailVerificationToken(token: string): Promise<any> {
  await dbConnect();

  const result = await EmailVerificationToken.findOne({
    token,
    used: false,
    expires_at: { $gt: new Date() },
  }).lean();

  return convertDoc(result);
}

export async function markEmailVerificationTokenAsUsed(
  id: string
): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid token ID");
  }

  await EmailVerificationToken.findByIdAndUpdate(id, { used: true });
}

// Password reset token functions
export async function createPasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<any> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  // Invalidate any existing tokens for this user
  await PasswordResetToken.updateMany(
    { user_id: new Types.ObjectId(userId), used: false },
    { used: true }
  );

  const result = await PasswordResetToken.create({
    user_id: new Types.ObjectId(userId),
    token,
    expires_at: expiresAt,
  });

  return convertDoc(result);
}

export async function getPasswordResetToken(token: string): Promise<any> {
  await dbConnect();

  const result = await PasswordResetToken.findOne({
    token,
    used: false,
    expires_at: { $gt: new Date() },
  }).lean();

  return convertDoc(result);
}

export async function markPasswordResetTokenAsUsed(id: string): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid token ID");
  }

  await PasswordResetToken.findByIdAndUpdate(id, { used: true });
}

// Analytics placeholder functions
export async function trackArticleView(
  articleId: string,
  ipAddress: string,
  userAgent?: string,
  referer?: string,
  sessionId?: string
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
      referer: referer,
      session_id: sessionId,
    });

    // Update article view count
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
  platform?: string
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
      platform: platform,
    });

    // Update article engagement count
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
  days: number = 30
): Promise<AnalyticsData> {
  await dbConnect();

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total views and engagements
    const [totalViews, totalEngagements] = await Promise.all([
      ArticleView.countDocuments({ viewed_at: { $gte: startDate } }),
      ArticleEngagement.countDocuments({ created_at: { $gte: startDate } }),
    ]);

    // Get popular articles
    const popularArticles = await Article.find({ is_published: true })
      .populate("category_id", "name_en name_ar")
      .sort({ view_count: -1 })
      .limit(10)
      .lean();

    // Get popular categories
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

    // Timeline: group by day for the last N days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timelineDates = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      return d;
    });

    // Views Timeline
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
    const viewsMap = Object.fromEntries(viewsAgg.map((v) => [v._id, v.views]));
    const viewsTimeline = timelineDates.map((d) => {
      const dateStr = d.toISOString().slice(0, 10);
      return { date: dateStr, views: viewsMap[dateStr] || 0 };
    });

    // Engagement Timeline
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
      engagementAgg.map((v) => [v._id, v.engagements])
    );
    const engagementTimeline = timelineDates.map((d) => {
      const dateStr = d.toISOString().slice(0, 10);
      return { date: dateStr, engagements: engagementMap[dateStr] || 0 };
    });

    return {
      totalViews,
      totalEngagements,
      popularArticles: popularArticles.map((article) => ({
        ...convertDoc(article),
        category_name_en: article.category_id?.name_en,
        category_name_ar: article.category_id?.name_ar,
      })),
      popularCategories: categoryStats.map((cat) => ({
        name: cat.name,
        count: cat.count,
        category_id: cat._id.toString(),
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

// ===============================================
// SITEMAP FUNCTIONS
// ===============================================

export async function getSitemapEntries(): Promise<any[]> {
  await dbConnect();

  try {
    // Get all published articles
    const articles = await Article.find({ is_published: true })
      .populate("category_id", "slug")
      .select("title_en title_ar published_at updated_at category_id")
      .sort({ published_at: -1 })
      .lean();

    // Get all categories
    const categories = await Category.find({}).select("slug updated_at").lean();

    const sitemapEntries = [];

    // Add homepage
    sitemapEntries.push({
      url: "/",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    });

    // Add articles
    articles.forEach((article) => {
      sitemapEntries.push({
        url: `/article/${article._id}`,
        lastModified: article.updated_at || article.published_at,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    // Add categories
    categories.forEach((category) => {
      sitemapEntries.push({
        url: `/category/${category.slug}`,
        lastModified: category.updated_at || new Date().toISOString(),
        changeFrequency: "daily",
        priority: 0.7,
      });
    });

    // Add static pages
    const staticPages = [
      { url: "/news", priority: 0.9 },
      { url: "/search", priority: 0.6 },
    ];

    staticPages.forEach((page) => {
      sitemapEntries.push({
        ...page,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly",
      });
    });

    return sitemapEntries;
  } catch (error) {
    console.error("Error generating sitemap entries:", error);
    return [];
  }
}

// Validation helpers
export function validateId(id: any): string {
  if (!id || !Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID parameter");
  }
  return id.toString();
}

export function validateString(input: any, maxLength: number = 1000): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  if (!validateInput(input)) {
    throw new Error("Input contains invalid characters");
  }

  return sanitizeInput(input);
}

export function validateBoolean(input: any): boolean {
  if (typeof input === "boolean") {
    return input;
  }

  if (typeof input === "string") {
    return input.toLowerCase() === "true";
  }

  throw new Error("Input must be a boolean");
}

// Get author information for articles
export async function getAuthorInfo(authorId: string): Promise<{
  name: string;
  role: string;
} | null> {
  try {
    await dbConnect();

    const user = await User.findById(authorId).select(
      "first_name last_name role username"
    );

    if (!user) {
      return null;
    }

    let name = "Author";

    if (user.role === "admin") {
      name = "Author";
    } else if (user.role === "writer") {
      const firstName = user.first_name || "";
      const lastName = user.last_name || "";
      name = `${firstName} ${lastName}`.trim() || user.username || "Writer";
    }

    return {
      name,
      role: user.role,
    };
  } catch (error) {
    console.error("Error getting author info:", error);
    return null;
  }
}

// Enrich articles with author information
export async function enrichArticlesWithAuthor(
  articles: any[]
): Promise<any[]> {
  const enrichedArticles = await Promise.all(
    articles.map(async (article) => {
      if (article.author_id) {
        const authorInfo = await getAuthorInfo(article.author_id);
        return {
          ...article,
          author_name: authorInfo?.name,
          author_role: authorInfo?.role,
        };
      }
      return article;
    })
  );

  return enrichedArticles;
}

// Update ArticleInterface to include author information
export interface ArticleWithAuthor extends ArticleInterface {
  author_name?: string;
  author_role?: string;
}

// Report Interface
export interface ReportInterface {
  _id?: string;
  article_id: string;
  article_title: string;
  report_type:
    | "spam"
    | "inappropriate"
    | "copyright"
    | "misinformation"
    | "other";
  reason: string;
  reporter_email?: string;
  reporter_name?: string;
  reporter_ip?: string;
  status: "pending" | "in_progress" | "resolved" | "closed" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  reviewed_at?: Date;
  reviewed_by?: string;
  reviewed_by_name?: string;
  admin_notes?: string;
  resolution_notes?: string;
  escalated_at?: Date;
  escalated_by?: string;
  closed_at?: Date;
  closed_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Get all reports with filtering and sorting
export async function getReports(
  options: {
    status?: string;
    priority?: string;
    reportType?: string;
    sortBy?: "date" | "priority" | "status";
    limit?: number;
    skip?: number;
  } = {}
): Promise<ReportInterface[]> {
  try {
    await dbConnect();

    const {
      status,
      priority,
      reportType,
      sortBy = "date",
      limit = 50,
      skip = 0,
    } = options;

    // Build filter query
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (priority && priority !== "all") {
      filter.priority = priority;
    }
    if (reportType && reportType !== "all") {
      filter.report_type = reportType;
    }

    // Build sort query
    let sort: any = {};
    switch (sortBy) {
      case "date":
        sort = { created_at: -1 };
        break;
      case "priority":
        sort = {
          priority: 1, // Will need custom sorting for priority order
          created_at: -1,
        };
        break;
      case "status":
        sort = { status: 1, created_at: -1 };
        break;
      default:
        sort = { created_at: -1 };
    }

    const reports = await Report.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate("reviewed_by", "first_name last_name username")
      .lean();

    // Convert MongoDB documents to plain objects and format
    return reports.map((report: any) => ({
      _id: report._id.toString(),
      article_id: report.article_id.toString(),
      article_title: report.article_title,
      report_type: report.report_type,
      reason: report.reason,
      reporter_email: report.reporter_email,
      reporter_name: report.reporter_name,
      reporter_ip: report.reporter_ip,
      status: report.status,
      priority: report.priority,
      reviewed_at: report.reviewed_at,
      reviewed_by: report.reviewed_by?._id?.toString(),
      reviewed_by_name: report.reviewed_by
        ? `${report.reviewed_by.first_name || ""} ${
            report.reviewed_by.last_name || ""
          }`.trim() || report.reviewed_by.username
        : report.reviewed_by_name,
      admin_notes: report.admin_notes,
      resolution_notes: report.resolution_notes,
      escalated_at: report.escalated_at,
      escalated_by: report.escalated_by?.toString(),
      closed_at: report.closed_at,
      closed_by: report.closed_by?.toString(),
      created_at: report.created_at,
      updated_at: report.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

// Get report by ID
export async function getReportById(
  reportId: string
): Promise<ReportInterface | null> {
  try {
    await dbConnect();

    const report = await Report.findById(reportId)
      .populate("reviewed_by", "first_name last_name username")
      .lean();

    if (!report) {
      return null;
    }

    return {
      _id: report._id.toString(),
      article_id: report.article_id.toString(),
      article_title: report.article_title,
      report_type: report.report_type,
      reason: report.reason,
      reporter_email: report.reporter_email,
      reporter_name: report.reporter_name,
      reporter_ip: report.reporter_ip,
      status: report.status,
      priority: report.priority,
      reviewed_at: report.reviewed_at,
      reviewed_by: report.reviewed_by?._id?.toString(),
      reviewed_by_name: report.reviewed_by
        ? `${report.reviewed_by.first_name || ""} ${
            report.reviewed_by.last_name || ""
          }`.trim() || report.reviewed_by.username
        : report.reviewed_by_name,
      admin_notes: report.admin_notes,
      resolution_notes: report.resolution_notes,
      escalated_at: report.escalated_at,
      escalated_by: report.escalated_by?.toString(),
      closed_at: report.closed_at,
      closed_by: report.closed_by?.toString(),
      created_at: report.created_at,
      updated_at: report.updated_at,
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
}

// Create a new report
export async function createReport(reportData: {
  article_id: string;
  article_title: string;
  report_type:
    | "spam"
    | "inappropriate"
    | "copyright"
    | "misinformation"
    | "other";
  reason: string;
  reporter_email?: string;
  reporter_name?: string;
  reporter_ip?: string;
  priority?: "low" | "medium" | "high" | "critical";
}): Promise<ReportInterface | null> {
  try {
    await dbConnect();

    const report = new Report({
      ...reportData,
      status: "in_progress",
      priority: reportData.priority || "medium",
    });

    const savedReport = await report.save();

    return {
      _id: savedReport._id.toString(),
      article_id: savedReport.article_id.toString(),
      article_title: savedReport.article_title,
      report_type: savedReport.report_type,
      reason: savedReport.reason,
      reporter_email: savedReport.reporter_email,
      reporter_name: savedReport.reporter_name,
      reporter_ip: savedReport.reporter_ip,
      status: savedReport.status,
      priority: savedReport.priority,
      created_at: savedReport.created_at,
      updated_at: savedReport.updated_at,
    };
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

// Update report status
export async function updateReportStatus(
  reportId: string,
  statusData: {
    status: "in_progress" | "resolved" | "closed" | "dismissed";
    reviewed_by: string;
    reviewed_by_name?: string;
    admin_notes?: string;
    resolution_notes?: string;
  }
): Promise<ReportInterface | null> {
  try {
    await dbConnect();

    const updateData: any = {
      status: statusData.status,
      reviewed_by_name: statusData.reviewed_by_name,
      reviewed_at: new Date(),
    };

    // Only set reviewed_by if it's a valid ObjectId
    if (
      statusData.reviewed_by &&
      Types.ObjectId.isValid(statusData.reviewed_by)
    ) {
      updateData.reviewed_by = statusData.reviewed_by;
    }

    if (statusData.admin_notes) {
      updateData.admin_notes = statusData.admin_notes;
    }

    if (statusData.resolution_notes) {
      updateData.resolution_notes = statusData.resolution_notes;
    }

    // Set closed_at for closed status
    if (statusData.status === "closed") {
      updateData.closed_at = new Date();
      if (
        statusData.reviewed_by &&
        Types.ObjectId.isValid(statusData.reviewed_by)
      ) {
        updateData.closed_by = statusData.reviewed_by;
      }
    }

    // Set dismissed_at for dismissed status
    if (statusData.status === "dismissed") {
      updateData.dismissed_at = new Date();
    }

    const updatedReport = await Report.findByIdAndUpdate(reportId, updateData, {
      new: true,
    })
      .populate("reviewed_by", "first_name last_name username")
      .lean();

    if (!updatedReport) {
      return null;
    }

    return {
      _id: updatedReport._id.toString(),
      article_id: updatedReport.article_id.toString(),
      article_title: updatedReport.article_title,
      report_type: updatedReport.report_type,
      reason: updatedReport.reason,
      reporter_email: updatedReport.reporter_email,
      reporter_name: updatedReport.reporter_name,
      reporter_ip: updatedReport.reporter_ip,
      status: updatedReport.status,
      priority: updatedReport.priority,
      reviewed_at: updatedReport.reviewed_at,
      reviewed_by: updatedReport.reviewed_by?._id?.toString(),
      reviewed_by_name: updatedReport.reviewed_by
        ? `${updatedReport.reviewed_by.first_name || ""} ${
            updatedReport.reviewed_by.last_name || ""
          }`.trim() || updatedReport.reviewed_by.username
        : updatedReport.reviewed_by_name,
      admin_notes: updatedReport.admin_notes,
      resolution_notes: updatedReport.resolution_notes,
      escalated_at: updatedReport.escalated_at,
      escalated_by: updatedReport.escalated_by?.toString(),
      closed_at: updatedReport.closed_at,
      closed_by: updatedReport.closed_by?.toString(),
      dismissed_at: updatedReport.dismissed_at,
      created_at: updatedReport.created_at,
      updated_at: updatedReport.updated_at,
    };
  } catch (error) {
    console.error("Error updating report status:", error);
    return null;
  }
}

// Delete a report by ID
export async function deleteReport(reportId: string): Promise<boolean> {
  try {
    await dbConnect();

    const deletedReport = await Report.findByIdAndDelete(reportId);
    return !!deletedReport;
  } catch (error) {
    console.error("Error deleting report:", error);
    return false;
  }
}

// Get report statistics
export async function getReportStats(): Promise<{
  total: number;
  in_progress: number;
  resolved: number;
  closed: number;
  dismissed: number;
  high_priority: number;
  by_type: Record<string, number>;
}> {
  try {
    await dbConnect();

    const [totalResult, statusResult, priorityResult, typeResult] =
      await Promise.all([
        Report.countDocuments(),
        Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Report.countDocuments({
          priority: { $in: ["high", "critical"] },
        }),
        Report.aggregate([
          { $group: { _id: "$report_type", count: { $sum: 1 } } },
        ]),
      ]);

    const stats = {
      total: totalResult,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      dismissed: 0,
      high_priority: priorityResult,
      by_type: {} as Record<string, number>,
    };

    // Process status results
    statusResult.forEach((item: any) => {
      stats[item._id as keyof typeof stats] = item.count;
    });

    // Process type results
    typeResult.forEach((item: any) => {
      stats.by_type[item._id] = item.count;
    });

    return stats;
  } catch (error) {
    console.error("Error fetching report stats:", error);
    return {
      total: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      dismissed: 0,
      high_priority: 0,
      by_type: {},
    };
  }
}

// Cached version of getReports for better performance
export const getReportsCached = unstable_cache(
  async (options: Parameters<typeof getReports>[0] = {}) => {
    return getReports(options);
  },
  ["reports-list"],
  {
    revalidate: 300, // 5 minutes
    tags: ["reports"],
  }
);

// Cached version of getReportStats
export const getReportStatsCached = unstable_cache(
  async () => {
    return getReportStats();
  },
  ["report-stats"],
  {
    revalidate: 300, // 5 minutes
    tags: ["reports"],
  }
);

// ============================================================================
// NEWSLETTER SUBSCRIPTION FUNCTIONS
// ============================================================================

export async function getNewsletterSubscribers(
  options: {
    search?: string;
    plan?: "all" | "basic" | "premium";
    status?: "all" | "active" | "canceled" | "past_due" | "incomplete";
    limit?: number;
    skip?: number;
  } = {}
) {
  try {
    await dbConnect();

    const {
      search = "",
      plan = "all",
      status = "all",
      limit = 50,
      skip = 0,
    } = options;

    // Build the query
    const query: any = {};

    // Status filter
    if (status !== "all") {
      query.status = status;
    }

    // Plan filter
    if (plan !== "all") {
      query.plan = plan;
    }

    // Get subscriptions with populated user data
    const subscriptions = await NewsletterSubscription.find(query)
      .populate({
        path: "user_id",
        select: "email first_name last_name created_at last_activity",
        model: "User",
      })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Filter by search term after population (searching in user email/name)
    let filteredSubscriptions = subscriptions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSubscriptions = subscriptions.filter((sub: any) => {
        const user = sub.user_id;
        if (!user) return false;

        const email = user.email?.toLowerCase() || "";
        const firstName = user.first_name?.toLowerCase() || "";
        const lastName = user.last_name?.toLowerCase() || "";

        return (
          email.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          `${firstName} ${lastName}`.includes(searchLower)
        );
      });
    }

    // Transform the data to match the frontend interface
    const transformedSubscribers = filteredSubscriptions.map((sub: any) => {
      const user = sub.user_id;

      // Calculate engagement metrics (mock for now, would need actual email tracking)
      const totalEmailsSent = Math.floor(
        (Date.now() - new Date(sub.created_at).getTime()) /
          (1000 * 60 * 60 * 24 * 7) // Weekly emails
      );
      const emailsOpened = Math.floor(
        totalEmailsSent * (Math.random() * 0.5 + 0.3)
      ); // 30-80% open rate
      const clickThroughRate = Math.floor(Math.random() * 40 + 20); // 20-60% CTR

      return {
        id: sub._id.toString(),
        email: user?.email || "",
        firstName: user?.first_name || "",
        lastName: user?.last_name || "",
        plan: sub.plan,
        status: sub.status,
        billingPeriod: sub.billing_period,
        subscriptionDate: sub.created_at,
        nextBilling: sub.current_period_end,
        totalPaid: sub.amount || 0,
        preferences: {
          dailyDigest: sub.preferences?.daily_digest || true,
          weeklyNewsletter: sub.preferences?.weekly_summary || true,
          breakingNews: sub.preferences?.breaking_news || true,
          premiumContent:
            sub.preferences?.premium_content || sub.plan === "premium",
        },
        lastActivity: user?.last_activity || sub.updated_at,
        engagement: {
          emailsOpened,
          clickThroughRate,
          totalEmailsSent: Math.max(totalEmailsSent, 1),
        },
      };
    });

    return transformedSubscribers;
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    throw error;
  }
}

export async function getNewsletterStats() {
  try {
    await dbConnect();

    const [
      totalSubscribers,
      activeSubscribers,
      premiumSubscribers,
      totalRevenue,
    ] = await Promise.all([
      NewsletterSubscription.countDocuments(),
      NewsletterSubscription.countDocuments({ status: "active" }),
      NewsletterSubscription.countDocuments({
        plan: "premium",
        status: "active",
      }),
      NewsletterSubscription.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    // Calculate average engagement (mock for now)
    const avgEngagement = Math.floor(Math.random() * 30 + 40); // 40-70%

    return {
      total: totalSubscribers,
      active: activeSubscribers,
      premium: premiumSubscribers,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgEngagement,
    };
  } catch (error) {
    console.error("Error fetching newsletter stats:", error);
    throw error;
  }
}

// Cached versions
export const getNewsletterSubscribersCached = unstable_cache(
  async (options: Parameters<typeof getNewsletterSubscribers>[0] = {}) => {
    return getNewsletterSubscribers(options);
  },
  ["newsletter-subscribers"],
  {
    revalidate: 300, // 5 minutes
    tags: ["newsletter-subscribers"],
  }
);

export const getNewsletterStatsCached = unstable_cache(
  async () => {
    return getNewsletterStats();
  },
  ["newsletter-stats"],
  {
    revalidate: 300, // 5 minutes
    tags: ["newsletter-subscribers"],
  }
);

// Clean up dismissed reports older than 2 days
export async function cleanupDismissedReports(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    await dbConnect();

    // Calculate date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    console.log(
      `🧹 Cleaning up dismissed reports older than ${twoDaysAgo.toISOString()}`
    );

    // Delete dismissed reports that are older than 2 days
    const result = await Report.deleteMany({
      status: "dismissed",
      dismissed_at: {
        $exists: true,
        $lt: twoDaysAgo,
      },
    });

    console.log(
      `✅ Cleanup completed: ${result.deletedCount} dismissed reports deleted`
    );

    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    console.error("❌ Error during dismissed reports cleanup:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===============================================
// CONTACT MESSAGE FUNCTIONS
// ===============================================

export async function createContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactInterface> {
  await dbConnect();

  // Validate and sanitize inputs
  if (
    !validateInput(data.name) ||
    !validateInput(data.email) ||
    !validateInput(data.subject) ||
    !validateInput(data.message)
  ) {
    throw new Error("Invalid input data");
  }

  const sanitizedData = {
    name: sanitizeInput(data.name),
    email: sanitizeInput(data.email.toLowerCase()),
    subject: sanitizeInput(data.subject),
    message: sanitizeInput(data.message),
  };

  const contact = new Contact(sanitizedData);
  const savedContact = await contact.save();

  return convertDoc(savedContact);
}

export async function getContactMessages(
  page: number = 1,
  limit: number = 20,
  filters?: {
    is_read?: boolean;
    is_replied?: boolean;
    search?: string;
  }
): Promise<{
  messages: ContactInterface[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await dbConnect();

  const query: any = {};

  if (filters?.is_read !== undefined) {
    query.is_read = filters.is_read;
  }

  if (filters?.is_replied !== undefined) {
    query.is_replied = filters.is_replied;
  }

  if (filters?.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { subject: searchRegex },
      { message: searchRegex },
    ];
  }

  const totalCount = await Contact.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;

  const messages = await Contact.find(query)
    .populate("replied_by", "username email first_name last_name")
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    messages: convertDoc(messages),
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export async function getContactMessageById(
  id: string
): Promise<ContactInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const message = await Contact.findById(id)
    .populate("replied_by", "username email first_name last_name")
    .lean();

  return message ? convertDoc(message) : null;
}

export async function markContactMessageAsRead(id: string): Promise<boolean> {
  await dbConnect();

  console.log("🔍 markContactMessageAsRead called with ID:", id);

  if (!Types.ObjectId.isValid(id)) {
    console.error("❌ Invalid ObjectId:", id);
    return false;
  }

  try {
    const result = await Contact.findByIdAndUpdate(
      id,
      { is_read: true, updated_at: new Date() },
      { new: true }
    );

    console.log("📊 Database update result:", result ? "Success" : "Not found");
    return !!result;
  } catch (error) {
    console.error("❌ Database error in markContactMessageAsRead:", error);
    return false;
  }
}

export async function replyToContactMessage(
  id: string,
  adminReply: string,
  adminUserId: string
): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(adminUserId)) {
    return false;
  }

  if (!validateInput(adminReply)) {
    throw new Error("Invalid reply content");
  }

  const sanitizedReply = sanitizeInput(adminReply);

  const result = await Contact.findByIdAndUpdate(
    id,
    {
      admin_reply: sanitizedReply,
      is_replied: true,
      is_read: true,
      replied_by: new Types.ObjectId(adminUserId),
      replied_at: new Date(),
      updated_at: new Date(),
    },
    { new: true }
  );

  return !!result;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  const result = await Contact.findByIdAndDelete(id);
  return !!result;
}

export async function getContactMessageStats(): Promise<{
  total: number;
  unread: number;
  unreplied: number;
  todayCount: number;
}> {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, unread, unreplied, todayCount] = await Promise.all([
    Contact.countDocuments({}),
    Contact.countDocuments({ is_read: false }),
    Contact.countDocuments({ is_replied: false }),
    Contact.countDocuments({ created_at: { $gte: today } }),
  ]);

  return {
    total,
    unread,
    unreplied,
    todayCount,
  };
}
