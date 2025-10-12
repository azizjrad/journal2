"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

interface AccessDeniedProps {
  role?: string;
  requiredRole?: string;
}

export function AccessDenied({
  role = "user",
  requiredRole = "admin",
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-red-600/20 flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-300 text-lg mb-2">
          You don't have permission to access this page.
        </p>

        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-white">Your role:</span>{" "}
            {role.toUpperCase()}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            <span className="font-semibold text-white">Required role:</span>{" "}
            {requiredRole.toUpperCase()}
          </p>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          This area is restricted to{" "}
          {requiredRole === "admin" ? "administrators" : "writers"} only. If you
          believe you should have access, please contact support.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.back()}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </div>

        {/* Support Link */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <a
            href="/contact"
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Need help? Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}
