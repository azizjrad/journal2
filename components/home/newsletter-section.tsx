"use client";

import { useState } from "react";
import { Mail, Bell, Star, Gift } from "lucide-react";

import { useLanguage } from "@/lib/context/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.location.href = `/payment?plan=annual&email=${encodeURIComponent(email)}`;
    }
  };

  const benefits = [
    {
      icon: <Bell className="h-4 w-4" />,
      label: t("dispatch_alerts", "Dispatch alerts", "تنبيهات الإحاطات"),
    },
    {
      icon: <Star className="h-4 w-4" />,
      label: t("subscriber_briefings", "Subscriber briefings", "إحاطات للمشتركين"),
    },
    {
      icon: <Gift className="h-4 w-4" />,
      label: t("weekly_digest", "Weekly digest", "ملخص أسبوعي"),
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-6 py-12 md:py-16">
      <Card className="border border-stone-300/80 bg-[#fbfaf7] shadow-none rounded-md">
        <CardContent className="p-6 md:p-10 lg:p-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-[#7a3030]">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a3030]">
                {t("newsletter", "Newsletter", "النشرة")}
              </p>
            </div>

            <h3 className="mb-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              {t("stay_informed", "Stay informed", "ابقَ على اطلاع")}
            </h3>
            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              {t(
                "newsletter_description",
                "Receive editorial briefings and updates from The Maghreb Corridor directly in your inbox.",
                "استقبل الإحاطات التحريرية والتحديثات من نشرة الممر المغاربي مباشرة في بريدك الوارد.",
              )}
            </p>

            <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-700">
              {benefits.map((benefit) => (
                <div key={benefit.label} className="inline-flex items-center gap-2">
                  <span className="text-[#7a3030]" aria-hidden="true">
                    {benefit.icon}
                  </span>
                  <span>{benefit.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubscribe} className="max-w-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t(
                    "enter_email",
                    "Enter your email address",
                    "أدخل عنوان بريدك الإلكتروني",
                  )}
                  className="h-11 flex-1 rounded-md border border-stone-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3030]/25 focus:border-[#7a3030]/40"
                  required
                />
                <Button
                  type="submit"
                  className="h-11 bg-[#7a3030] px-6 text-white hover:bg-[#632626] shadow-none rounded-md"
                >
                  {t("subscribe_now", "Subscribe", "اشترك")}
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {t(
                  "privacy_notice",
                  "You can unsubscribe at any time.",
                  "يمكنك إلغاء الاشتراك في أي وقت.",
                )}
              </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
