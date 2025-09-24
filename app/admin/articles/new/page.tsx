"use client";

import { useEffect, useState } from "react";
import { NewArticleForm } from "@/components/new-article-form";
import { CategoryInterface } from "@/lib/db";

export default function NewArticlePage() {
  const [categories, setCategories] = useState<CategoryInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading...</p>
          </div>
        </div>
      ) : (
        <NewArticleForm categories={categories} />
      )}
    </div>
  );
}
