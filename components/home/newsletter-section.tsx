"use client";

import { useLanguage } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Bell, Star, Gift } from "lucide-react";
import { useState } from "react";

export function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Redirect to payment page with annual plan and pre-filled email
      window.location.href = `/payment?plan=annual&email=${encodeURIComponent(
        email
      )}`;
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-16">
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        <CardContent className="p-12 lg:p-16 text-center relative">
          <div className="max-w-4xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-8 shadow-2xl">
              <Mail className="w-10 h-10 text-white" />
            </div>
            {/* Heading */}
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t("stay_informed", "Stay Informed", "ابق على اطلاع")}
            </h3>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
              {t(
                "newsletter_description",
                "Get breaking news, exclusive stories, and insider insights delivered directly to your inbox",
                "احصل على الأخبار العاجلة والقصص الحصرية والرؤى الداخلية مباشرة في صندوق الوارد"
              )}
            </p>
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-12">
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Bell className="w-6 h-6 text-red-400" />
                <span className="font-semibold">
                  {t(
                    "breaking_alerts",
                    "Breaking News Alerts",
                    "تنبيهات الأخبار العاجلة"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Star className="w-6 h-6 text-red-400" />
                <span className="font-semibold">
                  {t("exclusive_content", "Exclusive Content", "محتوى حصري")}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Gift className="w-6 h-6 text-red-400" />
                <span className="font-semibold">
                  {t("weekly_digest", "Weekly Digest", "ملخص أسبوعي")}
                </span>
              </div>
            </div>{" "}
            {/* Subscription Form */}
            {/* Always show the form, redirect on submit */}
            <form onSubmit={handleSubscribe} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t(
                    "enter_email",
                    "Enter your email address",
                    "أدخل عنوان بريدك الإلكتروني"
                  )}
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-600 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-lg"
                  required
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 rounded-xl font-bold text-lg whitespace-nowrap shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 h-[60px] flex items-center justify-center"
                >
                  {t("subscribe_now", "Subscribe Now", "اشترك الآن")}
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                {t(
                  "privacy_notice",
                  "We respect your privacy. Unsubscribe at any time.",
                  "نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت."
                )}
              </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
