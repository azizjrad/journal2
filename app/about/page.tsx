import { getCategoriesCached, getFeaturedArticlesCached } from "@/lib/db";
import Header from "@/components/header";
import { BreakingNewsTicker } from "@/components/breaking-news-ticker";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { AboutContent } from "@/components/about-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Digital Journal",
  description:
    "Learn more about our mission, vision, and commitment to delivering quality journalism in the digital age.",
  keywords: "about us, digital journalism, news, media, mission, vision",
  openGraph: {
    title: "About Us | Digital Journal",
    description:
      "Learn more about our mission, vision, and commitment to delivering quality journalism in the digital age.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Digital Journal",
    description:
      "Learn more about our mission, vision, and commitment to delivering quality journalism in the digital age.",
  },
};

export default async function AboutPage() {
  const [categories, featuredArticles] = await Promise.all([
    getCategoriesCached(),
    getFeaturedArticlesCached(5),
  ]);

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "About Us" }];

  return (
    <div className="min-h-screen bg-stone-100">
      <Header categories={categories} />
      <BreakingNewsTicker articles={featuredArticles} />
      <Breadcrumb items={breadcrumbItems} />

      <main className="container mx-auto px-4 lg:px-6 py-12">
        <AboutContent />
      </main>

      <Footer categories={categories} />
    </div>
  );
}
