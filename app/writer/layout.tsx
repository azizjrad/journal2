"use client";

import { AuthProvider, useAuth } from "@/lib/user-auth";
import { AccessDenied } from "@/components/access-denied";

function WriterContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Writer-specific loading animation */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-500 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Writer Dashboard Text */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-white mb-2">
              Writer Dashboard
            </h2>
            <p className="text-gray-300 text-sm">Verifying writer access...</p>

            {/* Loading dots */}
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to unified login
    if (typeof window !== "undefined") {
      window.location.href = "/auth?redirect=/writer";
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
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

  // Check if user has writer or admin role
  if (user.role !== "writer" && user.role !== "admin") {
    return <AccessDenied role={user.role} requiredRole="writer" />;
  }

  return <>{children}</>;
}

export default function WriterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WriterContent>{children}</WriterContent>
    </AuthProvider>
  );
}
