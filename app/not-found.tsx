"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Home,
  Search,
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  Globe,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function NotFound() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const isRTL = language === "ar";

  const quickLinks = [
    {
      href: "/",
      icon: Home,
      label: t("home", "Home", "الرئيسية"),
      description: t(
        "home_desc",
        "Return to homepage",
        "العودة للصفحة الرئيسية"
      ),
    },
    {
      href: "/news",
      icon: BookOpen,
      label: t("all_news", "All News", "جميع الأخبار"),
      description: t(
        "all_news_desc",
        "Browse latest articles",
        "تصفح آخر المقالات"
      ),
    },
    {
      href: "/search",
      icon: Search,
      label: t("search", "Search", "البحث"),
      description: t(
        "search_desc",
        "Find specific content",
        "البحث عن محتوى محدد"
      ),
    },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Header with Logo and Language Switcher */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 rtl:space-x-reverse group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative">
                <span className="text-white font-bold text-sm">DJ</span>
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-300">
                  {language === "ar" ? "الجريدة الرقمية" : "Digital Journal"}
                </h1>
                <p className="text-xs text-gray-600">
                  {language === "ar"
                    ? "أخبار متنوعة وموثوقة"
                    : "Diverse & Reliable News"}
                </p>
              </div>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-16">
        <div className="text-center mb-16">
          {/* 404 Visual */}
          <div className="relative mb-8">
            <div className="text-8xl md:text-9xl font-bold text-red-100 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-xl animate-pulse relative">
                <span className="text-white font-bold text-2xl">DJ</span>
                <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {t("page_not_found", "Page Not Found", "الصفحة غير موجودة")}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t(
                "page_not_found_desc",
                "We're sorry, but the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.",
                "نأسف، لكن الصفحة التي تبحث عنها غير موجودة. ربما تم نقلها أو حذفها أو أدخلت رابطاً خاطئاً."
              )}
            </p>
          </div>

          {/* Search Box */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    "search_placeholder",
                    "Search for articles...",
                    "البحث عن المقالات..."
                  )}
                  className="w-full pr-12 pl-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500 bg-white shadow-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
            <Button
              onClick={goBack}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 px-6 py-3 text-lg border-2 border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors duration-200"
            >
              {isRTL ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ArrowLeft className="w-5 h-5" />
              )}
              {t("go_back", "Go Back", "العودة")}
            </Button>

            <Link href="/">
              <Button
                size="lg"
                className="flex items-center gap-2 px-6 py-3 text-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                {t("home", "Home", "الرئيسية")}
              </Button>
            </Link>

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 px-6 py-3 text-lg border-2 border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors duration-200"
            >
              <RefreshCcw className="w-5 h-5" />
              {t("refresh", "Refresh", "تحديث")}
            </Button>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.href}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors duration-300">
                      <link.icon className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300">
                      {link.label}
                    </h3>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="text-center py-8 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {t(
                "error_time",
                "If this problem persists, please contact support",
                "إذا استمرت هذه المشكلة، يرجى الاتصال بالدعم"
              )}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {t(
              "error_code",
              "Error Code: 404 - Page Not Found",
              "رمز الخطأ: 404 - الصفحة غير موجودة"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
