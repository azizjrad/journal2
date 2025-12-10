import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/professional-news.css";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/user-auth";
import { Toaster } from "@/components/ui/toaster";

import ServiceWorkerRegistration from "@/components/service-worker-registration";
import OfflineIndicator from "@/components/offline-indicator";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Maghreb Orbit - المدار المغاربي | News as is... without bias",
  description:
    "The Maghreb Orbit - News as is... without bias | المدار المغاربي - الخبر كما هو ...بلا انحياز. Your trusted source for unbiased news from the Maghreb region and beyond.",
  keywords: [
    "news",
    "journal",
    "digital",
    "global",
    "breaking news",
    "أخبار",
    "جريدة",
    "عالمية",
    "The Maghreb Orbit",
    "المدار المغاربي",
    "maghreb news",
    "unbiased news",
    "الخبر كما هو",
  ],
  authors: [{ name: "The Maghreb Orbit" }],
  creator: "The Maghreb Orbit",
  publisher: "The Maghreb Orbit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "The Maghreb Orbit - المدار المغاربي | News as is... without bias",
    description:
      "The Maghreb Orbit - News as is... without bias | المدار المغاربي - الخبر كما هو ...بلا انحياز",
    siteName: "The Maghreb Orbit",
    images: [
      {
        url: "/logonews.png",
        width: 1200,
        height: 630,
        alt: "The Maghreb Orbit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Maghreb Orbit - المدار المغاربي | News as is... without bias",
    description:
      "The Maghreb Orbit - News as is... without bias | المدار المغاربي - الخبر كما هو ...بلا انحياز",
    images: ["/logonews.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111827",
  colorScheme: "dark light",
};

// Enable static generation with revalidation
export const revalidate = 300; // 5 minutes

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional favicon and meta tags */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="icon"
          href="/favicon-32x32.svg"
          sizes="32x32"
          type="image/svg+xml"
        />
        <link
          rel="icon"
          href="/favicon-16x16.svg"
          sizes="16x16"
          type="image/svg+xml"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.svg"
          sizes="180x180"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <OfflineIndicator />
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
        {/* Use custom glassmorphism Toaster for all notifications */}
        <Toaster />
        <ServiceWorkerRegistration />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
