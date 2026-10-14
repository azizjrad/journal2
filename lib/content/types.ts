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

export interface ArticleWithAuthor extends ArticleInterface {
  author_name?: string;
  author_role?: string;
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
