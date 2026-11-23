"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/user-auth";
import { useLanguage } from "@/lib/context/language-context";
import { NewsletterSubscriptionOptions } from "@/components/newsletter/newsletter-subscription-options";
import { NewsletterSubscriptionPopup } from "@/components/newsletter/newsletter-subscription-popup";
import { NewsletterManagement } from "@/components/newsletter/newsletter-management";
import { AnnualDigitalFeatures } from "@/components/newsletter/annual-digital-features";
import type { CategoryInterface } from "@/lib/services/category-service";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { NewsletterFAQ } from "@/components/newsletter/newsletter-faq";

interface NewsletterPageContentProps {
  categories: CategoryInterface[];
}

async function getSubscriptionStatus(userId: string) {
  try {
    return null;
  } catch (error) {
    return null;
  }
}

export function NewsletterPageContent({
  categories,
}: NewsletterPageContentProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("annual");

  useEffect(() => {
    const pendingPlan = sessionStorage.getItem("pendingNewsletterPlan");
    if (pendingPlan) {
      setSelectedPlan(pendingPlan);
      sessionStorage.removeItem("pendingNewsletterPlan");
    }

    if (user?.id) {
      getSubscriptionStatus(user.id)
        .then(setSubscription)
        .finally(() => setSubscriptionLoading(false));
    } else {
      setSubscriptionLoading(false);
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7a3030] mx-auto mb-4" />
          <p className="text-slate-700 text-base">
            {t("newsletter_loading", "Loading newsletter page...", "جارٍ تحميل صفحة النشرة...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <nav className="w-full bg-[#f8f7f4]/95 border-b border-stone-200 py-4 flex items-center justify-center">
        <a href="/" className="block text-center px-4">
          <div className="text-sm tracking-[0.16em] uppercase text-[#7a3030] font-semibold mb-1">
            {language === "ar" ? "نشرة الممر المغاربي" : "The Maghreb Corridor"}
          </div>
          <div className="text-xs text-slate-600">
            {t("newsletter_nav", "Newsletter & subscriptions", "النشرة والاشتراكات")}
          </div>
        </a>
      </nav>

      {isAuthenticated && user && subscription ? (
        <NewsletterManagement user={user} subscription={subscription} />
      ) : (
        <>
          <main className="container mx-auto px-4 lg:px-6 py-10 md:py-14">
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
              <section className="text-center space-y-3">
                <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold">
                  {t("newsletter_kicker", "Newsletter", "النشرة البريدية")}
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950">
                  {t(
                    "newsletter_title",
                    "Subscribe for briefings and exclusive updates",
                    "اشترك للحصول على الإحاطات والتحديثات الحصرية",
                  )}
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  {t(
                    "newsletter_subtitle",
                    "Choose a plan to receive editorial briefings, updates, and subscriber access features.",
                    "اختر خطة مناسبة لتلقي الإحاطات التحريرية والتحديثات وميزات الوصول للمشتركين.",
                  )}
                </p>
              </section>

              <NewsletterSubscriptionOptions
                selected={selectedPlan}
                setSelected={setSelectedPlan}
              />
            </div>
          </main>

          <AnnualDigitalFeatures />
          <NewsletterSubscriptionPopup selectedPlan={selectedPlan} />
        </>
      )}

      <NewsletterFAQ />
      <Footer categories={categories} />
    </div>
  );
}