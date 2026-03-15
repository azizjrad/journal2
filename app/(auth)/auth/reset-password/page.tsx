"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Check if token is expired by making a dry run request
    (async () => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: "_dryrun_" }),
      });
      const data = await response.json();
      if (!data.success && data.message?.toLowerCase().includes("expired")) {
        setError(
          "This password reset link has expired. Please request a new one."
        );
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password requirements: at least 8 chars, one uppercase, one lowercase, one number, one special char
    const passwordRequirements = [
      { regex: /.{8,}/, message: "at least 8 characters" },
      { regex: /[A-Z]/, message: "an uppercase letter" },
      { regex: /[a-z]/, message: "a lowercase letter" },
      { regex: /[0-9]/, message: "a number" },
      { regex: /[^A-Za-z0-9]/, message: "a special character" },
    ];
    const failedReqs = passwordRequirements.filter(
      (req) => !req.regex.test(password)
    );
    if (failedReqs.length > 0) {
      setError(
        `Password must contain ${failedReqs.map((r) => r.message).join(", ")}.`
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setPassword("");
        setConfirmPassword("");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = "/auth";
        }, 3000);
      } else {
        setError(data.message || "Password reset failed. Please try again.");
      }
    } catch (error) {
      setError("Password reset failed. Please try again.");
    }

    setLoading(false);
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
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                The Maghreb Orbit
              </h1>
              <p className="text-red-300 text-sm font-medium">Password Reset</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white">
              Reset Your Password
            </CardTitle>
            <p className="text-gray-300 mt-2">Enter your new password below</p>
          </CardHeader>

          <CardContent>
            {error && error.toLowerCase().includes("expired") ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Alert className="border-red-400 bg-red-900/20 mb-4 max-w-md">
                  <AlertDescription className="text-red-300 text-lg font-semibold">
                    This password reset link has expired.
                    <br />
                    Please request a new one to reset your password.
                    <br />
                    If you did not receive the reset link, you can send it again
                    below.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="text-red-300 border-red-400 hover:bg-red-900/30"
                    onClick={() =>
                      (window.location.href = "/auth/forgot-password")
                    }
                  >
                    Request New Password Reset
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-red-300 border-red-400 hover:bg-red-900/30"
                    onClick={() =>
                      (window.location.href = "/auth/forgot-password")
                    }
                  >
                    Send Again
                  </Button>
                </div>
              </div>
            ) : error ? (
              <Alert className="border-red-400 bg-red-900/20 mb-4">
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            ) : null}

            {success && (
              <Alert className="border-green-400 bg-green-900/20 mb-4">
                <AlertDescription className="text-green-300 text-lg font-semibold">
                  Password reset successful.
                  <br />
                  <span className="text-sm">Redirecting to login page...</span>
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-200">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors duration-200"
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                  disabled={loading || !token}
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div class="text-center mt-6">
          <p class="text-sm text-gray-400">
            © 2025 The Maghreb Orbit • News Portal
          </p>
        </div>
      </div>
    </div>
  );
}
