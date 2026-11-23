"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/context/language-context";

interface SearchBarProps {
  initialQuery?: string;
  popularSearches: Array<{ text: string; count?: number }>;
}

export function SearchBar({ initialQuery = "", popularSearches }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { language, t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center bg-white border rounded-md transition-colors ${
            isFocused ? "border-[#7a3030] ring-2 ring-[#7a3030]/10" : "border-stone-300 hover:border-stone-400"
          }`}
        >
          <div className="ps-4 pe-2">
            <Search className={`w-5 h-5 ${isFocused ? "text-[#7a3030]" : "text-slate-400"}`} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t("search_placeholder", "Search dispatches and articles", "ابحث في التقارير والمقالات")}
            className="flex-1 py-3.5 px-2 text-sm md:text-base text-slate-900 placeholder-slate-500 bg-transparent border-none outline-none"
            autoComplete="off"
            dir={language === "ar" ? "rtl" : "ltr"}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="p-2 text-slate-400 hover:text-slate-600" aria-label={t("clear", "Clear", "مسح")}> 
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim()}
            className={`px-5 md:px-7 py-3.5 text-sm font-medium tracking-wide transition-colors border-s border-stone-200 ${
              query.trim() ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }`}
          >
            {t("search_button", "Search", "بحث")}
          </button>
        </div>
      </form>
      {popularSearches?.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 justify-center text-sm">
          <span className="text-slate-500">{t("popular", "Popular:", "شائع:")}</span>
          {popularSearches.slice(0, 5).map((item) => (
            <button
              key={item.text}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(item.text)}`)}
              className="px-2.5 py-1 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-slate-700"
            >
              {item.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}