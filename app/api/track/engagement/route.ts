import { NextRequest, NextResponse } from "next/server";
import { trackArticleEngagement } from "@/lib/db";

// Simple security functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

function validateInput(input: string): boolean {
  // Basic XSS and injection protection
  const dangerous = /<script|javascript:|data:|vbscript:|onload|onerror/i;
  return !dangerous.test(input);
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>\"'&]/g, (match) => {
    const escapes: { [key: string]: string } = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    };
    return escapes[match] || match;
  });
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    // Security: Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.warn(
        `Invalid JSON in engagement tracking request from ${clientIP}`
      );
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { articleId, engagementType, platform } = body;

    // Security: Validate articleId (accept MongoDB ObjectId string)
    const objectIdPattern = /^[a-fA-F0-9]{24}$/;
    if (
      !articleId ||
      typeof articleId !== "string" ||
      !objectIdPattern.test(articleId)
    ) {
      console.warn(
        `Invalid article ID in engagement tracking from ${clientIP}: ${articleId}`
      );
      return NextResponse.json(
        { error: "Valid article ID is required" },
        { status: 400 }
      );
    }

    // Security: Validate engagementType
    const validEngagementTypes = [
      "like",
      "share",
      "comment",
      "bookmark",
      "read_time",
      "scroll_depth",
    ];
    if (
      !engagementType ||
      typeof engagementType !== "string" ||
      !validEngagementTypes.includes(engagementType)
    ) {
      console.warn(
        `Invalid engagement type from ${clientIP}: ${engagementType}`
      );
      return NextResponse.json(
        { error: "Valid engagement type is required" },
        { status: 400 }
      );
    }

    // Security: Validate and sanitize platform if provided
    let sanitizedPlatform;
    if (platform) {
      if (typeof platform !== "string" || platform.length > 50) {
        console.warn(`Invalid platform from ${clientIP}: ${platform}`);
        return NextResponse.json(
          { error: "Invalid platform" },
          { status: 400 }
        );
      }

      if (!validateInput(platform)) {
        console.warn(`Suspicious platform input from ${clientIP}: ${platform}`);
        return NextResponse.json(
          { error: "Invalid platform format" },
          { status: 400 }
        );
      }

      sanitizedPlatform = sanitizeInput(platform);
    }
    const userAgent = request.headers.get("user-agent") || undefined;

    // Security: Log engagement tracking for monitoring
    console.log(
      `Engagement tracking from ${clientIP}: Article ${articleId}, Type: ${engagementType}, Platform: ${
        sanitizedPlatform || "N/A"
      }`
    );

    await trackArticleEngagement(
      articleId,
      engagementType,
      clientIP,
      userAgent,
      sanitizedPlatform
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const clientIP = getClientIP(request);
    console.error(`Track engagement error from ${clientIP}:`, error);
    return NextResponse.json(
      { error: "Failed to track engagement" },
      { status: 500 }
    );
  }
}
