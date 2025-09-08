"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw, ArrowLeft } from "lucide-react";

interface LoginTimeoutProps {
  onRetry?: () => void;
  redirectDelay?: number;
}

export function LoginTimeout({
  onRetry,
  redirectDelay = 10000,
}: LoginTimeoutProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth");
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [router, redirectDelay]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.push("/auth");
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Login Timeout
            </CardTitle>
            <p className="text-gray-300">
              The login process is taking longer than expected. This might be
              due to network issues or server load.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pb-6">
            <div className="text-center text-sm text-gray-400 mb-6">
              <p>
                You will be automatically redirected to the login page in{" "}
                {redirectDelay / 1000} seconds.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full h-12 border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                If this problem persists, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
