import { NextRequest, NextResponse } from "next/server";
import { trackArticleView } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, title } = body;

    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "127.0.0.1";

    // Get user agent and referer
    const userAgent = request.headers.get("user-agent") || "";
    const referer = body.referer || "";

    // Track the view using MongoDB
    await trackArticleView(articleId, ip, userAgent, referer);

    console.log(`📊 View tracked: Article ${articleId} (${title}) from ${ip}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
