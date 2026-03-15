"use client";

import Link from "next/link";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">You're Offline</h1>
          <p className="text-gray-300 text-lg">
            No internet connection detected
          </p>
        </div>

        {/* Offline Message */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">
            Don't worry!
          </h2>
          <p className="text-gray-300 mb-4">
            Some content may still be available from your recent visits. Check
            your connection and try again.
          </p>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Connection lost</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full text-white border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-8 text-left">
          <h3 className="text-white font-semibold mb-3">
            Troubleshooting Tips:
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Check your WiFi or mobile data connection</li>
            <li>• Make sure you're not in airplane mode</li>
            <li>• Try refreshing the page</li>
            <li>• Contact your internet service provider if issues persist</li>
          </ul>
        </div>

        {/* Branding */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 The Maghreb Orbit • News Portal
          </p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
