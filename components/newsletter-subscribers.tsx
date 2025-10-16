"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  XCircle,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan: "basic" | "premium";
  status: "active" | "canceled" | "past_due" | "trialing";
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
  const [filterPlan, setFilterPlan] = useState<"all" | "monthly" | "annual">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "canceled" | "past_due" | "trialing"
  >("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [subscriberToCancel, setSubscriberToCancel] =
    useState<Subscriber | null>(null);
  const [canceling, setCanceling] = useState(false);

  // Fetch subscribers from API
  const fetchSubscribers = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        plan: filterPlan,
        status: filterStatus,
        limit: "50",
        skip: "0",
      });

      // Add refresh parameter if requested
      if (forceRefresh) {
        params.append("refresh", "true");
      }

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

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!subscriberToCancel) return;

    try {
      setCanceling(true);

      const response = await fetch(
        "/api/admin/newsletter/cancel-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            subscriptionId: subscriberToCancel.id,
            reason: "Canceled by admin",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Show success toast
        toast({
          title: "Subscription Canceled",
          description: `Successfully canceled subscription for ${subscriberToCancel.firstName} ${subscriberToCancel.lastName}`,
          variant: "default",
        });

        // Refresh the subscribers list
        await fetchSubscribers(true);
        setCancelDialogOpen(false);
        setSubscriberToCancel(null);
      } else {
        // Show error toast
        toast({
          title: "Cancellation Failed",
          description: data.error || "Failed to cancel subscription",
          variant: "destructive",
        });
        console.error("Failed to cancel subscription:", data.error);
      }
    } catch (error) {
      // Show error toast
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while canceling the subscription",
        variant: "destructive",
      });
      console.error("Error canceling subscription:", error);
    } finally {
      setCanceling(false);
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
      case "trialing":
        return "bg-blue-600";
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

    const matchesPlan =
      filterPlan === "all" || subscriber.billingPeriod === filterPlan;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Newsletter Subscribers
          </h2>
          <p className="text-sm sm:text-base text-gray-300">
            Manage your newsletter subscribers and their preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => fetchSubscribers(true)}
            variant="outline"
            className="text-white border-white/20 bg-white/10 hover:bg-white/20 w-full sm:w-auto"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <p className="text-sm text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 sm:flex-initial sm:min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 w-full"
          />
        </div>

        <Select
          value={filterPlan}
          onValueChange={(value) =>
            setFilterPlan(value as "all" | "monthly" | "annual")
          }
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            force-portal="true"
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
          >
            <SelectItem
              value="all"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              All Plans
            </SelectItem>
            <SelectItem
              value="monthly"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Monthly
            </SelectItem>
            <SelectItem
              value="annual"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Annual
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterStatus}
          onValueChange={(value) =>
            setFilterStatus(
              value as "all" | "active" | "canceled" | "past_due" | "trialing"
            )
          }
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
          >
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
              value="trialing"
              className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
            >
              Trialing
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
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                    Subscriber
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                    Plan
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                    Status
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                    Revenue
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                    Last Activity
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-3 sm:p-4">
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {subscriber.firstName} {subscriber.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 truncate max-w-[200px]">
                          {subscriber.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined{" "}
                          {new Date(
                            subscriber.subscriptionDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <Badge
                        className={`${getPlanColor(
                          subscriber.plan
                        )} text-white text-xs w-fit`}
                      >
                        {subscriber.billingPeriod}
                      </Badge>
                    </td>
                    <td className="p-3 sm:p-4">
                      <Badge
                        className={`${getStatusColor(
                          subscriber.status
                        )} text-white text-xs`}
                      >
                        {subscriber.status}
                      </Badge>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div>
                        <p className="font-medium text-sm">
                          ${subscriber.totalPaid.toFixed(2)}
                        </p>
                        {subscriber.nextBilling && (
                          <p className="text-xs text-gray-400">
                            {subscriber.status === "trialing"
                              ? "Trial ends:"
                              : "Next:"}{" "}
                            {new Date(
                              subscriber.nextBilling
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <p className="text-xs sm:text-sm">
                        {subscriber.lastActivity
                          ? new Date(
                              subscriber.lastActivity
                            ).toLocaleDateString()
                          : "Never"}
                      </p>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        {subscriber.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-400/20 bg-red-500/10 hover:bg-red-500/20 h-8 px-3"
                            onClick={() => {
                              setSubscriberToCancel(subscriber);
                              setCancelDialogOpen(true);
                            }}
                            title="Cancel subscription"
                          >
                            <XCircle className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Cancel</span>
                          </Button>
                        )}
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

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="w-6 h-6" />
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to cancel the subscription for{" "}
              <span className="font-semibold text-white">
                {subscriberToCancel?.firstName} {subscriberToCancel?.lastName}
              </span>{" "}
              ({subscriberToCancel?.email})?
            </AlertDialogDescription>
            <div className="text-sm text-gray-300 space-y-3 pt-2">
              <p>This action will:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Immediately cancel their subscription in Stripe</li>
                <li>Update their status to "canceled" in the database</li>
                <li>Send them a cancellation confirmation email</li>
                <li>Remove their access to premium content</li>
              </ul>
              <p className="text-yellow-400 font-medium">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={canceling}
            >
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={canceling}
            >
              {canceling ? "Canceling..." : "Yes, Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
