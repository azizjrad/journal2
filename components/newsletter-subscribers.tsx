"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Crown,
  Calendar,
  Search,
  Download,
  RefreshCw,
  Filter,
  UserX,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  MoreVertical,
  UserCheck,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan: "basic" | "premium";
  status: "active" | "canceled" | "past_due";
  billingPeriod: "monthly" | "annual";
  subscriptionDate: string;
  nextBilling?: string;
  totalPaid: number;
  preferences: {
    dailyDigest: boolean;
    weeklyNewsletter: boolean;
    breakingNews: boolean;
    premiumContent: boolean;
  };
  lastActivity?: string;
  engagement: {
    emailsOpened: number;
    clickThroughRate: number;
    totalEmailsSent: number;
  };
}

interface NewsletterSubscribersProps {
  subscribers?: Subscriber[];
}

export function NewsletterSubscribers({
  subscribers = [],
}: NewsletterSubscribersProps) {
  const [subscribersList, setSubscribersList] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "basic" | "premium">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "canceled" | "past_due"
  >("all");

  // Fetch subscribers from API
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        plan: filterPlan,
        status: filterStatus,
        limit: "50",
        skip: "0",
      });

      const response = await fetch(
        `/api/admin/newsletter/subscribers?${params}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }

      const data = await response.json();

      if (data.success) {
        setSubscribersList(data.subscribers);
        setApiStats(data.stats);
      } else {
        console.error("Failed to fetch subscribers:", data.error);
        setSubscribersList([]);
        setApiStats(null);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setSubscribersList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchSubscribers();
  }, [searchTerm, filterPlan, filterStatus]);

  const getStatusColor = (status: Subscriber["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-600";
      case "canceled":
        return "bg-gray-600";
      case "past_due":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getPlanColor = (plan: Subscriber["plan"]) => {
    switch (plan) {
      case "premium":
        return "bg-purple-600";
      case "basic":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const filteredSubscribers = subscribersList.filter((subscriber) => {
    const matchesSearch =
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${subscriber.firstName} ${subscriber.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesPlan = filterPlan === "all" || subscriber.plan === filterPlan;
    const matchesStatus =
      filterStatus === "all" || subscriber.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Use stats from API response, fallback to calculated values if not available
  const stats = apiStats || {
    total: subscribersList.length,
    active: subscribersList.filter((s) => s.status === "active").length,
    premium: subscribersList.filter((s) => s.plan === "premium").length,
    totalRevenue: subscribersList.reduce((sum, s) => sum + s.totalPaid, 0),
    avgEngagement:
      subscribersList.reduce(
        (sum, s) => sum + s.engagement.clickThroughRate,
        0
      ) / subscribersList.length || 0,
  };

  const handleExportSubscribers = () => {
    // Implementation for exporting subscriber data
    console.log("Exporting subscribers...");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Newsletter Subscribers
          </h2>
          <p className="text-gray-300">
            Manage your newsletter subscribers and their preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-white border-white/20 bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Subscribers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.active}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Premium</p>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.premium}
                </p>
              </div>
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Avg. Engagement</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.avgEngagement.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
          />
        </div>

        <Select
          value={filterPlan}
          onValueChange={(value) =>
            setFilterPlan(value as "all" | "basic" | "premium")
          }
        >
          <SelectTrigger className="w-[140px] bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
            <SelectItem
              value="all"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              All Plans
            </SelectItem>
            <SelectItem
              value="basic"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Basic
            </SelectItem>
            <SelectItem
              value="premium"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Premium
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterStatus}
          onValueChange={(value) =>
            setFilterStatus(value as "all" | "active" | "canceled" | "past_due")
          }
        >
          <SelectTrigger className="w-[140px] bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
            <SelectItem
              value="all"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              All Status
            </SelectItem>
            <SelectItem
              value="active"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Active
            </SelectItem>
            <SelectItem
              value="canceled"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Canceled
            </SelectItem>
            <SelectItem
              value="past_due"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Past Due
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscribers Table */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 font-semibold">Subscriber</th>
                  <th className="text-left p-4 font-semibold">Plan</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Revenue</th>
                  <th className="text-left p-4 font-semibold">Engagement</th>
                  <th className="text-left p-4 font-semibold">Last Activity</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {subscriber.firstName} {subscriber.lastName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {subscriber.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined{" "}
                          {new Date(
                            subscriber.subscriptionDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getPlanColor(
                            subscriber.plan
                          )} text-white`}
                        >
                          {subscriber.plan}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {subscriber.billingPeriod}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`${getStatusColor(
                          subscriber.status
                        )} text-white`}
                      >
                        {subscriber.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          ${subscriber.totalPaid.toFixed(2)}
                        </p>
                        {subscriber.nextBilling && (
                          <p className="text-xs text-gray-400">
                            Next:{" "}
                            {new Date(
                              subscriber.nextBilling
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {subscriber.engagement.clickThroughRate}%
                        </p>
                        <p className="text-xs text-gray-400">
                          {subscriber.engagement.emailsOpened}/
                          {subscriber.engagement.totalEmailsSent} opened
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">
                        {subscriber.lastActivity
                          ? new Date(
                              subscriber.lastActivity
                            ).toLocaleDateString()
                          : "Never"}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-white border-white/20 bg-white/10 h-8 w-8 p-0"
                          onClick={() =>
                            console.log("View subscriber", subscriber.id)
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-white border-white/20 bg-white/10 h-8 w-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredSubscribers.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Subscribers Found</h3>
            <p className="text-gray-300">
              {searchTerm || filterPlan !== "all" || filterStatus !== "all"
                ? "No subscribers match your current filters."
                : "No newsletter subscribers yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
