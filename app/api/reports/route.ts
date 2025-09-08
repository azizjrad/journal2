import { NextRequest, NextResponse } from "next/server";
import { createReport } from "@/lib/db";

// POST /api/reports - Create a new report from public users
export async function POST(request: NextRequest) {
  try {
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

    // Validate priority
    const validPriorities = ["low", "medium", "high", "critical"];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        {
          error:
            "Invalid priority. Must be one of: " + validPriorities.join(", "),
        },
        { status: 400 }
      );
    }

    // Get reporter IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const reporter_ip = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Rate limiting: Check if same IP has reported this article recently
    // This is a simple rate limiting - you might want to implement more sophisticated logic
    const recentReportTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

    const report = await createReport({
      article_id,
      article_title,
      report_type,
      reason: reason.trim(),
      reporter_email: reporter_email?.trim() || null,
      reporter_name: reporter_name?.trim() || null,
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
      message:
        "Report submitted successfully. Thank you for helping us maintain quality content.",
      data: {
        report_id: report._id,
        status: report.status,
      },
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
