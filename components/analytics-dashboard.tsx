"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Eye,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Clock,
  Target,
  RefreshCw,
} from "lucide-react";
import { AnalyticsData } from "@/lib/db";

interface AnalyticsDashboardProps {
  initialData: AnalyticsData;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: string;
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
}: MetricCardProps) {
  const colorConfig = {
    blue: "from-blue-500/20 to-blue-600/20 text-blue-300",
    green: "from-green-500/20 to-green-600/20 text-green-300",
    purple: "from-purple-500/20 to-purple-600/20 text-purple-300",
    orange: "from-orange-500/20 to-orange-600/20 text-orange-300",
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-300 font-medium">
                +{trend.value}%
              </span>
              <span className="text-gray-400 ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 bg-gradient-to-br ${
            colorConfig[color as keyof typeof colorConfig]
          } rounded-xl backdrop-blur-sm`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface TimelineChartProps {
  data:
    | { date: string; views: number }[]
    | { date: string; engagements: number }[];
  type: "views" | "engagements";
}

function TimelineChart({ data, type }: TimelineChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => ("views" in d ? d.views : d.engagements))
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2 text-xs text-gray-300">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 h-32">
        {data.slice(-7).map((item, index) => {
          const value = "views" in item ? item.views : item.engagements;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex flex-col justify-end">
              <div
                className={`bg-gradient-to-t ${
                  type === "views"
                    ? "from-blue-500 to-blue-400"
                    : "from-green-500 to-green-400"
                } rounded-t transition-all hover:opacity-80 cursor-pointer backdrop-blur-sm`}
                style={{
                  height: `${height}%`,
                  minHeight: value > 0 ? "4px" : "0px",
                }}
                title={`${item.date}: ${value} ${type}`}
              />
              <div className="text-xs text-center mt-1 text-gray-400">
                {new Date(item.date).getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PopularArticlesListProps {
  articles: any[];
}

function PopularArticlesList({ articles }: PopularArticlesListProps) {
  return (
    <div className="space-y-3">
      {articles.slice(0, 5).map((article, index) => (
        <div
          key={article.id}
          className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-sm font-semibold text-blue-300">
              {index + 1}
            </span>
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-medium text-white truncate">
              {article.title_en}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-white/20 text-gray-300 border-white/30 backdrop-blur-sm">
                {article.category_name_en}
              </Badge>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.view_count || 0} views
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface RecentActivityProps {
  activities: any[];
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="space-y-3">
      {activities.slice(0, 8).map((activity, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm border-l-4 border-blue-400/50 rounded-r-lg hover:bg-white/15 transition-all duration-300"
        >
          <div
            className={`w-3 h-3 rounded-full ${
              activity.type === "view" ? "bg-blue-400" : "bg-green-400"
            } shadow-lg`}
          />
          <div className="flex-grow">
            <p className="text-sm text-white">
              <span className="font-medium text-blue-300">
                {activity.type === "view" ? "View" : "Engagement"}
              </span>{" "}
              on "{activity.title_en}"
            </p>
            <p className="text-xs text-gray-400">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Refresh data when period changes
  useEffect(() => {
    refreshData();
  }, [selectedPeriod]);

  // Optimize refresh function with useCallback
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/analytics?days=${selectedPeriod}`
      );
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
      }
    } catch (error) {
      console.error("Failed to refresh analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  // Optimize number formatting with useMemo
  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-300 mt-1">
            Monitor your content performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px] bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
              <SelectItem
                value="7"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Last 7 days
              </SelectItem>
              <SelectItem
                value="30"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Last 30 days
              </SelectItem>
              <SelectItem
                value="90"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Last 90 days
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={refreshData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Views"
          value={formatNumber(data.totalViews)}
          icon={<Eye className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Total Engagements"
          value={formatNumber(data.totalEngagements)}
          icon={<Activity className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          title="Popular Articles"
          value={data.popularArticles.length}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
        <MetricCard
          title="Active Categories"
          value={data.popularCategories.length}
          icon={<Target className="h-6 w-6" />}
          color="orange"
        />{" "}
      </div>

      {/* Show helpful message when no data */}
      {data.totalViews === 0 && data.totalEngagements === 0 && (
        <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="h-5 w-5 text-blue-300" />
            <h3 className="font-medium text-blue-100">
              Start Collecting Analytics Data
            </h3>
          </div>
          <p className="text-blue-200 text-sm mb-4">
            Your analytics are ready! To see data here:
          </p>
          <div className="space-y-2">
            <p className="text-blue-200 text-sm">
              • Visit{" "}
              <a
                href="/"
                className="underline hover:no-underline text-blue-100"
              >
                your homepage
              </a>{" "}
              to generate page views
            </p>
            <p className="text-blue-200 text-sm">
              • Read articles to create view statistics
            </p>
            <p className="text-blue-200 text-sm">
              • Share or interact with content to generate engagement data
            </p>
            <p className="text-blue-200 text-sm">
              • Return here to see your real-time analytics
            </p>
          </div>
        </div>
      )}

      {/* Charts and Data */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-white text-gray-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-white text-gray-300"
          >
            Articles
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-white text-gray-300"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-white text-gray-300"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-blue-300" />
                <h3 className="font-semibold text-white">Views Timeline</h3>
              </div>
              <TimelineChart data={data.viewsTimeline} type="views" />
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-green-300" />
                <h3 className="font-semibold text-white">
                  Engagement Timeline
                </h3>
              </div>
              <TimelineChart
                data={data.engagementTimeline}
                type="engagements"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-white mb-4">
              Top Performing Articles
            </h3>
            <PopularArticlesList articles={data.popularArticles} />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-white mb-4">
              Popular Categories
            </h3>
            <div className="space-y-3">
              {data.popularCategories.map((category, index) => (
                <div
                  key={category.category_id}
                  className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-sm font-semibold text-purple-300">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-white">
                      {category.name}
                    </span>
                  </div>
                  <Badge className="bg-white/20 text-gray-300 border-white/30 backdrop-blur-sm">
                    {category.count} views
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
            <RecentActivity activities={data.recentActivity} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
