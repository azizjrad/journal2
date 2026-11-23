"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/auth/cookie-util";
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
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="space-y-1">
              <p className="text-[11px] tracking-[0.18em] uppercase text-slate-500 font-medium">
                The Maghreb Corridor
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                Account access
              </h1>
            </div>
          </Link>
        </div>

        <Card className="border border-stone-200 bg-white shadow-sm rounded-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Welcome
            </CardTitle>
            <p className="text-slate-600 mt-1 text-sm">
              Use your email and password to continue
            </p>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#7a3030]/5 p-1 rounded-md h-auto border border-[#7a3030]/10">
                <TabsTrigger
                  value="login"
                  className="text-slate-600 hover:text-[#7a3030] data-[state=active]:bg-white data-[state=active]:text-[#7a3030] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#7a3030]/20 focus-visible:ring-[#7a3030]/30 rounded-sm py-1.5"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="text-slate-600 hover:text-[#7a3030] data-[state=active]:bg-white data-[state=active]:text-[#7a3030] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#7a3030]/20 focus-visible:ring-[#7a3030]/30 rounded-sm py-1.5"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger
                  value="forgot"
                  className="text-slate-600 hover:text-[#7a3030] data-[state=active]:bg-white data-[state=active]:text-[#7a3030] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#7a3030]/20 focus-visible:ring-[#7a3030]/30 rounded-sm py-1.5"
                >
                  Reset
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {loginError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label className="text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          setLoginError("");
                        }}
                        required
                        className="pl-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setLoginError("");
                        }}
                        required
                        className="pl-10 pr-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-[#7a3030] hover:bg-[#7a3030]/10 transition-colors duration-200"
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
                    className="w-full bg-[#7a3030] hover:bg-[#632626] text-white font-medium focus-visible:ring-[#7a3030]/40"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Signing In..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleForgotPasswordClick}
                      className="text-[#7a3030] hover:text-[#632626] font-medium text-sm p-0 h-auto focus-visible:ring-[#7a3030]/30"
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
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {regError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {regSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        {regSuccess}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">First Name</Label>
                      <Input
                        type="text"
                        placeholder="First name"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        className="bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">Last Name</Label>
                      <Input
                        type="text"
                        placeholder="Last name"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        className="bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        required
                        className="pl-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="pl-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-[#7a3030] hover:bg-[#7a3030]/10 transition-colors duration-200"
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
                    <Label className="text-slate-700">Account Type</Label>
                    <Select
                      value={regAccountType}
                      onValueChange={setRegAccountType}
                    >
                      <SelectTrigger className="bg-white border-stone-300 text-slate-900 focus:border-[#7a3030] focus:ring-[#7a3030]/30 data-[state=open]:border-[#7a3030] data-[state=open]:ring-[#7a3030]/30">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-stone-200 text-slate-900">
                        <SelectItem
                          value="user"
                          className="text-slate-700 hover:text-[#7a3030] hover:bg-[#7a3030]/10 focus:text-[#7a3030] focus:bg-[#7a3030]/10 data-[highlighted]:text-[#7a3030] data-[highlighted]:bg-[#7a3030]/10"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Regular User</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="writer"
                          className="text-slate-700 hover:text-[#7a3030] hover:bg-[#7a3030]/10 focus:text-[#7a3030] focus:bg-[#7a3030]/10 data-[highlighted]:text-[#7a3030] data-[highlighted]:bg-[#7a3030]/10"
                        >
                          <div className="flex items-center gap-2">
                            <PenTool className="h-4 w-4" />
                            <span>Writer Application</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {regAccountType === "writer" && (
                      <div className="text-sm text-amber-700 mt-2">
                        ⚠️ Writer applications are subject to admin approval.
                        You'll start with regular user permissions.
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#7a3030] hover:bg-[#632626] text-white font-medium focus-visible:ring-[#7a3030]/40"
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
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {forgotError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {(forgotSuccess || forgotError) && (
                    <>
                      {forgotError ? (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800">
                            {forgotError}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-green-200 bg-green-50">
                          <AlertDescription className="text-green-800">
                            {forgotSuccess}
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button
                        type="button"
                        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium focus-visible:ring-slate-400"
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
                    <Label className="text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="pl-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#7a3030] hover:bg-[#632626] text-white font-medium focus-visible:ring-[#7a3030]/40"
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
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} The Maghreb Corridor
          </p>
        </div>
      </div>
    </div>
  );
}
