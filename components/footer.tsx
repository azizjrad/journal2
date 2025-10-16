"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { Send, Mail, Phone } from "lucide-react";
import { CategoryInterface } from "@/lib/db";

interface FooterProps {
  categories: CategoryInterface[];
}

export function Footer({ categories }: FooterProps) {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Redirect to payment page with annual plan and pre-filled email
    window.location.href = `/payment?plan=annual&email=${encodeURIComponent(
      email
    )}`;
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white mt-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding & About */}
          <div className="space-y-6">
            <Link
              href="/"
              className="text-4xl font-black text-red-500 tracking-tight hover:text-red-400 transition-all duration-300 inline-block transform hover:scale-105"
            >
              {t("site_title", "Akhbarna", "أخبارنا")}
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t(
                "footer_description_long",
                "Akhbarna is where tomorrow is realized. It is the essential source of information and ideas that make sense of a world in constant transformation. The Akhbarna conversation illuminates how technology is changing every aspect of our lives—from culture to business, science to design. The breakthroughs and innovations that we uncover lead to new ways of thinking, new connections, and new industries.",
                "أخبارنا هي المكان الذي يتحقق فيه الغد. إنها المصدر الأساسي للمعلومات والأفكار التي تفسر عالماً في تحول مستمر. تسلط محادثة أخبارنا الضوء على كيفية تغيير التكنولوجيا لكل جانب من جوانب حياتنا — من الثقافة إلى الأعمال، ومن العلوم إلى التصميم. الاكتشافات والابتكارات التي نكشف عنها تقود إلى طرق تفكير جديدة، وصلات جديدة، وصناعات جديدة."
              )}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-red-500" />
                <span>+218 XX XXX XXX</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-red-500" />
                <span>contact@akhbarna.com</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="text-gray-400 hover:text-red-500 transition-all duration-200 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 hover:scale-110 group"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 group-hover:animate-pulse"
                >
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener"
                aria-label="Twitter"
                className="text-gray-400 hover:text-red-500 transition-all duration-200 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 hover:scale-110 group"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 group-hover:animate-pulse"
                >
                  <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.496 14.009-13.986 0-.21-.005-.423-.015-.633A9.936 9.936 0 0 0 24 4.557z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-red-500 transition-all duration-200 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 hover:scale-110 group"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 group-hover:animate-pulse"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener"
                aria-label="YouTube"
                className="text-gray-400 hover:text-red-500 transition-all duration-200 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 hover:scale-110 group"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 group-hover:animate-pulse"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b-2 border-red-500 pb-3 inline-block">
              {t("categories", "Categories", "الفئات")}
            </h3>
            <nav className="space-y-3">
              {" "}
              {categories.slice(0, 6).map((category, index) => (
                <Link
                  key={`footer-category-${category.id || index}`}
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:translate-x-1 transition-all duration-200 text-sm py-1 group"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  {language === "ar" ? category.name_ar : category.name_en}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b-2 border-red-500 pb-3 inline-block">
              {t("quick_links", "Quick Links", "روابط سريعة")}
            </h3>{" "}
            <nav className="space-y-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:translate-x-1 transition-all duration-200 text-sm py-1 group"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                {t("home", "Home", "الرئيسية")}
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:translate-x-1 transition-all duration-200 text-sm py-1 group"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                {t("search", "Search", "بحث")}
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:translate-x-1 transition-all duration-200 text-sm py-1 group"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                {t("contact", "Contact Us", "اتصل بنا")}
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:translate-x-1 transition-all duration-200 text-sm py-1 group"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                {t("about", "About Us", "معلومات عنا")}
              </Link>
              <Link
                href="/newsletter"
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:translate-x-1 transition-all duration-200 text-sm py-1 group"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                {t("newsletter", "Newsletter", "النشرة")}
              </Link>
            </nav>
          </div>

          {/* Newsletter & Updates */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b-2 border-red-500 pb-3 inline-block">
              {t("stay_updated", "Stay Updated", "ابق على اطلاع")}
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {t(
                  "newsletter_desc",
                  "Get the latest news delivered to your inbox. Never miss an important update.",
                  "احصل على آخر الأخبار في صندوق بريدك. لا تفوت أي تحديث مهم."
                )}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t(
                      "email_placeholder",
                      "Enter your email",
                      "أدخل بريدك الإلكتروني"
                    )}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors duration-200"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[3rem] group"
                  >
                    {isSubscribing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-950/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {" "}
            <div className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()}{" "}
              {t("site_title", "Akhbarna", "أخبارنا")}.{" "}
              {t("rights", "All rights reserved.", "جميع الحقوق محفوظة.")}
            </div>
            <div className="flex gap-6 text-xs text-gray-400">
              <a
                href="/advertise"
                className="hover:text-red-400 transition-colors duration-200 hover:underline"
              >
                {t("advertise", "Advertise with Akhbarna", "أعلن مع أخبارنا")}
              </a>
              <a
                href="/privacy"
                className="hover:text-red-400 transition-colors duration-200 hover:underline"
              >
                {t("privacy", "Privacy Policy", "سياسة الخصوصية")}
              </a>
              <a
                href="/terms"
                className="hover:text-red-400 transition-colors duration-200 hover:underline"
              >
                {t("terms", "Terms of Service", "شروط الخدمة")}
              </a>
              <a
                href="/cookies"
                className="hover:text-red-400 transition-colors duration-200 hover:underline"
              >
                {t("cookies", "Cookie Policy", "سياسة ملفات تعريف الارتباط")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
