"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/context/language-context";

export default function SuccessPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <nav className="w-full bg-[#f8f7f4]/95 border-b border-stone-200 py-4 flex items-center justify-center">
        <Link href="/" className="block text-center px-4">
          <div className="text-sm tracking-[0.16em] uppercase text-[#7a3030] font-semibold mb-1">
            {t("site_name_ar_brand", "The Maghreb Corridor", "نشرة الممر المغاربي")}
          </div>
          <div className="text-xs text-slate-600">{t("newsletter_nav", "Newsletter & subscriptions", "النشرة والاشتراكات")}</div>
        </Link>
      </nav>

      <div className="flex items-center justify-center p-4 py-12 md:py-16">
        <div className="max-w-md w-full bg-white/80 rounded-md border border-stone-200 p-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="w-16 h-16 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-700" strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-950 mb-3">
            {t("subscription_success_title", "Subscription confirmed", "تم تأكيد الاشتراك")}
          </h1>
          <p className="text-slate-600 leading-relaxed mb-6">
            {t(
              "subscription_success_body",
              "Thank you for subscribing to The Maghreb Corridor newsletter. Your subscription has been processed and access will be available according to your plan.",
              "شكرًا لاشتراكك في نشرة الممر المغاربي. تمت معالجة اشتراكك وستكون ميزات الوصول متاحة وفق خطتك.",
            )}
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-md p-4 mb-7 text-sm text-slate-700">
            {t(
              "confirmation_email_note",
              "A confirmation email may be sent to your registered email address.",
              "قد يتم إرسال رسالة تأكيد إلى بريدك الإلكتروني المسجل.",
            )}
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-[#7a3030] hover:bg-[#632626] text-white">{t("go_home", "Go to homepage", "العودة إلى الرئيسية")}</Button>
            </Link>
            <Link href="/settings?tab=subscription" className="block">
              <Button variant="outline" className="w-full border-stone-300 text-slate-700 hover:bg-stone-100">
                {t("manage_subscription", "Manage subscription", "إدارة الاشتراك")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}