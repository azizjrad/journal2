import { NextRequest, NextResponse } from "next/server";
import { ensureAdminExists } from "@/lib/ensure-admin";

export async function GET(request: NextRequest) {
  try {
    // Only run in production on Vercel
    if (process.env.VERCEL && process.env.NODE_ENV === "production") {
      await ensureAdminExists();
      
      return NextResponse.json({
        success: true,
        message: "Admin initialization completed",
        credentials: {
          email: "admin@journal.com",
          password: "admin123",
        },
      });
    } else {
      // For development, just ensure admin exists
      await ensureAdminExists();
      
      return NextResponse.json({
        success: true,
        message: "Admin user verified",
      });
    }
  } catch (error: any) {
    console.error("Admin initialization error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Admin initialization failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Same logic for POST requests
  return GET(request);
}
