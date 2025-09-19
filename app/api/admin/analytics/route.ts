import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { ensureAdmin } = await import("@/lib/ensure-admin");
    const adminCheck = await ensureAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const analyticsData = await getAnalyticsData(days);
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
