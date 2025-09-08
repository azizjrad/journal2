import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value;
    const adminToken = request.cookies.get("admin-token")?.value;
    const token = authToken || adminToken;

    if (token) {
      // Extract user info from token if needed
      const clientIP = request.headers.get("x-forwarded-for") || "unknown";
      const userAgent = request.headers.get("user-agent") || undefined;

      // Note: We would need to decode the JWT to get userId and sessionToken
      // For now, we'll just clear the cookie
      await logoutUser(token, undefined, clientIP, userAgent);
    }

    // Clear both auth cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear auth-token
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    // Clear admin-token
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
