import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { rateLimiters, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Get client info
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitResult = rateLimiters.auth.check(request);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        "Too many login attempts. Please try again later."
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await authenticateUser(email, password, clientIP, userAgent);

    if (result.success) {
      // Set HTTP-only cookie with the token
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        user: result.user,
      });

      response.cookies.set("auth-token", result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
