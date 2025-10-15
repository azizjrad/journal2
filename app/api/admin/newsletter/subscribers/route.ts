import { NextRequest, NextResponse } from "next/server";
import { getNewsletterSubscribers, getNewsletterStats } from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";

// GET /api/admin/newsletter/subscribers - Get newsletter subscribers
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await ensureAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "all";
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Validate parameters
    const validPlans = ["all", "basic", "premium"];
    const validStatuses = [
      "all",
      "active",
      "trialing",
      "canceled",
      "past_due",
      "incomplete",
    ];

    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan filter" },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status filter" },
        { status: 400 }
      );
    }

    const [subscribers, stats] = await Promise.all([
      getNewsletterSubscribers({
        search,
        plan: plan as any,
        status: status as any,
        limit,
        skip,
      }),
      getNewsletterStats(),
    ]);

    return NextResponse.json({
      success: true,
      subscribers,
      stats,
      pagination: {
        limit,
        skip,
        total: stats.total,
      },
    });
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
