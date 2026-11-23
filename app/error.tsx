"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Home, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useLanguage } from "@/lib/context/language-context";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { language, t } = useLanguage();
  const router = useRouter();
  const isRTL = language === "ar";

  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

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

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center lg:px-6 lg:py-24">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-stone-300 bg-white">
          <AlertTriangle className="h-9 w-9 text-[#7a3030]" aria-hidden="true" />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a3030]">
          {t("unexpected_error", "Unexpected error", "خطأ غير متوقع")}
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {t("something_went_wrong", "Something went wrong", "حدث خطأ ما")}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">
          {t(
            "error_description",
            "We could not complete your request. Please try again, or return to the previous page.",
            "تعذر إكمال طلبك. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة السابقة."
          )}
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 w-full rounded-lg border border-[#7a3030]/20 bg-white p-4 text-left">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              {t("error_details", "Error details (development)", "تفاصيل الخطأ (التطوير)")}
            </h2>
            <p className="break-all font-mono text-xs text-slate-700">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500">
                <span className="font-semibold">Digest:</span> {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Button
            onClick={reset}
            size="lg"
            className="bg-[#7a3030] px-6 text-white hover:bg-[#632626]"
          >
            <RefreshCcw className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            {t("try_again", "Try again", "حاول مرة أخرى")}
          </Button>

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
            variant="outline"
            size="lg"
            className="border-stone-300 bg-white px-6 text-slate-800 hover:bg-stone-50"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              {t("home", "Home", "الرئيسية")}
            </Link>
          </Button>
        </div>

        <p className="mt-12 border-t border-stone-300/80 pt-6 text-xs text-slate-500">
          {t(
            "error_logged",
            "This error has been logged for review.",
            "تم تسجيل هذا الخطأ للمراجعة."
          )}
        </p>
      </main>
    </div>
  );
}
