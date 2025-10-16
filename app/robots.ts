import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_BASE_URL || "https://akhbarna.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/settings/",
          "/account/",
          "/writer/dashboard/",
          "/login-timeout-page",
          "/_next/",
          "/private/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/settings/",
          "/account/",
          "/writer/dashboard/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/settings/",
          "/account/",
          "/writer/dashboard/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
