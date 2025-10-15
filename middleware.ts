import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Set cache headers based on content type
  if (pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    // Static assets - cache for 1 year
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/)) {
    // Images - cache for 1 month
    response.headers.set(
      "Cache-Control",
      "public, max-age=2592000, stale-while-revalidate=86400"
    );
  } else if (pathname.startsWith("/api/")) {
    // API routes - different caching strategies
    if (pathname.includes("/auth/")) {
      // Auth APIs - no cache
      response.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
      );
    } else if (
      pathname.includes("/articles") ||
      pathname.includes("/categories")
    ) {
      // Content APIs - cache for 5 minutes
      response.headers.set(
        "Cache-Control",
        "public, max-age=300, stale-while-revalidate=60"
      );
    } else {
      // Other APIs - cache for 1 minute
      response.headers.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=30"
      );
    }
  } else if (
    pathname.startsWith("/article/") ||
    pathname.startsWith("/category/")
  ) {
    // Article and category pages - cache for 10 minutes
    response.headers.set(
      "Cache-Control",
      "public, max-age=600, stale-while-revalidate=300"
    );
  } else if (pathname === "/" || pathname.startsWith("/news")) {
    // Homepage and news pages - cache for 2 minutes
    response.headers.set(
      "Cache-Control",
      "public, max-age=120, stale-while-revalidate=60"
    );
  } else {
    // Other pages - cache for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=60"
    );
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // CSP for enhanced security (updated to allow Vercel Analytics and Stripe)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://js.stripe.com https://m.stripe.network",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://api.stripe.com https://m.stripe.network",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth API routes)
     * - api/user (user API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/user).*)",
  ],
};
