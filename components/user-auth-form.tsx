"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookie-util";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Lock,
  User,
  Shield,
  PenTool,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function UserAuthForm({ onSuccess, redirectTo }: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Registration state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regAccountType, setRegAccountType] = useState("user");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [showSuccessSpinner, setShowSuccessSpinner] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      // Always fetch CSRF token before login
      await fetch("/api/auth/csrf-token", { credentials: "include" });
      const csrfToken = getCookie("csrf-token");
      if (!csrfToken) {
        setLoginError("CSRF token missing. Please refresh and try again.");
        setLoginLoading(false);
        return;
      }
      const response = await fetch("/api/auth/unified-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on user role and redirect parameter
        if (data.user.role === "admin") {
          window.location.href = redirectParam || redirectTo || "/admin";
        } else if (data.user.role === "writer") {
          // Writer - redirect to writer dashboard
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = redirectParam || redirectTo || "/writer";
          }
        } else {
          // Regular user - redirect to specified location or home page
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = redirectParam || redirectTo || "/";
          }
        }
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    }

    setLoginLoading(false);
  };

  const handleForgotPasswordClick = () => {
    setActiveTab("forgot");
    setForgotEmail(loginEmail); // Pre-fill with the email they were trying to use
    setLoginError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess("");

    try {
      // Fetch CSRF token before registration
      await fetch("/api/auth/csrf-token", { credentials: "include" });
      const csrfToken = getCookie("csrf-token");

      if (!csrfToken) {
        setRegError("Security token missing. Please refresh and try again.");
        setRegLoading(false);
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          firstName: regFirstName,
          lastName: regLastName,
          accountType: regAccountType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRegSuccess(data.message);
        // Clear form
        setRegUsername("");
        setRegEmail("");
        setRegPassword("");
        setRegFirstName("");
        setRegLastName("");
        setRegAccountType("user");
      } else {
        setRegError(data.message || "Registration failed");
      }
    } catch (error) {
      setRegError("Registration failed. Please try again.");
    }

    setRegLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotSuccess(data.message);
        setForgotEmail("");
      } else {
        setForgotError(data.message || "Password reset failed");
      }
    } catch (error) {
      setForgotError("Password reset failed. Please try again.");
    }

    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-3 mb-6 cursor-pointer hover:scale-105 transition-transform duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  The Maghreb Orbit
                </h1>
                <p className="text-red-300 text-sm font-medium">Login Portal</p>
              </div>
            </div>
          </Link>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome
            </CardTitle>
            <p className="text-gray-300 mt-2">
              Sign in to your account or create a new one
            </p>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/5">
                <TabsTrigger
                  value="login"
                  className="text-white data-[state=active]:bg-red-600"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="text-white data-[state=active]:bg-red-600"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger
                  value="forgot"
                  className="text-white data-[state=active]:bg-red-600"
                >
                  Reset
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <Alert className="border-red-400 bg-red-900/20">
                      <AlertDescription className="text-red-300">
                        {loginError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          setLoginError("");
                        }}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setLoginError("");
                        }}
                        required
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors duration-200"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Signing In..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleForgotPasswordClick}
                      className="text-red-400 hover:text-red-300 font-medium text-sm p-0 h-auto"
                    >
                      Forgot Password?
                    </Button>
                  </div>

                  {/* Google Auth removed */}
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {regError && (
                    <Alert className="border-red-400 bg-red-900/20">
                      <AlertDescription className="text-red-300">
                        {regError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {regSuccess && (
                    <Alert className="border-green-400 bg-green-900/20">
                      <AlertDescription className="text-green-300">
                        {regSuccess}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-200">First Name</Label>
                      <Input
                        type="text"
                        placeholder="First name"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">Last Name</Label>
                      <Input
                        type="text"
                        placeholder="Last name"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-200">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors duration-200"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                      >
                        {showRegPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-200">Account Type</Label>
                    <Select
                      value={regAccountType}
                      onValueChange={setRegAccountType}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-white">
                        <SelectItem
                          value="user"
                          className="text-gray-200 hover:text-white hover:bg-gray-700 focus:text-white focus:bg-gray-700 data-[highlighted]:text-white data-[highlighted]:bg-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Regular User</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="writer"
                          className="text-gray-200 hover:text-white hover:bg-gray-700 focus:text-white focus:bg-gray-700 data-[highlighted]:text-white data-[highlighted]:bg-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <PenTool className="h-4 w-4" />
                            <span>Writer Application</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {regAccountType === "writer" && (
                      <div className="text-sm text-yellow-400 mt-2">
                        ⚠️ Writer applications are subject to admin approval.
                        You'll start with regular user permissions.
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                    disabled={regLoading}
                  >
                    {regLoading ? "Creating Account..." : "Create Account"}
                  </Button>

                  {/* Google Auth removed */}
                </form>
              </TabsContent>

              {/* Forgot Password Tab */}
              <TabsContent value="forgot">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {forgotError && (
                    <Alert className="border-red-400 bg-red-900/20">
                      <AlertDescription className="text-red-300">
                        {forgotError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {(forgotSuccess || forgotError) && (
                    <>
                      {forgotError ? (
                        <Alert className="border-red-400 bg-red-900/20">
                          <AlertDescription className="text-red-300">
                            {forgotError}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-green-400 bg-green-900/20">
                          <AlertDescription className="text-green-300">
                            {forgotSuccess}
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button
                        type="button"
                        className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                        disabled={forgotLoading || showSuccessSpinner}
                        onClick={async () => {
                          if (!forgotEmail) return;
                          setForgotLoading(true);
                          setForgotError("");
                          setForgotSuccess("");
                          setShowSuccessSpinner(true);
                          try {
                            const response = await fetch(
                              "/api/auth/forgot-password",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: forgotEmail }),
                              }
                            );
                            const data = await response.json();
                            if (data.success) {
                              setTimeout(() => {
                                setShowSuccessSpinner(false);
                                setForgotSuccess(data.message);
                              }, 1000);
                            } else {
                              setShowSuccessSpinner(false);
                              setForgotError(
                                data.message || "Password reset failed"
                              );
                            }
                          } catch (error) {
                            setShowSuccessSpinner(false);
                            setForgotError(
                              "Password reset failed. Please try again."
                            );
                          }
                          setForgotLoading(false);
                        }}
                      >
                        Send Again
                      </Button>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            © 2025 The Maghreb Orbit • News Portal
          </p>
        </div>
      </div>
    </div>
  );
}
