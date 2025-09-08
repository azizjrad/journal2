import { NextRequest, NextResponse } from "next/server";
import { cleanupDismissedReports } from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";

// POST /api/admin/reports/cleanup - Clean up dismissed reports older than 2 days
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await ensureAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    console.log("🧹 Starting manual cleanup of dismissed reports...");

    const result = await cleanupDismissedReports();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} dismissed reports older than 2 days`,
        deletedCount: result.deletedCount,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to cleanup dismissed reports",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cleanup endpoint:", error);
    return NextResponse.json(
      { error: "Failed to cleanup dismissed reports" },
      { status: 500 }
    );
  }
}

// GET /api/admin/reports/cleanup - Get cleanup information (for testing)
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

    // Calculate what would be cleaned up without actually deleting
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return NextResponse.json({
      success: true,
      message: "Cleanup information",
      cleanupThreshold: twoDaysAgo.toISOString(),
      description: "Dismissed reports older than this date would be deleted",
    });
  } catch (error) {
    console.error("Error in cleanup info endpoint:", error);
    return NextResponse.json(
      { error: "Failed to get cleanup information" },
      { status: 500 }
    );
  }
}
