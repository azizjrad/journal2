"use client";

import { useEffect, useState } from "react";
import { AccessDenied } from "@/components/access-denied";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AdminSessionGuardProps {
  children: React.ReactNode;
}

export function AdminSessionGuard({ children }: AdminSessionGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check admin authentication status
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.authenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        setSessionExpired(false);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Admin auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/unified-logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Admin-specific loading animation */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-red-500 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Admin Dashboard Text */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-white mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-300 text-sm">Verifying admin access...</p>

            {/* Loading dots */}
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || sessionExpired) {
    // Redirect to unified login page
    if (typeof window !== "undefined") {
      window.location.href = "/auth?redirect=/admin";
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-xs mx-auto">
            <h3 className="text-lg font-semibold text-white mb-1">
              Redirecting
            </h3>
            <p className="text-gray-300 text-sm">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check user role - only admin can access admin dashboard
  if (user.role !== "admin") {
    return <AccessDenied role={user.role} requiredRole="admin" />;
  }

  return (
    <div className="fixed inset-0 min-h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      {children}
    </div>
  );
}
