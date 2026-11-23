import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/professional-news.css";
import { LanguageProvider } from "@/lib/context/language-context";
import { AuthProvider } from "@/lib/context/user-auth";
import { Toaster } from "@/components/ui/toaster";

import ServiceWorkerRegistration from "@/components/shared/service-worker-registration";
import OfflineIndicator from "@/components/shared/offline-indicator";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "The Maghreb Corridor - نشرة الممر المغاربي",
  description:
    "The Maghreb Corridor - Tri-weekly situational and policy briefing. Situational awareness, mobility and local governance across Libya and North Africa. نشرة الممر المغاربي - نشرة رصد وتحليل سياسات تصدر ثلاث مرات أسبوعياً.",
  keywords: [
    "news",
    "journal",
    "briefing",
    "maghreb",
    "libya",
    "north africa",
    "policy",
    "governance",
    "mobility",
    "The Maghreb Corridor",
    "نشرة الممر المغاربي",
    "الممر المغاربي",
  ],
  authors: [{ name: "The Maghreb Corridor" }],
  creator: "The Maghreb Corridor",
  publisher: "The Maghreb Corridor",
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
    title: "The Maghreb Corridor - نشرة الممر المغاربي",
    description:
      "Tri-weekly situational and policy briefing across Libya and North Africa.",
    siteName: "The Maghreb Corridor",
    images: [
      {
        url: "/logonews.png",
        width: 1200,
        height: 630,
        alt: "The Maghreb Corridor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Maghreb Corridor - نشرة الممر المغاربي",
    description:
      "Tri-weekly situational and policy briefing across Libya and North Africa.",
    images: ["/logonews.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1f2937",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "try{var l=localStorage.getItem('language');if(l==='ar'){document.documentElement.lang='ar';document.documentElement.dir='rtl';}else if(l==='en'){document.documentElement.lang='en';document.documentElement.dir='ltr';}}catch(e){}",
          }}
        />
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
        <meta name="theme-color" content="#1f2937" />
        <meta name="msapplication-TileColor" content="#f8f7f4" />
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
