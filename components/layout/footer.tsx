"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/language-context";
import { useState } from "react";
import { Send } from "lucide-react";
import type { CategoryInterface } from "@/lib/services/category-service";

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
    setIsSubscribing(true);
    window.location.href = `/payment?plan=annual&email=${encodeURIComponent(
      email,
    )}`;
  };

  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#f3f1ec] text-slate-900">
      <div className="container mx-auto px-4 lg:px-6 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-5 space-y-5">
            <Link
              href="/"
              className="text-2xl md:text-[2rem] font-semibold tracking-tight text-slate-900 inline-block"
            >
              {t("site_title", "The Maghreb Corridor", "نشرة الممر المغاربي")}
            </Link>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed max-w-xl">
              {t(
                "footer_description_long",
                "Independent, reader-supported situational awareness covering migration, local governance, and economics in Libya and North Africa.",
                "منصة مستقلة مدعومة من القراء لرصد وتحليل قضايا الهجرة، الحوكمة المحلية، والاقتصاد في ليبيا وشمال أفريقيا.",
              )}
            </p>
            <div className="flex gap-2 pt-1">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-md border border-stone-300 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0" /></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 rounded-md border border-stone-300 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.496 14.009-13.986 0-.21-.005-.423-.015-.633A9.936 9.936 0 0 0 24 4.557z" /></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded-md border border-stone-300 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 rounded-md border border-stone-300 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              {t("categories", "Categories", "الفئات")}
            </h3>
            <nav className="space-y-2">
              {categories.map((category, index) => (
                <Link
                  key={`footer-category-${category.id || index}`}
                  href={`/category/${category.slug}`}
                  className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {language === "ar" ? category.name_ar : category.name_en}
                </Link>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              {t("stay_updated", "Stay Updated", "ابق على اطلاع")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t(
                "newsletter_desc",
                "Get the latest news delivered to your inbox.",
                "احصل على آخر الأخبار في صندوق بريدك.",
              )}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email_placeholder", "Enter your email", "أدخل بريدك الإلكتروني")}
                  className="flex-1 px-3 py-2.5 bg-white border border-stone-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center min-w-[2.75rem]"
                >
                  {isSubscribing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 bg-[#efede7]">
        <div className="container mx-auto px-4 lg:px-6 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
            <div>
              &copy; {new Date().getFullYear()} {t("site_title", "The Maghreb Corridor", "نشرة الممر المغاربي")}. {t("rights", "All rights reserved.", "جميع الحقوق محفوظة.")}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
              <Link href="/about" className="hover:text-slate-900 transition-colors">{t("about", "About", "من نحن")}</Link>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">{t("contact_us", "Contact Us", "تواصل معنا")}</Link>
              <a href="/advertise" className="hover:text-slate-900 transition-colors">{t("advertise", "Advertise", "أعلن معنا")}</a>
              <a href="/privacy" className="hover:text-slate-900 transition-colors">{t("privacy", "Privacy", "الخصوصية")}</a>
              <a href="/terms" className="hover:text-slate-900 transition-colors">{t("terms", "Terms", "الشروط")}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
