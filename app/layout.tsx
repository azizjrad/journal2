import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/professional-news.css";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/user-auth";
import { Toaster } from "sonner";
import ServiceWorkerRegistration from "@/components/service-worker-registration";
import OfflineIndicator from "@/components/offline-indicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akhbarna - أخبارنا",
  description:
    "Your trusted source for global news - مصدرك الموثوق للأخبار العالمية",
  keywords: [
    "news",
    "journal",
    "digital",
    "global",
    "breaking news",
    "أخبار",
    "جريدة",
    "عالمية",
    "akhbarna",
    "أخبارنا",
  ],
  authors: [{ name: "Akhbarna" }],
  creator: "Akhbarna",
  publisher: "Akhbarna",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "Akhbarna - أخبارنا",
    description:
      "Your trusted source for global news - مصدرك الموثوق للأخبار العالمية",
    siteName: "Akhbarna",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akhbarna - أخبارنا",
    description:
      "Your trusted source for global news - مصدرك الموثوق للأخبار العالمية",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111827",
  colorScheme: "dark light",
};

export default function RootLayout({
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
        <Toaster position="top-right" expand={false} richColors closeButton />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
