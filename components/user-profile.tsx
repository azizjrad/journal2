"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/user-auth";

export function UserProfile() {
  const { user, logout, refreshUser } = useAuth();

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
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Load user profile data
  useEffect(() => {
    loadProfileData();
  }, []);

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
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileData(data.profile);
        }
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
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          bio,
          displayName,
          website,
          location,
          socialTwitter,
          socialLinkedin,
          socialGithub,
        }),
        credentials: "include",
      });

      const data = await response.json();

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
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: "include",
      });

      const data = await response.json();

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
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5">
                  <TabsTrigger
                    value="profile"
                    className="text-white data-[state=active]:bg-red-600"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="text-white data-[state=active]:bg-red-600"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
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
    </>
  );
}
