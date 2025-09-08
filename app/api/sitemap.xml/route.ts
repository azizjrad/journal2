import { NextRequest, NextResponse } from "next/server";
import { getSitemapEntries } from "@/lib/db";

// Self-contained security functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const remote = request.headers.get("x-forwarded-for")?.split(",")[0];
  return forwarded || real || remote || "unknown";
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    // Security: Log sitemap requests for monitoring
    console.log(`Sitemap requested from ${clientIP}`);

    const entries = await getSitemapEntries();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

    // Security: Validate entries before processing
    if (!Array.isArray(entries)) {
      console.error(`Invalid sitemap entries from database`);
      return addSecurityHeaders(
        NextResponse.json(
          { error: "Sitemap temporarily unavailable" },
          { status: 503 }
        )
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `  <url>\n    <loc>${baseUrl}${
        entry.url
      }</loc>\n    <lastmod>${entry.last_modified.slice(
        0,
        10
      )}</lastmod>\n    <changefreq>${
        entry.change_frequency
      }</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>`;

    const response = new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    const clientIP = getClientIP(request);
    console.error(`Sitemap generation error from ${clientIP}:`, error);

    return addSecurityHeaders(
      NextResponse.json(
        { error: "Sitemap temporarily unavailable" },
        { status: 503 }
      )
    );
  }
}
