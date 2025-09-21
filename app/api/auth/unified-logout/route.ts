import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // List of possible auth/session cookies to clear
    const cookieNames = [
      "admin-token",
      "auth-token",
      "token",
      "session",
      "user-token",
      "writer-token",
    ];
    for (const name of cookieNames) {
      response.cookies.set(name, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
    }

    console.log("✅ Unified logout successful");

    return response;
  } catch (error: any) {
    console.error("Unified logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Request failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
