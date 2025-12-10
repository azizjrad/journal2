"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { FontSizeController } from "./font-size-controller";
import { DateTimeDisplay } from "./date-time-display";
import { ProfileButton } from "./profile-button";
import { Button } from "@/components/ui/button";
import { Menu, Search, X, Mail, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CategoryInterface } from "@/lib/db";

interface HeaderProps {
  categories: CategoryInterface[];
  onMobileMenuChange?: (isOpen: boolean) => void;
}

// Search Link Component for Sidebar
function SidebarSearchLink({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <Link
      href="/search"
      className="flex items-center gap-3 p-3 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
      onClick={onClose}
    >
      <Search className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
      <span className="font-medium border-b-2 border-transparent group-hover:border-red-600 transition-all duration-200">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle closing with animation delay
  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Notify parent component when mobile menu state changes
  useEffect(() => {
    onMobileMenuChange?.(sidebarOpen);
  }, [sidebarOpen, onMobileMenuChange]);

  // Always show Home and All News, then up to 5 categories
  const navbarCategories = categories.slice(0, 5);

  // Sidebar component to be rendered in portal
  const SidebarComponent = () => (
    <>
      {/* Backdrop with fade-in/out animation */}
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

      {/* Sidebar Panel with slide-in/out animation */}
      <div
        className={`top-0 left-0 h-full w-80 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out ${
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
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Menu className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {t("menu", "Menu", "القائمة")}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseSidebar}
            className="text-gray-600 hover:text-red-600 hover:bg-white rounded-lg p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Sidebar Content with staggered animations */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Search Link with animation delay */}
            <div className="animate-in slide-in-from-left-8 duration-300 delay-100">
              <SidebarSearchLink onClose={handleCloseSidebar} />
            </div>

            {/* Navigation Links - Categories with staggered animation */}
            <div className="space-y-2 animate-in slide-in-from-left-8 duration-300 delay-150">
              {/* All Categories in sidebar */}
              {categories.map((category, index) => (
                <Link
                  key={`sidebar-category-${category.id || index}`}
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group animate-in slide-in-from-left-4 duration-300"
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

            {/* Language Switcher - Mobile only */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 md:hidden flex justify-center">
              <LanguageSwitcher />
            </div>

            {/* Date & Time - No header, just content */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <DateTimeDisplay isMobile={true} />
            </div>

            {/* Zoom Settings - No header, just content */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <FontSizeController />
            </div>

            {/* Bottom Actions - Sign In, Newsletter, About Us */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {/* Sign In Button */}
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 p-3 text-sm border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group w-full"
                onClick={handleCloseSidebar}
              >
                <User className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                <span className="text-xs font-medium">
                  {t("sign_in", "Sign In", "تسجيل الدخول")}
                </span>
              </Link>

              {/* Newsletter Button */}
              <Link
                href="/newsletter"
                onClick={handleCloseSidebar}
                className="flex items-center justify-center gap-2 p-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group w-full"
              >
                <Mail className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                <span className="text-xs font-medium">
                  {t("newsletter", "Newsletter", "النشرة")}
                </span>
              </Link>

              {/* About Us Link */}
              <Link
                href="/about"
                className="flex items-center justify-center gap-2 p-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group w-full"
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
      {/* Navbar with solid background */}
      <header className="bg-white border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Main navbar row */}
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Logo + Categories */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <Link
                href="/"
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                {language === "en" ? (
                  <img 
                    src="/logonews.png" 
                    alt="The Maghreb Orbit" 
                    className="h-20 w-auto hover:opacity-90 transition-opacity duration-300"
                  />
                ) : (
                  <div className="text-2xl font-black text-red-700 tracking-tight hover:text-red-800 transition-colors duration-300">
                    المدار المغاربي
                  </div>
                )}
              </Link>

              {/* Categories next to logo (hidden on mobile) */}
              <nav className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse ml-8">
                <Link
                  href="/"
                  className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  {t("home", "Home", "الرئيسية")}
                </Link>
                <Link
                  href="/news"
                  className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  {t("all_news", "All News", "جميع الأخبار")}
                </Link>
                {navbarCategories.map((category, index) => (
                  <Link
                    key={`navbar-category-${category.id || index}`}
                    href={`/category/${category.slug}`}
                    className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50 whitespace-nowrap"
                  >
                    {language === "ar" ? category.name_ar : category.name_en}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side: Profile, Newsletter + Language (desktop) */}
            <div className="flex items-center gap-3">
              <ProfileButton />

              {/* Newsletter Button */}
              <Link href="/newsletter">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center gap-2 px-4 py-2 h-9 text-sm font-semibold border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 rounded-lg"
                >
                  <Mail className="h-4 w-4" />
                  {t("newsletter", "Newsletter", "النشرة")}
                </Button>
              </Link>

              {/* Language Switcher - Desktop only */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Portal-rendered sidebar for maximum z-index control */}
      {(sidebarOpen || isClosing) &&
        mounted &&
        typeof window !== "undefined" &&
        createPortal(<SidebarComponent />, document.body)}
    </>
  );
}
