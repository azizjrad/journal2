"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";

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

    (async () => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: "_dryrun_" }),
      });
      const data = await response.json();
      if (!data.success && data.message?.toLowerCase().includes("expired")) {
        setError(
          "This password reset link has expired. Please request a new one.",
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

    const passwordRequirements = [
      { regex: /.{8,}/, message: "at least 8 characters" },
      { regex: /[A-Z]/, message: "an uppercase letter" },
      { regex: /[a-z]/, message: "a lowercase letter" },
      { regex: /[0-9]/, message: "a number" },
      { regex: /[^A-Za-z0-9]/, message: "a special character" },
    ];
    const failedReqs = passwordRequirements.filter(
      (req) => !req.regex.test(password),
    );
    if (failedReqs.length > 0) {
      setError(
        `Password must contain ${failedReqs.map((r) => r.message).join(", ")}.`,
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
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="space-y-1">
              <p className="text-[11px] tracking-[0.18em] uppercase text-slate-500 font-medium">
                The Maghreb Corridor
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                Reset password
              </h1>
            </div>
          </Link>
        </div>

        <Card className="border border-stone-200 bg-white shadow-sm rounded-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Create a new password
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Enter and confirm your new password below.
            </p>
          </CardHeader>

          <CardContent>
            {error && error.toLowerCase().includes("expired") ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Alert className="border-amber-200 bg-amber-50 mb-4">
                  <AlertDescription className="text-amber-900 text-sm">
                    This password reset link has expired. Please request a new one to reset your password.
                    <br />
                    If you did not receive the reset link, you can send it again below.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="border-[#7a3030]/30 text-[#7a3030] hover:bg-[#7a3030]/10 hover:text-[#632626]"
                    onClick={() =>
                      (window.location.href = "/auth/forgot-password")
                    }
                  >
                    Request New Password Reset
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-[#7a3030] text-white hover:bg-[#632626]"
                    onClick={() =>
                      (window.location.href = "/auth/forgot-password")
                    }
                  >
                    Send Again
                  </Button>
                </div>
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertDescription className="text-red-800 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            ) : null}

            {success && (
              <Alert className="border-green-200 bg-green-50 mb-4">
                <AlertDescription className="text-green-800 text-sm font-medium">
                  Password reset successful.
                  <br />
                  <span className="font-normal">Redirecting to login page...</span>
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-[#7a3030] hover:bg-[#7a3030]/10"
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
                  <Label className="text-slate-700">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-white border-stone-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7a3030] focus-visible:ring-[#7a3030]/30"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-[#7a3030] hover:bg-[#7a3030]/10"
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
                  className="w-full bg-[#7a3030] hover:bg-[#632626] text-white font-medium focus-visible:ring-[#7a3030]/40"
                  disabled={loading || !token}
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </form>
            )}
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
