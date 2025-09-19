"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  Home,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  RefreshCcw,
  Mail,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { language, t } = useLanguage();
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const isRTL = language === "ar";

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 ${
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
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
        <div className="text-center">
          {/* Error Visual */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-16 h-16 text-red-600 animate-pulse" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {t("something_went_wrong", "Something Went Wrong", "حدث خطأ ما")}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
              {t(
                "error_description",
                "We encountered an unexpected error while processing your request. Our team has been notified and we're working to fix this issue.",
                "واجهنا خطأ غير متوقع أثناء معالجة طلبك. تم إشعار فريقنا ونحن نعمل على إصلاح هذه المشكلة."
              )}
            </p>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6 text-left max-w-2xl mx-auto">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  {t(
                    "error_details",
                    "Error Details (Development)",
                    "تفاصيل الخطأ (التطوير)"
                  )}
                </h3>
                <p className="text-xs text-red-700 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    <span className="font-semibold">Digest:</span>{" "}
                    {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
            <Button
              onClick={reset}
              size="lg"
              className="flex items-center gap-2 px-6 py-3 text-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            >
              <RefreshCcw className="w-5 h-5" />
              {t("try_again", "Try Again", "حاول مرة أخرى")}
            </Button>

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
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-6 py-3 text-lg border-2 border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                {t("home", "Home", "الرئيسية")}
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center py-8 mt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              {t(
                "error_logged",
                "This error has been automatically logged and reported to our technical team.",
                "تم تسجيل هذا الخطأ تلقائياً وإرساله إلى فريقنا التقني."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
