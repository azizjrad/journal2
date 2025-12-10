import { Metadata } from "next";
import { NewsletterPageContent } from "../../components/newsletter-page-content";
import { getCategoriesCached } from "@/lib/db";

export const metadata: Metadata = {
  title: "Newsletter Subscription - The Maghreb Orbit",
  description:
    "Subscribe to our premium newsletter service with exclusive content and breaking news alerts",
};

export default async function NewsletterPage() {
  const categories = await getCategoriesCached();

  return <NewsletterPageContent categories={categories} />;
}
