import { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_BASE_URL || "https://akhbarna.com";

  try {
    const db = await dbConnect();
    const articlesCollection = db.collection("articles");
    const categoriesCollection = db.collection("categories");

    // Fetch all published articles
    const articles = await articlesCollection
      .find({ status: "published" })
      .project({ slug: 1, updatedAt: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all categories
    const categories = await categoriesCollection
      .find({})
      .project({ slug: 1 })
      .toArray();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 1,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/newsletter`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cookies`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/user-agreement`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
    ];

    // Article pages
    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: article.updatedAt || article.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...articlePages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least static pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 1,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];
  }
}
