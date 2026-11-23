"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useLanguage } from "@/lib/context/language-context";

export default function NotFound() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const isRTL = language === "ar";

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

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f8f7f4] text-slate-900"
    >
      <div className="border-b border-stone-300/80 bg-[#f8f7f4]/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
              {t("maghreb_corridor", "The Maghreb Corridor", "نشرة الممر المغاربي")}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              {t("editorial_dispatch", "Editorial dispatch", "نشرة تحريرية")}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-16 lg:px-6 lg:py-24">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a3030]">
            {t("not_found_label", "404", "٤٠٤")}
          </p>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {t("page_not_found", "Page not found", "الصفحة غير موجودة")}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-600">
            {t(
              "page_not_found_desc",
              "The page you are looking for may have been moved, renamed, or is no longer available.",
              "قد تكون الصفحة التي تبحث عنها قد نُقلت أو أُعيدت تسميتها أو لم تعد متاحة."
            )}
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mb-10 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search_placeholder", "Search articles...", "ابحث في المقالات...")}
                className="h-11 border-stone-300 bg-white pl-9 pr-3 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#7a3030]/30 rtl:pl-3 rtl:pr-9"
                aria-label={t("search", "Search", "بحث")}
              />
            </div>
            <Button type="submit" className="h-11 bg-[#7a3030] px-5 text-white hover:bg-[#632626]">
              {t("search", "Search", "بحث")}
            </Button>
          </form>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              onClick={goBack}
              variant="outline"
              size="lg"
              className="border-stone-300 bg-white px-6 text-slate-800 hover:bg-stone-50"
            >
              {isRTL ? (
                <ArrowRight className="ml-2 h-4 w-4" />
              ) : (
                <ArrowLeft className="mr-2 h-4 w-4" />
              )}
              {t("go_back", "Go back", "العودة")}
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-[#7a3030] px-6 text-white hover:bg-[#632626]"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {t("home", "Home", "الرئيسية")}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
