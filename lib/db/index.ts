import { Types } from "mongoose";
import { dbConnect } from "./connection";
import { convertDoc, convertDocArray } from "./serialization";
import { sanitizeInput, validateInput } from "./input-validation";
import {
  createArticle as createArticleRepository,
  deleteArticle as deleteArticleRepository,
  enrichArticlesWithAuthor as enrichArticlesWithAuthorRepository,
  getArticleById as getArticleByIdRepository,
  getArticleByIdAdmin as getArticleByIdAdminRepository,
  getAllArticlesAdmin as getAllArticlesAdminRepository,
  getArticles as getArticlesRepository,
  getArticlesByCategory as getArticlesByCategoryRepository,
  getAuthorInfo as getAuthorInfoRepository,
  getAnalyticsData as getAnalyticsDataRepository,
  getPopularSearches as getPopularSearchesRepository,
  getSearchSuggestions as getSearchSuggestionsRepository,
  getSitemapEntries as getSitemapEntriesRepository,
  advancedSearchArticles as advancedSearchArticlesRepository,
  searchArticles as searchArticlesRepository,
  trackArticleEngagement as trackArticleEngagementRepository,
  trackArticleView as trackArticleViewRepository,
  updateArticle as updateArticleRepository,
} from "./article-repository";
import {
  cleanupDismissedReports as cleanupDismissedReportsService,
  createReport as createReportService,
  deleteReport as deleteReportService,
  getReportById as getReportByIdService,
  getReportStats as getReportStatsService,
  getReportStatsCached as getReportStatsCachedService,
  getReports as getReportsService,
  getReportsCached as getReportsCachedService,
  updateReportStatus as updateReportStatusService,
} from "@/lib/services/report-service";
import type {
  GetReportsOptions,
  ReportInterface,
} from "@/lib/services/report-service";
import {
  createCategory as createCategoryService,
  deleteCategory as deleteCategoryService,
  getCategories as getCategoriesService,
  getCategoriesCached as getCategoriesCachedService,
  getCategoryBySlug as getCategoryBySlugService,
  getTags as getTagsService,
  updateCategory as updateCategoryService,
} from "@/lib/services/category-service";
import type {
  CategoryInterface,
  TagInterface,
} from "@/lib/services/category-service";
import type { UserInterface, UserProfileInterface } from "@/lib/user";
import {
  createUser as createUserService,
  createUserProfile as createUserProfileService,
  deleteUser as deleteUserService,
  getAllUsers as getAllUsersService,
  getUserByEmail as getUserByEmailService,
  getUserByEmailWithPassword as getUserByEmailWithPasswordService,
  getUserById as getUserByIdService,
  getUserByUsername as getUserByUsernameService,
  getUserProfile as getUserProfileService,
  logUserActivity as logUserActivityService,
  updateLastLogin as updateLastLoginService,
  updateUser as updateUserService,
  updateUserProfile as updateUserProfileService,
  updateUserPassword as updateUserPasswordService,
  updateUserWriterStatus as updateUserWriterStatusService,
} from "@/lib/user";
import {
  Article,
  ScheduledArticle,
  ArticleView,
  ArticleEngagement,
  Setting,
  SitemapEntry,
} from "../models/Article";
import type {
  AnalyticsData,
  ArticleInterface,
  SearchFilters,
  SearchSuggestion,
} from "@/lib/content/types";

export { dbConnect } from "./connection";

export type {
  ArticleInterface,
  ArticleWithAuthor,
  SearchFilters,
  SearchSuggestion,
} from "@/lib/content/types";
export type { AnalyticsData } from "@/lib/content/types";

export type {
  CategoryInterface,
  TagInterface,
} from "@/lib/services/category-service";

export type { UserInterface, UserProfileInterface } from "@/lib/user";

// ===============================================
// ARTICLE FUNCTIONS
// ===============================================

export async function getArticles(
  limit?: number,
  featured?: boolean,
): Promise<ArticleInterface[]> {
  return getArticlesRepository(limit, featured);
}

export async function getArticleById(
  id: string,
): Promise<ArticleInterface | null> {
  return getArticleByIdRepository(id);
}

export async function getArticleByIdAdmin(
  id: string,
): Promise<ArticleInterface | null> {
  return getArticleByIdAdminRepository(id);
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit?: number,
): Promise<ArticleInterface[]> {
  return getArticlesByCategoryRepository(categorySlug, limit);
}

export async function searchArticles(
  query: string,
): Promise<ArticleInterface[]> {
  return searchArticlesRepository(query);
}

export async function advancedSearchArticles(
  filters: SearchFilters,
): Promise<ArticleInterface[]> {
  return advancedSearchArticlesRepository(filters);
}

export async function getSearchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  return getSearchSuggestionsRepository(query);
}

export async function getPopularSearches(): Promise<SearchSuggestion[]> {
  return getPopularSearchesRepository();
}

// ===============================================
// CATEGORY FUNCTIONS
// ===============================================

export async function getCategories(): Promise<CategoryInterface[]> {
  return getCategoriesService();
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryInterface | null> {
  return getCategoryBySlugService(slug);
}

export async function createCategory(
  category: Omit<CategoryInterface, "_id" | "id" | "created_at">,
): Promise<CategoryInterface> {
  return createCategoryService(category);
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryInterface>,
): Promise<CategoryInterface> {
  return updateCategoryService(id, updates);
}

export async function deleteCategory(id: string): Promise<boolean> {
  return deleteCategoryService(id);
}

export const getCategoriesCached = getCategoriesCachedService;

// ===============================================
// TAG FUNCTIONS
// ===============================================

export async function getTags(): Promise<TagInterface[]> {
  return getTagsService();
}

// ===============================================
// ADMIN FUNCTIONS
// ===============================================

export async function getAllArticlesAdmin(): Promise<ArticleInterface[]> {
  return getAllArticlesAdminRepository();
}

export async function createArticle(
  article: Omit<ArticleInterface, "_id" | "id" | "created_at" | "updated_at">,
) {
  return createArticleRepository(article);
}

export async function updateArticle(
  id: string,
  article: Partial<ArticleInterface>,
) {
  return updateArticleRepository(id, article);
}

export async function deleteArticle(id: string) {
  return deleteArticleRepository(id);
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
  return createUserService(user);
}

export async function getUserById(id: string): Promise<UserInterface | null> {
  return getUserByIdService(id);
}

export async function getUserByEmail(
  email: string,
): Promise<UserInterface | null> {
  return getUserByEmailService(email);
}

export async function getUserByEmailWithPassword(
  email: string,
): Promise<any | null> {
  return getUserByEmailWithPasswordService(email);
}

export async function getUserByUsername(
  username: string,
): Promise<UserInterface | null> {
  return getUserByUsernameService(username);
}

export async function updateUser(
  id: string,
  updates: Partial<UserInterface>,
): Promise<UserInterface> {
  return updateUserService(id, updates);
}

// Update user writer status and role
export async function updateUserWriterStatus(
  userId: string,
  writerStatus: "pending" | "approved" | "rejected",
  role: "user" | "writer" | "admin",
): Promise<void> {
  return updateUserWriterStatusService(userId, writerStatus, role);
}

export async function updateUserPassword(
  id: string,
  passwordHash: string,
): Promise<void> {
  return updateUserPasswordService(id, passwordHash);
}

export async function updateLastLogin(id: string): Promise<void> {
  return updateLastLoginService(id);
}

export async function deleteUser(id: string): Promise<void> {
  return deleteUserService(id);
}

export async function getAllUsers(role?: string): Promise<UserInterface[]> {
  return getAllUsersService(role);
}

// User Profile functions
export async function createUserProfile(
  userId: string,
  profile: Partial<UserProfileInterface>,
): Promise<UserProfileInterface> {
  return createUserProfileService(userId, profile);
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfileInterface | null> {
  return getUserProfileService(userId);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfileInterface>,
): Promise<UserProfileInterface> {
  return updateUserProfileService(userId, updates);
}

// Activity logging function
export async function logUserActivity(
  userId: string,
  action: string,
  description?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>,
): Promise<void> {
  return logUserActivityService(
    userId,
    action,
    description,
    ipAddress,
    userAgent,
    metadata,
  );
}

export {
  createEmailVerificationToken,
  createPasswordResetToken,
  getEmailVerificationToken,
  getPasswordResetToken,
  markEmailVerificationTokenAsUsed,
  markPasswordResetTokenAsUsed,
} from "@/lib/services/auth-token-service";

// Analytics placeholder functions
export async function trackArticleView(
  articleId: string,
  ipAddress: string,
  userAgent?: string,
  referer?: string,
  sessionId?: string,
): Promise<void> {
  return trackArticleViewRepository(
    articleId,
    ipAddress,
    userAgent,
    referer,
    sessionId,
  );
}

export async function trackArticleEngagement(
  articleId: string,
  engagementType: string,
  ipAddress: string,
  userAgent?: string,
  platform?: string,
): Promise<void> {
  return trackArticleEngagementRepository(
    articleId,
    engagementType,
    ipAddress,
    userAgent,
    platform,
  );
}

export async function getAnalyticsData(
  days: number = 30,
): Promise<AnalyticsData> {
  return getAnalyticsDataRepository(days);
}

// ===============================================
// SITEMAP FUNCTIONS
// ===============================================

export async function getSitemapEntries(): Promise<any[]> {
  return getSitemapEntriesRepository();
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
  return getAuthorInfoRepository(authorId);
}

// Enrich articles with author information
export async function enrichArticlesWithAuthor(
  articles: any[],
): Promise<any[]> {
  return enrichArticlesWithAuthorRepository(articles);
}

export type {
  GetReportsOptions,
  ReportInterface,
} from "@/lib/services/report-service";

// Get all reports with filtering and sorting
export async function getReports(
  options: GetReportsOptions = {},
): Promise<ReportInterface[]> {
  return getReportsService(options);
}

// Get report by ID
export async function getReportById(
  reportId: string,
): Promise<ReportInterface | null> {
  return getReportByIdService(reportId);
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
  reporter_email?: string | null;
  reporter_name?: string | null;
  reporter_ip?: string;
  priority?: "low" | "medium" | "high" | "critical";
}): Promise<ReportInterface | null> {
  return createReportService(reportData);
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
  },
): Promise<ReportInterface | null> {
  return updateReportStatusService(reportId, statusData);
}

// Delete a report by ID
export async function deleteReport(reportId: string): Promise<boolean> {
  return deleteReportService(reportId);
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
  return getReportStatsService();
}

// Cached version of getReports for better performance
export const getReportsCached = getReportsCachedService;

// Cached version of getReportStats
export const getReportStatsCached = getReportStatsCachedService;

export {
  cancelNewsletterSubscription,
  createNewsletterSubscription,
  getNewsletterStats,
  getNewsletterStatsCached,
  getNewsletterSubscribers,
  getNewsletterSubscribersCached,
  getNewsletterSubscriptionById,
  getNewsletterSubscriptionByStripeId,
  getNewsletterSubscriptionByUserId,
  updateNewsletterSubscription,
} from "@/lib/services/newsletter-service";

// Clean up dismissed reports older than 2 days
export async function cleanupDismissedReports(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  return cleanupDismissedReportsService();
}

export {
  createContactMessage,
  deleteContactMessage,
  getContactMessageById,
  getContactMessageStats,
  getContactMessages,
  markContactMessageAsRead,
  replyToContactMessage,
} from "@/lib/services/contact-service";
