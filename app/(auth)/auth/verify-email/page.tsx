"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Invalid verification link. Please request a new verification email.",
      );
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (data.success) {
          setStatus("success");
          setMessage(
            data.message || "Your email has been verified. You can now log in.",
          );
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. Please try again.");
        }
      } catch {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      }
    };
    verify();
  }, [token]);

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
                Email verification
              </h1>
            </div>
          </Link>
        </div>

        <Card className="border border-stone-200 bg-white shadow-sm rounded-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Verify your email
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Complete your registration by verifying your email address.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "pending" && (
              <Alert className="border-stone-200 bg-stone-50">
                <AlertDescription className="text-slate-700 text-sm">
                  Verifying your email...
                </AlertDescription>
              </Alert>
            )}
            {status === "success" && (
              <Alert className="border-green-200 bg-green-50 flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-700 mt-0.5 shrink-0" />
                <AlertDescription className="text-green-800 text-sm">
                  {message}
                </AlertDescription>
              </Alert>
            )}
            {status === "error" && (
              <Alert className="border-red-200 bg-red-50 flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-700 mt-0.5 shrink-0" />
                <AlertDescription className="text-red-800 text-sm">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center pt-2">
              <Link
                href="/auth"
                className="text-sm font-medium text-slate-800 hover:text-slate-950 underline-offset-4 hover:underline"
              >
                Go to Login
              </Link>
            </div>
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
