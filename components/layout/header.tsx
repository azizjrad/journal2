"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/context/language-context";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { FontSizeController } from "@/components/shared/font-size-controller";
import { DateTimeDisplay } from "@/components/shared/date-time-display";
import { ProfileButton } from "@/components/auth/profile-button";
import { Button } from "@/components/ui/button";
import { Menu, Search, X, Mail, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { CategoryInterface } from "@/lib/services/category-service";

interface HeaderProps {
  categories: CategoryInterface[];
  onMobileMenuChange?: (isOpen: boolean) => void;
}

function SidebarSearchLink({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <Link
      href="/search"
      className="flex items-center gap-3 p-3 text-slate-700 hover:text-slate-900 hover:bg-stone-100 rounded-md transition-colors group"
      onClick={onClose}
    >
      <Search className="h-5 w-5 text-slate-400 group-hover:text-slate-700" />
      <span className="font-medium">
        {t("search", "Search", "بحث")}
      </span>
    </Link>
  );
}

export default function Header({
  categories,
  onMobileMenuChange,
}: HeaderProps) {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsClosing(false);
    }, 300);
  };

  useEffect(() => {
    onMobileMenuChange?.(sidebarOpen);
  }, [sidebarOpen, onMobileMenuChange]);

  const headerDate =
    language === "ar"
      ? new Date().toLocaleDateString("ar-TN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

  const navbarCategories = categories.slice(0, 5);

  const navBase =
    "text-sm font-medium transition-colors px-3 py-2 rounded-md whitespace-nowrap";
  const navInactive =
    "text-slate-600 hover:text-slate-900 hover:bg-stone-100";
  const navActive = "bg-slate-900 text-white hover:bg-slate-900 hover:text-white";

  const isHomeActive = pathname === "/";
  const isDispatchesActive =
    pathname === "/news" || pathname?.startsWith("/news/");
  const isRTL = language === "ar";

  const SidebarComponent = () => (
    <>
      <div
        className={`fixed inset-0 bg-black transition-all duration-300 ${
          sidebarOpen && !isClosing
            ? "animate-in fade-in-0 opacity-50"
            : "animate-out fade-out-0 opacity-0"
        }`}
        style={{
          zIndex: 999998,
          position: "fixed",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={handleCloseSidebar}
      />

      <div
        className={`top-0 left-0 h-full w-80 bg-[#f8f7f4] border-r border-stone-200 flex flex-col transition-all duration-300 ease-out ${
          sidebarOpen && !isClosing
            ? "animate-in slide-in-from-left-full translate-x-0"
            : "animate-out slide-out-to-left-full -translate-x-full"
        }`}
        style={{
          zIndex: 999999,
          position: "fixed",
          top: "0",
          left: "0",
          height: "100vh",
          width: "320px",
          transform: "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-[#f8f7f4] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-md">
              <Menu className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t("menu", "Menu", "القائمة")}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseSidebar}
            className="text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-md p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="animate-in slide-in-from-left-8 duration-300 delay-100">
              <SidebarSearchLink onClose={handleCloseSidebar} />
            </div>

            <div className="space-y-2 animate-in slide-in-from-left-8 duration-300 delay-150">
              {categories.map((category, index) => (
                <Link
                  key={`sidebar-category-${category.id || index}`}
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-3 p-3 text-slate-700 hover:text-slate-900 hover:bg-stone-100 rounded-md transition-colors group animate-in slide-in-from-left-4 duration-300"
                  style={{
                    animationDelay: `${200 + index * 50}ms`,
                    animationFillMode: "both",
                  }}
                  onClick={handleCloseSidebar}
                >
                  <span className="font-medium">
                    {language === "ar" ? category.name_ar : category.name_en}
                  </span>
                </Link>
              ))}
            </div>

            <div className="p-4 bg-white/60 rounded-md border border-stone-200 md:hidden flex justify-center">
              <LanguageSwitcher />
            </div>

            <div className="p-4 bg-white/60 rounded-md border border-stone-200">
              <DateTimeDisplay isMobile={true} />
            </div>

            <div className="p-4 bg-white/60 rounded-md border border-stone-200">
              <FontSizeController />
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-2">
              <Link
                href="/auth"
                className="group flex items-center justify-center gap-2 p-3 text-sm border border-[#7a3030]/30 text-[#7a3030] hover:border-[#7a3030] hover:text-[#632626] hover:bg-[#7a3030]/10 focus-visible:text-[#632626] focus-visible:bg-[#7a3030]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a3030]/30 rounded-md transition-colors w-full"
                onClick={handleCloseSidebar}
              >
                <User className="h-4 w-4 text-[#7a3030] group-hover:text-[#632626]" />
                <span className="text-xs font-medium">
                  {t("sign_in", "Sign In", "تسجيل الدخول")}
                </span>
              </Link>

              <Link
                href="/newsletter"
                onClick={handleCloseSidebar}
                className="group flex items-center justify-center gap-2 p-3 text-sm text-slate-700 hover:text-[#7a3030] hover:bg-[#7a3030]/10 focus-visible:text-[#7a3030] focus-visible:bg-[#7a3030]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a3030]/30 rounded-md transition-colors w-full"
              >
                <Mail className="h-4 w-4 text-slate-400 group-hover:text-[#7a3030]" />
                <span className="text-xs font-medium">
                  {t("newsletter", "Newsletter", "النشرة")}
                </span>
              </Link>

              <Link
                href="/about"
                className="flex items-center justify-center gap-2 p-3 text-sm text-slate-700 hover:text-[#7a3030] hover:bg-[#7a3030]/10 focus-visible:text-[#7a3030] focus-visible:bg-[#7a3030]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a3030]/30 rounded-md transition-colors w-full"
                onClick={handleCloseSidebar}
              >
                <span className="text-xs font-medium">
                  {t("about_us", "About Us", "حولنا")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <header className="bg-[#f8f7f4]/98 backdrop-blur-sm border-b border-stone-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between gap-3 py-2 border-b border-stone-200/70">
            {isRTL ? (
              <>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <ProfileButton />

                  <Link href="/newsletter" className="hidden md:block">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 px-4 h-9 text-sm font-medium bg-[#7a3030] hover:bg-[#632626] text-white rounded-md border-0"
                    >
                      <Mail className="h-4 w-4" />
                      {t("newsletter_subscribe", "Subscribe", "اشترك مجاناً")}
                    </Button>
                  </Link>

                  <div className="hidden md:block">
                    <LanguageSwitcher />
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-row-reverse">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="text-slate-700 hover:text-slate-900 hover:bg-stone-100 p-2 rounded-md"
                    aria-label={t("menu", "Menu", "القائمة")}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>

                  <div className="hidden md:flex items-center gap-2 text-[11px] lg:text-xs whitespace-nowrap">
                    <span className="text-slate-500">{t("locations", "Tripoli / Tunis", "طرابلس / تونس")}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-black">{headerDate}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="text-slate-700 hover:text-slate-900 hover:bg-stone-100 p-2 rounded-md"
                    aria-label={t("menu", "Menu", "القائمة")}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>

                  <div className="hidden md:flex items-center gap-2 text-[11px] lg:text-xs whitespace-nowrap">
                    <span className="text-slate-500">{t("locations", "Tripoli / Tunis", "طرابلس / تونس")}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-black">{headerDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <ProfileButton />

                  <Link href="/newsletter" className="hidden md:block">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 px-4 h-9 text-sm font-medium bg-[#7a3030] hover:bg-[#632626] text-white rounded-md border-0"
                    >
                      <Mail className="h-4 w-4" />
                      {t("newsletter_subscribe", "Subscribe", "اشترك مجاناً")}
                    </Button>
                  </Link>

                  <div className="hidden md:block">
                    <LanguageSwitcher />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="py-4 md:py-5 text-center">
            <Link href="/" className="inline-block max-w-4xl">
              {language === "en" ? (
                <div className="space-y-1.5 md:space-y-2">
                  <p className="text-[10px] md:text-xs tracking-[0.22em] uppercase text-[#7a3030] font-medium">
                    Tri-Weekly Situational &amp; Policy Briefing
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[0.04em] text-slate-950 leading-none">
                    THE MAGHREB CORRIDOR
                  </h1>
                  <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                    Situational Awareness, Mobility &amp; Local Governance Across Libya &amp; North Africa
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 md:space-y-2">
                  <p className="text-[11px] md:text-sm text-[#7a3030] font-medium">
                    — نشرة رصد وتحليل سياسات تصدر ثلاث مرات أسبوعياً —
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 leading-tight">
                    نشرة الممر المغاربي
                  </h1>
                  <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                    رصد ميداني وتحليل معمّق حول التنقل البشري، الحوكمة المحلية، والاقتصاد في ليبيا وشمال أفريقيا
                  </p>
                </div>
              )}
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-1 pb-3 border-t border-stone-200/70 pt-2 flex-wrap">
            <Link
              href="/"
              className={`${navBase} ${isHomeActive ? navActive : navInactive}`}
            >
              {t("home", "Home", "الرئيسية")}
            </Link>
            <Link
              href="/news"
              className={`${navBase} ${isDispatchesActive ? navActive : navInactive}`}
            >
              {t("all_reports", "All Dispatches", "جميع التقارير")}
            </Link>
            {navbarCategories.map((category, index) => {
              const isActive =
                pathname === `/category/${category.slug}` ||
                pathname?.startsWith(`/category/${category.slug}/`);
              return (
                <Link
                  key={`navbar-category-${category.id || index}`}
                  href={`/category/${category.slug}`}
                  className={`${navBase} ${isActive ? navActive : navInactive}`}
                >
                  {language === "ar" ? category.name_ar : category.name_en}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {(sidebarOpen || isClosing) &&
        mounted &&
        typeof window !== "undefined" &&
        createPortal(<SidebarComponent />, document.body)}
    </>
  );
}
