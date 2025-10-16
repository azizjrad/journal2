"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import Header from "@/components/header";
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
  User,
  Mail,
  MapPin,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Settings,
  Key,
  Eye,
  EyeOff,
  Save,
  LogOut,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/user-auth";
import api from "@/lib/api-client";
import { useToast } from "@/lib/use-toast";

export function UserProfile() {
  const { user, logout, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(tabParam);

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialGithub, setSocialGithub] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const { toast } = useToast();
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Load user profile data
  useEffect(() => {
    loadProfileData();
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const response = await api.get("/user/subscription");
      const data = response.data;
      if (data.success) {
        setSubscriptionData(data.subscription);
      }
    } catch (error) {
      console.error("Failed to load subscription:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Cancel subscription handler
  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);

      const response = await fetch("/api/newsletter/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Subscription Canceled",
          description:
            "Your subscription has been successfully canceled. You'll retain access until the end of your billing period.",
          className: "bg-white/10 backdrop-blur-xl border-white/20 text-white",
        });
        setCancelDialogOpen(false);
        // Reload subscription data
        await loadSubscriptionData();
        await refreshUser();
      } else {
        toast({
          title: "Cancellation Failed",
          description:
            data.error || "Failed to cancel subscription. Please try again.",
          variant: "destructive",
          className:
            "bg-red-500/10 backdrop-blur-xl border-red-500/20 text-white",
        });
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        className:
          "bg-red-500/10 backdrop-blur-xl border-red-500/20 text-white",
      });
    } finally {
      setCanceling(false);
    }
  };

  // Populate form when user data loads
  useEffect(() => {
    if (user && profileData) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setBio(user.bio || "");
      setDisplayName(profileData.display_name || "");
      setWebsite(profileData.website || "");
      setLocation(profileData.location || "");
      setSocialTwitter(profileData.social_twitter || "");
      setSocialLinkedin(profileData.social_linkedin || "");
      setSocialGithub(profileData.social_github || "");
    }
  }, [user, profileData]);

  const loadProfileData = async () => {
    try {
      const response = await api.get("/user/profile");
      const data = response.data;
      if (data.success) {
        setProfileData(data.profile);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await api.put("/user/profile", {
        firstName,
        lastName,
        bio,
        displayName,
        website,
        location,
        socialTwitter,
        socialLinkedin,
        socialGithub,
      });
      const data = response.data;
      if (data.success) {
        setProfileSuccess("Profile updated successfully!");
        await refreshUser();
        setProfileData(data.profile);
      } else {
        setProfileError(data.message || "Failed to update profile");
      }
    } catch (error) {
      setProfileError("Failed to update profile. Please try again.");
    }

    setProfileLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await api.put("/user/change-password", {
        currentPassword,
        newPassword,
      });
      const data = response.data;
      if (data.success) {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.message || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("Failed to change password. Please try again.");
    }

    setPasswordLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-600";
      case "writer":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  if (!user) {
    return (
      <>
        <Header categories={[]} />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Please log in to view your profile
            </h2>
            <Button onClick={() => (window.location.href = "/auth")}>
              Go to Login
            </Button>
          </div>
        </div>
      </>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Profile Settings" },
  ];

  return (
    <>
      <Header categories={[]} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
              My Profile
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-gray-300">
                Welcome back, {user.first_name || user.username}!
              </p>
              <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                {user.role.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="text-white border-white/20 bg-white/10 hover:bg-white/20"
              >
                Back to Home
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-red-300 border-red-400/50 bg-red-900/20 hover:bg-red-900/40"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex flex-col sm:grid sm:grid-cols-3 w-full mb-6 bg-white/5 gap-2 sm:gap-0 h-auto p-2">
                  <TabsTrigger
                    value="profile"
                    className="text-white data-[state=active]:bg-red-600 justify-start sm:justify-center px-4 py-3 w-full"
                  >
                    <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base whitespace-nowrap">
                      Profile Settings
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="text-white data-[state=active]:bg-red-600 justify-start sm:justify-center px-4 py-3 w-full"
                  >
                    <Key className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base whitespace-nowrap">
                      Change Password
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="subscription"
                    className="text-white data-[state=active]:bg-red-600 justify-start sm:justify-center px-4 py-3 w-full"
                  >
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base whitespace-nowrap">
                      Subscription
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {profileError && (
                      <Alert className="border-red-400 bg-red-900/20">
                        <AlertDescription className="text-red-300">
                          {profileError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {profileSuccess && (
                      <Alert className="border-green-400 bg-green-900/20">
                        <AlertDescription className="text-green-300">
                          {profileSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">First Name</Label>
                          <Input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-200">Last Name</Label>
                          <Input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={user.email}
                            disabled
                            className="pl-10 bg-gray-800/50 border-gray-600 text-gray-400"
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          Email cannot be changed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Display Name</Label>
                        <Input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                          placeholder="How should others see your name?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Bio</Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-300 min-h-[100px]"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Contact Information
                      </h3>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Social Links
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-200">Twitter</Label>
                          <div className="relative">
                            <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              value={socialTwitter}
                              onChange={(e) => setSocialTwitter(e.target.value)}
                              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                              placeholder="@username"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-200">LinkedIn</Label>
                          <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              value={socialLinkedin}
                              onChange={(e) =>
                                setSocialLinkedin(e.target.value)
                              }
                              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                              placeholder="linkedin.com/in/username"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-200">GitHub</Label>
                          <div className="relative">
                            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              value={socialGithub}
                              onChange={(e) => setSocialGithub(e.target.value)}
                              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                              placeholder="github.com/username"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Subscription Tab */}
                <TabsContent value="subscription">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Newsletter Subscription
                    </h3>

                    {/* Check if user has active subscription */}
                    {subscriptionLoading ? (
                      <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center">
                        <div className="text-gray-300">
                          Loading subscription...
                        </div>
                      </div>
                    ) : subscriptionData?.status === "active" ||
                      subscriptionData?.status === "trialing" ? (
                      <>
                        {/* Active Subscription Card */}
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-white mb-1">
                                {subscriptionData.plan === "annual"
                                  ? "Annual Digital Access"
                                  : "Monthly Digital Access"}
                              </h4>
                              <Badge
                                className={
                                  subscriptionData.status === "trialing"
                                    ? "bg-blue-600 text-white"
                                    : "bg-green-600 text-white"
                                }
                              >
                                {subscriptionData.status === "trialing"
                                  ? "Trial"
                                  : "Active"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">
                                $
                                {subscriptionData.plan === "annual"
                                  ? "48"
                                  : "4"}
                              </div>
                              <div className="text-sm text-gray-400">
                                per{" "}
                                {subscriptionData.plan === "annual"
                                  ? "year"
                                  : "month"}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">
                                {subscriptionData.status === "trialing"
                                  ? "Trial Ends"
                                  : "Next Billing Date"}
                              </div>
                              <div className="text-white font-medium">
                                {subscriptionData.status === "trialing" &&
                                subscriptionData.trial_end
                                  ? new Date(
                                      subscriptionData.trial_end
                                    ).toLocaleDateString()
                                  : subscriptionData.current_period_end
                                  ? new Date(
                                      subscriptionData.current_period_end
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400 mb-1">
                                Payment Method
                              </div>
                              <div className="text-white font-medium">
                                {subscriptionData.payment_method?.brand ||
                                  subscriptionData.payment_method?.type ||
                                  "Card"}
                                {subscriptionData.payment_method?.last4 &&
                                  ` •••• ${subscriptionData.payment_method.last4}`}
                              </div>
                            </div>
                          </div>

                          {subscriptionData.status === "trialing" && (
                            <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                              <p className="text-sm text-blue-200">
                                🎉 You're on a free trial! Your subscription
                                will automatically activate when the trial ends.
                                No charges until then.
                              </p>
                            </div>
                          )}

                          <div className="flex gap-3 pt-4">
                            <Button
                              variant="outline"
                              className="flex-1 text-white border-white/20 bg-white/10 hover:bg-white/20"
                              onClick={async () => {
                                try {
                                  const response = await fetch(
                                    "/api/newsletter/create-portal-session",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        customerId:
                                          subscriptionData.stripe_customer_id,
                                      }),
                                    }
                                  );

                                  if (response.ok) {
                                    const data = await response.json();
                                    window.location.href = data.url;
                                  } else {
                                    console.error(
                                      "Failed to create portal session"
                                    );
                                    alert(
                                      "Failed to open billing portal. Please try again."
                                    );
                                  }
                                } catch (error) {
                                  console.error("Error:", error);
                                  alert(
                                    "Failed to open billing portal. Please try again."
                                  );
                                }
                              }}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Manage Billing
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 text-red-300 border-red-400/50 bg-red-900/20 hover:bg-red-900/40"
                              onClick={() => setCancelDialogOpen(true)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>

                        {/* Subscription Benefits */}
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <h4 className="text-lg font-semibold text-white mb-4">
                            Your Benefits
                          </h4>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-300">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              Unlimited access to premium articles
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              Daily newsletter delivered to your inbox
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              Ad-free reading experience
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              Exclusive member-only content
                            </li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      /* No Active Subscription */
                      <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center">
                        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="w-8 h-8 text-red-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">
                          No Active Subscription
                        </h4>
                        <p className="text-gray-300 mb-6">
                          Subscribe to get unlimited access to premium content
                          and exclusive newsletters.
                        </p>
                        <Button
                          onClick={() => (window.location.href = "/newsletter")}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8"
                        >
                          View Subscription Plans
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Password Tab */}
                <TabsContent value="password">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    {passwordError && (
                      <Alert className="border-red-400 bg-red-900/20">
                        <AlertDescription className="text-red-300">
                          {passwordError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {passwordSuccess && (
                      <Alert className="border-green-400 bg-green-900/20">
                        <AlertDescription className="text-green-300">
                          {passwordSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Change Password
                      </h3>

                      <div className="space-y-2">
                        <Label className="text-gray-200">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="pr-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="pr-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-200">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="pr-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Password requirements:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>At least 8 characters long</li>
                          <li>At least one uppercase letter</li>
                          <li>At least one lowercase letter</li>
                          <li>At least one number</li>
                          <li>At least one special character</li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                      disabled={passwordLoading}
                    >
                      {passwordLoading
                        ? "Changing Password..."
                        : "Change Password"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-red-500/30 text-white max-w-md backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-red-400 text-xl">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              Cancel Subscription?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-base pt-2">
              Are you sure you want to cancel your newsletter subscription?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* What happens section */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm font-semibold text-white mb-3">
                What happens next:
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Your subscription will be canceled immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>
                    You'll retain access until{" "}
                    {subscriptionData?.current_period_end
                      ? new Date(
                          subscriptionData.current_period_end
                        ).toLocaleDateString()
                      : "the end of your billing period"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>
                    No refunds will be issued for the remaining period
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>You can resubscribe anytime</span>
                </li>
              </ul>
            </div>

            {/* Benefits lost section */}
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <p className="text-sm font-semibold text-yellow-400 mb-2">
                You'll lose access to:
              </p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-yellow-400" />
                  <span>Premium articles and exclusive content</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-yellow-400" />
                  <span>Daily newsletter in your inbox</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-yellow-400" />
                  <span>Ad-free reading experience</span>
                </li>
              </ul>
            </div>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              disabled={canceling}
            >
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
            >
              {canceling ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Canceling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Yes, Cancel Subscription
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
