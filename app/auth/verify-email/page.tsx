"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Invalid verification link. Please request a new verification email."
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
            data.message || "Your email has been verified. You can now log in."
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-3 mb-6 cursor-pointer hover:scale-105 transition-transform duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  Akhbarna
                </h1>
                <p className="text-red-300 text-sm font-medium">
                  Email Verification
                </p>
              </div>
            </div>
          </Link>
        </div>
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-6 min-h-[300px] flex flex-col justify-between">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white">
              Verify Your Email
            </CardTitle>
            <p className="text-gray-300 mt-2">
              Complete your registration by verifying your email
            </p>
          </CardHeader>
          <CardContent>
            {status === "pending" && (
              <Alert className="border-yellow-400 bg-yellow-900/20 mb-4">
                <AlertDescription className="text-yellow-300">
                  Verifying your email...
                </AlertDescription>
              </Alert>
            )}
            {status === "success" && (
              <>
                <Alert className="border-green-400 bg-green-900/20 mb-4 flex items-center">
                  <CheckCircle
                    className="h-5 w-5 mr-2"
                    style={{ color: "#86efac" }}
                  />
                  <AlertDescription className="text-green-300">
                    {message}
                  </AlertDescription>
                </Alert>
                {/* ...existing code... */}
              </>
            )}
            {status === "error" && (
              <>
                <Alert className="border-red-400 bg-red-900/20 mb-4 flex items-center">
                  <XCircle
                    className="h-5 w-5 mr-2"
                    style={{ color: "#fca5a5" }}
                  />
                  <AlertDescription className="text-red-300">
                    {message}
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
          <div className="text-center mt-0">
            <div className="flex justify-center mb-2">
              <Link
                href="/auth"
                className="text-base text-gray-300 hover:underline hover:text-gray-300 focus:text-gray-300 transition-all duration-150"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </Card>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">© 2025 Akhbarna • News Portal</p>
        </div>
      </div>
    </div>
  );
}
