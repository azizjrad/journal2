"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/user-auth";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { NewsletterManagement } from "@/components/newsletter-management";
import { CategoryInterface } from "@/lib/db";
import { Loader2 } from "lucide-react";

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
      {isAuthenticated && user && subscription ? (
        <NewsletterManagement user={user} subscription={subscription} />
      ) : (
        <NewsletterSection />
      )}
    </>
  );
}
