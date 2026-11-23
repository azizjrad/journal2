"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/context/language-context";

export default function OfflinePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white/80 border border-stone-200 rounded-md p-8 md:p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-full border border-stone-200 bg-[#f8f7f4] flex items-center justify-center mb-5">
          <WifiOff className="w-6 h-6 text-slate-700" />
        </div>

        <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-2">
          {t("offline_kicker", "Connection unavailable", "الاتصال غير متاح")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 mb-3">
          {t("offline_title", "You are offline", "أنت غير متصل")}
        </h1>
        <p className="text-slate-600 leading-relaxed mb-8">
          {t(
            "offline_body",
            "We couldn't reach The Maghreb Corridor right now. Check your connection and try again. Some recently visited content may still be available in your browser cache.",
            "تعذر الوصول إلى نشرة الممر المغاربي حاليًا. تحقق من اتصالك وحاول مرة أخرى. قد تظل بعض الصفحات التي زرتها مؤخرًا متاحة في ذاكرة المتصفح المؤقتة.",
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()} className="bg-[#7a3030] hover:bg-[#632626] text-white">
            <RefreshCw className="w-4 h-4 me-2" />
            {t("try_again", "Try again", "إعادة المحاولة")}
          </Button>
          <Button asChild variant="outline" className="border-stone-300 text-slate-700 hover:bg-stone-100">
            <Link href="/">
              <Home className="w-4 h-4 me-2" />
              {t("go_home", "Go to homepage", "العودة إلى الرئيسية")}
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200 text-start">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {t("troubleshooting", "Troubleshooting", "استكشاف الأخطاء")}
          </h2>
          <ul className="text-sm text-slate-600 space-y-1.5">
            <li>{t("tip_wifi", "Check your Wi-Fi or mobile data connection.", "تحقق من اتصال Wi-Fi أو بيانات الهاتف.")}</li>
            <li>{t("tip_airplane", "Disable airplane mode if it is enabled.", "عطّل وضع الطيران إذا كان مفعّلًا.")}</li>
            <li>{t("tip_refresh", "Refresh the page after reconnecting.", "حدّث الصفحة بعد إعادة الاتصال.")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}