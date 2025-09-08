"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  Mail,
  Crown,
  Calendar,
  CreditCard,
  Settings,
  Download,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";

interface NewsletterManagementProps {
  user: any;
  subscription: any;
}

export function NewsletterManagement({
  user,
  subscription,
}: NewsletterManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Mock subscription data - replace with actual data
  const mockSubscription = {
    id: "sub_123456789",
    plan: "premium",
    billing: "annual",
    status: "active",
    currentPeriodStart: "2025-01-01",
    currentPeriodEnd: "2025-12-31",
    cancelAtPeriodEnd: false,
    amount: 59.99,
    nextBillingDate: "2025-12-31",
    paymentMethod: {
      type: "card",
      last4: "4242",
      brand: "visa",
    },
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/newsletter/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: mockSubscription.id,
        }),
      });

      if (response.ok) {
        // Refresh the page or update state
        window.location.reload();
      } else {
        throw new Error("Cancellation failed");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("Cancellation failed. Please try again or contact support.");
    } finally {
      setIsLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const handleUpdatePayment = async () => {
    // Redirect to payment update page or open payment modal
    alert("Redirecting to payment update...");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600";
      case "canceled":
        return "bg-red-600";
      case "past_due":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-xl">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Newsletter Subscription
        </h1>
        <p className="text-xl text-gray-300">
          Manage your subscription and preferences
        </p>
      </div>

      {/* Subscription Status */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Current Subscription</CardTitle>
            <Badge
              className={`${getStatusColor(
                mockSubscription.status
              )} text-white`}
            >
              {mockSubscription.status.charAt(0).toUpperCase() +
                mockSubscription.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {mockSubscription.plan === "premium"
                      ? "Premium Newsletter"
                      : "Basic Newsletter"}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {mockSubscription.billing === "annual"
                      ? "Annual billing"
                      : "Monthly billing"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount:</span>
                  <span className="font-semibold">
                    ${mockSubscription.amount}/
                    {mockSubscription.billing === "annual" ? "year" : "month"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Next billing:</span>
                  <span className="font-semibold">
                    {formatDate(mockSubscription.nextBillingDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Subscription ID:</span>
                  <span className="font-mono text-sm">
                    {mockSubscription.id}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Payment Method</h4>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="font-medium">
                    {mockSubscription.paymentMethod.brand.toUpperCase()} ****
                    {mockSubscription.paymentMethod.last4}
                  </p>
                  <p className="text-gray-300 text-sm">Expires 12/26</p>
                </div>
              </div>

              <Button
                onClick={handleUpdatePayment}
                variant="outline"
                className="text-white border-white/20 bg-white/10 hover:bg-white/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Features */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Newsletter Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Daily digest</span>
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span>Weekly summary</span>
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span>Breaking news alerts</span>
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span>Premium articles</span>
                <Check className="w-5 h-5 text-green-400" />
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Preferences
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-sm">Newsletter sent</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm">Payment processed</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div>
                  <p className="text-sm">Premium content accessed</p>
                  <p className="text-xs text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Usage Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white mb-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              View FAQ
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            >
              Billing Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Section - Less prominent placement */}
      <div className="border-t border-white/10 pt-8">
        <details className="group">
          <summary className="cursor-pointer text-gray-400 hover:text-gray-300 text-sm flex items-center gap-2">
            <span>Subscription options</span>
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>

          <div className="mt-4 p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">
                  Cancel Subscription
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  You can cancel your subscription at any time. You'll continue
                  to have access until
                  {" " + formatDate(mockSubscription.currentPeriodEnd)}.
                </p>

                {!showCancelConfirm ? (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant="outline"
                    className="text-red-400 border-red-400/50 bg-red-900/20 hover:bg-red-900/40"
                  >
                    Cancel Subscription
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Alert className="border-red-400 bg-red-900/20">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-300">
                        Are you sure you want to cancel? You'll lose access to
                        premium features.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleCancelSubscription}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isLoading ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Yes, Cancel
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowCancelConfirm(false)}
                        variant="outline"
                        disabled={isLoading}
                        className="text-white border-white/20 bg-white/10 hover:bg-white/20"
                      >
                        Keep Subscription
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
