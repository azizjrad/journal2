import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Report } from "@/lib/models/Article";
import { ensureAdmin } from "@/lib/ensure-admin";

// GET /api/admin/reports/debug - Debug dismissed reports
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

    await dbConnect();

    // Get all dismissed reports
    const dismissedReports = await Report.find({
      status: "dismissed",
    })
      .select("_id article_title status dismissed_at created_at updated_at")
      .lean();

    // Calculate what would be cleaned up
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Find reports that would be cleaned up
    const reportsToCleanup = await Report.find({
      status: "dismissed",
      dismissed_at: {
        $exists: true,
        $lt: twoDaysAgo,
      },
    })
      .select("_id article_title status dismissed_at created_at updated_at")
      .lean();

    return NextResponse.json({
      success: true,
      twoDaysAgo: twoDaysAgo.toISOString(),
      allDismissedReports: dismissedReports.map((r: any) => ({
        _id: r._id.toString(),
        article_title: r.article_title,
        status: r.status,
        dismissed_at: r.dismissed_at,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
      reportsToCleanup: reportsToCleanup.map((r: any) => ({
        _id: r._id.toString(),
        article_title: r.article_title,
        status: r.status,
        dismissed_at: r.dismissed_at,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
      totalDismissed: dismissedReports.length,
      eligibleForCleanup: reportsToCleanup.length,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Failed to debug reports" },
      { status: 500 }
    );
  }
}
