import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, checkRateLimit, clearRateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Get client info
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Rate limiting
    if (!checkRateLimit(`login-${clientIP}`, 5, 15 * 60 * 1000)) {
      // 5 attempts per 15 minutes
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

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
      // Clear rate limit on successful login
      clearRateLimit(`login-${clientIP}`);

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
