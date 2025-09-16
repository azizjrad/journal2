"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/user-auth";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { NewsletterSubscriptionOptions } from "@/components/newsletter-subscription-options";
import { NewsletterSubscriptionPopup } from "@/components/newsletter-subscription-popup";
import { NewsletterManagement } from "@/components/newsletter-management";
import { AnnualDigitalFeatures } from "@/components/annual-digital-features";
import { CategoryInterface } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { NewsletterFAQ } from "@/components/newsletter-faq";

interface NewsletterPageContentProps {
  categories: CategoryInterface[];
}

async function getSubscriptionStatus(userId: string) {
  // This would typically fetch from your database
  // For now, we'll simulate the check
  try {
    // Add your database logic here to check subscription status
    // Example:
    // const subscription = await db.subscriptions.findFirst({
    //   where: { userId: userId, status: 'active' }
    // });
    return null; // Return subscription data if exists
  } catch (error) {
    return null;
  }
}

export function NewsletterPageContent({
  categories,
}: NewsletterPageContentProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("annual");

  useEffect(() => {
    if (user?.id) {
      // Check subscription status only for authenticated users
      getSubscriptionStatus(user.id)
        .then(setSubscription)
        .finally(() => setSubscriptionLoading(false));
    } else {
      setSubscriptionLoading(false);
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg">Loading newsletter page...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* White navbar with centered Akhbarna logo */}
      <nav className="w-full bg-white border-b border-gray-200 py-2 flex items-center justify-center">
        <a href="/" className="block">
          <div className="text-4xl font-black text-red-700 tracking-tight hover:text-red-800 transition-colors duration-300 text-center">
            Akhbarna
          </div>
        </a>
      </nav>
      {isAuthenticated && user && subscription ? (
        <NewsletterManagement user={user} subscription={subscription} />
      ) : (
        <>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-4 pb-12">
            <div className="w-full max-w-2xl">
              <div className="mb-8">
                <NewsletterSubscriptionOptions
                  selected={selectedPlan}
                  setSelected={setSelectedPlan}
                />
              </div>
            </div>
          </div>
          <AnnualDigitalFeatures />
          <NewsletterSubscriptionPopup selectedPlan={selectedPlan} />
        </>
      )}
      <NewsletterFAQ />
      <Footer categories={categories} />
    </>
  );
}
