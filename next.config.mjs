import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set the workspace root explicitly
  outputFileTracingRoot: path.join(__dirname, "./"),

  typescript: {
    ignoreBuildErrors: true,
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image quality for better performance
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.netlify.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Enable standalone output only on Linux (Vercel)
  // Disabled on Windows to avoid file copy errors
  output: process.platform === "win32" ? undefined : "standalone",

  // External packages for server components
  serverExternalPackages: ["mongoose"],

  // Compression
  compress: true,

  // Optimize for production
  productionBrowserSourceMaps: false,

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  // Enable React strict mode
  reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: "akhbarna",
  project: "javascript-nextjs",

  // Only print logs in CI or when errors occur
  silent: !process.env.CI,

  // Upload source maps for better error tracking
  widenClientFileUpload: true,

  // Hide source code from source maps (security)
  hideSourceMaps: true,

  // Route Sentry requests through Next.js to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Remove Sentry logger statements in production
  disableLogger: true,

  // Enable Vercel Cron Monitors
  automaticVercelMonitors: true,

  // Disable copying traced files (fixes Windows build warnings)
  disableServerWebpackPlugin: process.platform === "win32",
  disableClientWebpackPlugin: false,
});
