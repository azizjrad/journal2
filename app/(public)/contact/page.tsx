import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BreakingNewsTicker } from "@/components/shared/breaking-news-ticker";
import { ContactContent } from "@/components/shared/contact-content";
import { getCategories } from "@/lib/services/category-service";
import { getFeaturedArticlesCached } from "@/lib/content/article-service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Digital Journal",
  description:
    "Get in touch with Digital Journal. Contact our editorial team, submit news tips, or reach out for partnerships and collaboration opportunities.",
};

export default async function ContactPage() {
  const [categories, featuredArticles] = await Promise.all([
    getCategories(),
    getFeaturedArticlesCached(5),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header categories={categories} />
      <BreakingNewsTicker articles={featuredArticles} />

      <main className="container mx-auto px-4 lg:px-6">
        <ContactContent />
      </main>

      <Footer categories={categories} />
    </div>
  );
}
