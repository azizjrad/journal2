import { NextRequest, NextResponse } from "next/server";
import { ensureAdminExists } from "@/lib/ensure-admin";

export async function GET() {
  try {
    await ensureAdminExists();

    return NextResponse.json({
      success: true,
      message: "Admin user is ready",
      credentials: {
        email: "admin@journal.com",
        password: "admin123",
      },
    });
  } catch (error: any) {
    console.error("Setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Setup failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await ensureAdminExists();

    return NextResponse.json({
      success: true,
      message: "Admin user is ready",
      credentials: {
        email: "admin@journal.com",
        password: "admin123",
      },
    });
  } catch (error: any) {
    console.error("Setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Setup failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
