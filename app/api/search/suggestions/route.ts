import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/db";

// Self-contained security functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const remote = request.headers.get("x-forwarded-for")?.split(",")[0];
  return forwarded || real || remote || "unknown";
}

function validateInput(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];
  return !suspiciousPatterns.some((pattern) => pattern.test(input));
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"&]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 100);
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Security: Validate and sanitize search query
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 100) {
      console.warn(
        `Search query too long from ${clientIP}: ${trimmedQuery.length} chars`
      );
      return NextResponse.json(
        { error: "Search query too long" },
        { status: 400 }
      );
    }

    if (!validateInput(trimmedQuery)) {
      console.warn(
        `Suspicious search query from ${clientIP}: ${trimmedQuery.substring(
          0,
          50
        )}`
      );
      return NextResponse.json([]);
    }

    const sanitizedQuery = sanitizeInput(trimmedQuery);
    const suggestions = await getSearchSuggestions(sanitizedQuery);

    return NextResponse.json(suggestions);
  } catch (error) {
    const clientIP = getClientIP(request);
    console.error(`Error fetching search suggestions from ${clientIP}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
