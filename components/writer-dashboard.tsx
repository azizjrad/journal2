"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import Link from "next/link";
import { toast } from "@/lib/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryFilter } from "@/components/category-filter";
import { getCategories } from "@/lib/db";
import {
  Plus,
  Edit,
  Edit2,
  Eye,
  FileText,
  Clock,
  Calendar,
  Search,
  BarChart3,
  X,
} from "lucide-react";
import { DeleteArticleButton } from "@/components/delete-article-button";
import { LogoutButton } from "@/components/logout-button";

interface Article {
  id: string;
  title_en: string;
  title_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  image_url: string;
  category_name_en?: string;
  category_name_ar?: string;
  category_slug?: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  scheduled_for?: string;
  view_count?: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface WriterDashboardProps {
  articles: Article[];
  user: User;
}

// Memoized article card component for better performance
const ArticleCard = memo(function ArticleCard({
  article,
  onDelete,
  onSchedule,
}: {
  article: Article;
  onDelete: (id: string) => void;
  onSchedule: (id: string) => void;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <h3 className="font-semibold text-white mb-2 line-clamp-2">
            {article.title_en}
          </h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {article.excerpt_en}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant={article.is_published ? "default" : "secondary"}
              className={`text-xs ${
                article.is_published
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-gray-500/20 text-gray-300 border-gray-500/30"
              }`}
            >
              {article.is_published ? "Published" : "Draft"}
            </Badge>
            {!article.is_published &&
              article.scheduled_for &&
              new Date(article.scheduled_for) > new Date() && (
                <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Calendar className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            {article.is_featured && (
              <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                Featured
              </Badge>
            )}
            {article.category_name_en && (
              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                {article.category_name_en}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(
                article.published_at || article.created_at
              ).toLocaleDateString()}
            </span>
            {!article.is_published &&
              article.scheduled_for &&
              new Date(article.scheduled_for) > new Date() && (
                <span className="flex items-center gap-1 text-purple-400">
                  <Clock className="h-3 w-3" />
                  Publishes {new Date(article.scheduled_for).toLocaleString()}
                </span>
              )}
            {article.view_count && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.view_count} views
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/writer/articles/${article.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/article/${article.id}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {/* Schedule button for unpublished articles that aren't already scheduled */}
          {!article.is_published && !article.scheduled_for && (
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-300 border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20"
              onClick={() => onSchedule(article.id)}
              title="Schedule Article"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          )}
          <DeleteArticleButton
            articleId={article.id}
            articleTitle={article.title_en}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
});

// Main WriterDashboard function state and hooks
export function WriterDashboard({ articles, user }: WriterDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentArticles, setCurrentArticles] = useState(articles);
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {}
    })();
  }, []);

  // Filter articles to only show user's articles
  const userArticles = useMemo(() => {
    return currentArticles.filter((article) => article.author_id === user.id);
  }, [currentArticles, user.id]);

  // Empty state component for different tabs
  const EmptyState = memo(function EmptyState({
    searchQuery,
    handleSearch,
    tabType,
  }: {
    searchQuery: string;
    handleSearch: (query: string) => void;
    tabType: string;
  }) {
    const getEmptyMessage = () => {
      if (searchQuery) {
        return {
          title: "No articles found",
          description: `No articles match your search for "${searchQuery}"`,
          action: (
            <Button
              onClick={() => handleSearch("")}
              variant="outline"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              Clear Search
            </Button>
          ),
        };
      }

      switch (tabType) {
        case "published":
          return {
            title: "No published articles yet",
            description:
              "Your published articles will appear here once you publish them",
            action: (
              <Link href="/writer/articles/new">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </Link>
            ),
          };
        case "scheduled":
          return {
            title: "No scheduled articles",
            description:
              "Schedule articles to publish them automatically at a specific time",
            action: (
              <Link href="/writer/articles/new">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Article
                </Button>
              </Link>
            ),
          };
        default:
          return {
            title: "No articles yet",
            description: "Start creating amazing content for your readers",
            action: (
              <Link href="/writer/articles/new">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Article
                </Button>
              </Link>
            ),
          };
      }
    };

    const { title, description, action } = getEmptyMessage();

    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{description}</p>
        {action}
      </div>
    );
  });

  // Scheduled article card with management options
  const ScheduledArticleCard = memo(function ScheduledArticleCard({
    article,
    onDelete,
    onReschedule,
    onCancelSchedule,
  }: {
    article: Article;
    onDelete: (id: string) => void;
    onReschedule: (id: string, newDate: string) => void;
    onCancelSchedule: (id: string) => void;
  }) {
    const scheduledDate = article.scheduled_for
      ? new Date(article.scheduled_for)
      : null;

    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:from-purple-500/15 hover:to-purple-600/15 transition-all duration-300 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <h3 className="font-semibold text-white mb-2 line-clamp-2">
              {article.title_en}
            </h3>
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {article.excerpt_en}
            </p>

            {scheduledDate && (
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 text-purple-300 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Scheduled for Publication</span>
                </div>
                <p className="text-purple-200 text-sm">
                  {scheduledDate.toLocaleDateString()} at{" "}
                  {scheduledDate.toLocaleTimeString()}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Clock className="h-3 w-3 mr-1" />
                Scheduled
              </Badge>
              {article.category_name_en && (
                <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {article.category_name_en}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Link href={`/writer/articles/${article.id}/edit`}>
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 bg-white/10 hover:bg-white/20"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="text-yellow-300 border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20"
              onClick={() => {
                const currentDate = article.scheduled_for
                  ? new Date(article.scheduled_for).toISOString().slice(0, 16)
                  : new Date().toISOString().slice(0, 16);

                const newDate = prompt(
                  "Enter new publication date and time:",
                  currentDate
                );

                if (newDate) {
                  const dateObj = new Date(newDate);
                  if (dateObj > new Date()) {
                    onReschedule(article.id, dateObj.toISOString());
                  } else {
                    alert("Please select a future date and time.");
                  }
                }
              }}
              title="Reschedule Article"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-orange-300 border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to cancel the schedule? The article will become a draft."
                  )
                ) {
                  onCancelSchedule(article.id);
                }
              }}
              title="Cancel Schedule"
            >
              <X className="h-4 w-4" />
            </Button>
            <DeleteArticleButton
              articleId={article.id}
              articleTitle={article.title_en}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    );
  });
  const getFilteredArticlesByTab = useCallback(
    (tabType: string) => {
      let tabArticles = userArticles;

      // Filter by tab type
      switch (tabType) {
        case "published":
          tabArticles = userArticles.filter((a) => a.is_published);
          break;
        case "scheduled":
          tabArticles = userArticles.filter(
            (a) =>
              !a.is_published &&
              a.scheduled_for &&
              new Date(a.scheduled_for) > new Date()
          );
          break;
        case "all":
        default:
          // Keep all articles
          break;
      }

      // Filter by category
      if (categoryFilter) {
        tabArticles = tabArticles.filter(
          (a) => a.category_slug === categoryFilter
        );
      }

      // Apply search filter
      if (!searchQuery.trim()) {
        return tabArticles;
      }

      const query = searchQuery.toLowerCase();
      return tabArticles.filter(
        (article) =>
          article.title_en.toLowerCase().includes(query) ||
          article.title_ar.toLowerCase().includes(query) ||
          (article.category_name_en &&
            article.category_name_en.toLowerCase().includes(query))
      );
    },
    [userArticles, searchQuery, categoryFilter]
  );

  const filteredArticles = useMemo(() => {
    return getFilteredArticlesByTab(activeTab);
  }, [getFilteredArticlesByTab, activeTab]);

  // Statistics
  const stats = useMemo(() => {
    const published = userArticles.filter((a) => a.is_published);
    const scheduled = userArticles.filter(
      (a) =>
        !a.is_published &&
        a.scheduled_for &&
        new Date(a.scheduled_for) > new Date()
    );
    const featured = userArticles.filter((a) => a.is_featured);

    return {
      total: userArticles.length,
      published: published.length,
      scheduled: scheduled.length,
      featured: featured.length,
    };
  }, [userArticles]);

  // Handle article deletion
  const handleArticleDelete = useCallback((deletedId: string) => {
    setCurrentArticles((prev) =>
      prev.filter((article) => article.id !== deletedId)
    );
  }, []);

  // Handle article rescheduling
  const handleReschedule = useCallback(
    async (articleId: string, newDate: string) => {
      try {
        const response = await fetch(`/api/admin/articles/${articleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            scheduled_for: newDate,
          }),
        });

        if (response.ok) {
          setCurrentArticles((prev) =>
            prev.map((article) =>
              article.id === articleId
                ? { ...article, scheduled_for: newDate }
                : article
            )
          );
          toast.success("Article rescheduled successfully!", {
            description: `The article will now be published on ${new Date(
              newDate
            ).toLocaleString()}`,
          });
        } else {
          throw new Error("Failed to reschedule article");
        }
      } catch (error) {
        console.error("Error rescheduling article:", error);
        toast.error("Failed to reschedule article", {
          description: "Please try again later.",
        });
      }
    },
    []
  );

  // Handle cancel schedule
  const handleCancelSchedule = useCallback(async (articleId: string) => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          scheduled_for: null,
        }),
      });

      if (response.ok) {
        // Update the local state
        setCurrentArticles((prev) =>
          prev.map((article) =>
            article.id === articleId
              ? { ...article, scheduled_for: undefined }
              : article
          )
        );
        toast.success("Schedule cancelled successfully!", {
          description:
            "The article is now a draft and won't be automatically published.",
        });
      } else {
        throw new Error("Failed to cancel schedule");
      }
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      toast.error("Failed to cancel schedule", {
        description: "Please try again later.",
      });
    }
  }, []);

  // Handle scheduling draft articles
  const handleSchedule = useCallback(async (articleId: string) => {
    const newDate = prompt(
      "Enter publication date and time (YYYY-MM-DDTHH:MM):",
      new Date().toISOString().slice(0, 16)
    );

    if (newDate) {
      const dateObj = new Date(newDate);
      if (dateObj > new Date()) {
        try {
          const response = await fetch(`/api/admin/articles/${articleId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              scheduled_for: dateObj.toISOString(),
            }),
          });

          if (response.ok) {
            // Update the local state
            setCurrentArticles((prev) =>
              prev.map((article) =>
                article.id === articleId
                  ? { ...article, scheduled_for: dateObj.toISOString() }
                  : article
              )
            );
            toast.success("Article scheduled successfully!", {
              description: `The article will be published on ${dateObj.toLocaleString()}`,
            });
          } else {
            throw new Error("Failed to schedule article");
          }
        } catch (error) {
          console.error("Error scheduling article:", error);
          toast.error("Failed to schedule article", {
            description: "Please try again later.",
          });
        }
      } else {
        alert("Please select a future date and time.");
      }
    }
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                Writer Dashboard
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Welcome back, {user.username}! Manage your articles and content.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
              <Link href="/writer/articles/new">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="text-white border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Total Articles
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Published
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {stats.published}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Scheduled
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {stats.scheduled}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Articles Section with Tabs */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              My Articles
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 w-full sm:w-64"
                />
              </div>
              <CategoryFilter
                categories={categories}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex w-full overflow-x-auto bg-white/10 border border-white/20 gap-2 sm:gap-0 hide-scrollbar">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 min-w-[120px]"
              >
                All ({userArticles.length})
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 min-w-[120px]"
              >
                Published ({stats.published})
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 min-w-[120px]"
              >
                Scheduled ({stats.scheduled})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 sm:mt-6">
              {getFilteredArticlesByTab("all").length === 0 ? (
                <EmptyState
                  searchQuery={searchQuery}
                  handleSearch={handleSearch}
                  tabType="all"
                />
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
                  {getFilteredArticlesByTab("all").map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onDelete={handleArticleDelete}
                      onSchedule={handleSchedule}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="published" className="mt-4 sm:mt-6">
              {getFilteredArticlesByTab("published").length === 0 ? (
                <EmptyState
                  searchQuery={searchQuery}
                  handleSearch={handleSearch}
                  tabType="published"
                />
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
                  {getFilteredArticlesByTab("published").map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onDelete={handleArticleDelete}
                      onSchedule={handleSchedule}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="mt-4 sm:mt-6">
              {getFilteredArticlesByTab("scheduled").length === 0 ? (
                <EmptyState
                  searchQuery={searchQuery}
                  handleSearch={handleSearch}
                  tabType="scheduled"
                />
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">Scheduled Articles</span>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-200 mt-1">
                      These articles will be automatically published at their
                      scheduled time.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
                    {getFilteredArticlesByTab("scheduled").map((article) => (
                      <ScheduledArticleCard
                        key={article.id}
                        article={article}
                        onDelete={handleArticleDelete}
                        onReschedule={handleReschedule}
                        onCancelSchedule={handleCancelSchedule}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
