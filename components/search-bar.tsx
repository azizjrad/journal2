"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";

interface SearchBarProps {
  initialQuery?: string;
  popularSearches: Array<{ text: string; count?: number }>;
}

export function SearchBar({
  initialQuery = "",
  popularSearches,
}: SearchBarProps) {
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

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="max-w-5xl mx-auto search-container">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {/* Search Container */}
          <div
            className={`flex items-center bg-white border border-gray-400 rounded-lg shadow-xl transition-all duration-300 ${
              isFocused
                ? "border-red-500 shadow-2xl"
                : "border-gray-400 hover:border-gray-500"
            }`}
          >
            {/* Search Icon */}
            <div className="pl-6 pr-4">
              <Search
                className={`w-6 h-6 transition-colors duration-300 ${
                  isFocused ? "text-red-500" : "text-gray-400"
                }`}
              />
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onFocus={() => {
                setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
              placeholder={t(
                "search_placeholder",
                "Enter Search Terms",
                "أدخل مصطلحات البحث"
              )}
              className="flex-1 py-5 px-2 text-lg text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none"
              autoComplete="off"
              dir={language === "ar" ? "rtl" : "ltr"}
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Search Button */}
            <button
              type="submit"
              disabled={!query.trim()}
              className={`px-10 py-5 text-lg font-bold tracking-wider transition-all duration-300 ${
                query.trim()
                  ? "bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {t("search_button", "SEARCH", "بحث")}
            </button>
          </div>

          {/* Floating Animation */}
          <div
            className={`absolute inset-0 -z-10 bg-gradient-to-r from-red-100 to-red-200 rounded-lg transition-all duration-500 scale-105 ${
              isFocused ? "opacity-20" : "opacity-0"
            }`}
          ></div>
        </div>
      </form>
    </div>
  );
}
