import { NextRequest, NextResponse } from "next/server";
import { getReports, getReportStats, createReport } from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";

// GET /api/admin/reports - Get all reports with optional filtering
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

    // Extract query parameters
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    const reportType = searchParams.get("type") || "all";
    const sortBy =
      (searchParams.get("sortBy") as "date" | "priority" | "status") || "date";
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Get reports and stats
    const [reports, stats] = await Promise.all([
      getReports({
        status: status !== "all" ? status : undefined,
        priority: priority !== "all" ? priority : undefined,
        reportType: reportType !== "all" ? reportType : undefined,
        sortBy,
        limit,
        skip,
      }),
      getReportStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reports,
        stats,
        pagination: {
          limit,
          skip,
          total: stats.total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/admin/reports - Create a new report (can be used for testing)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication for creation endpoint
    const adminCheck = await ensureAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      article_id,
      article_title,
      report_type,
      reason,
      reporter_email,
      reporter_name,
      priority = "medium",
    } = body;

    // Validate required fields
    if (!article_id || !article_title || !report_type || !reason) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: article_id, article_title, report_type, reason",
        },
        { status: 400 }
      );
    }

    // Validate report_type
    const validTypes = [
      "spam",
      "inappropriate",
      "copyright",
      "misinformation",
      "other",
    ];
    if (!validTypes.includes(report_type)) {
      return NextResponse.json(
        {
          error:
            "Invalid report_type. Must be one of: " + validTypes.join(", "),
        },
        { status: 400 }
      );
    }

    // Get reporter IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const reporter_ip = forwardedFor?.split(",")[0] || realIp || "unknown";

    const report = await createReport({
      article_id,
      article_title,
      report_type,
      reason,
      reporter_email,
      reporter_name,
      reporter_ip,
      priority,
    });

    if (!report) {
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
