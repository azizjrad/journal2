"use client";

import { useEffect, useState } from "react";
import { WriterDashboard } from "@/components/writer-dashboard";
import { useAuth } from "@/lib/user-auth";

export default function WriterPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/admin/articles", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // The API returns articles directly, not wrapped in a data object
          setArticles(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setArticlesLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchArticles();
    }
  }, [isAuthenticated, user]);

  if (isLoading || articlesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-xs mx-auto">
            <h3 className="text-lg font-semibold text-white mb-1">Loading</h3>
            <p className="text-gray-300 text-sm">Loading writer dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !user.id) {
    return null; // Layout will handle the redirect
  }

  return <WriterDashboard articles={articles as any} user={user as any} />;
}
