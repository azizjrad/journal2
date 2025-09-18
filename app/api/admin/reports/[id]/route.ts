import { NextRequest, NextResponse } from "next/server";
import { getReportById, updateReportStatus, deleteReport } from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";

// GET /api/admin/reports/[id] - Get specific report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin authentication
    const adminCheck = await ensureAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reports/[id] - Update report status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin authentication
    const adminCheck = await ensureAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, admin_notes, resolution_notes } = body;

    // Validate status
    const validStatuses = [
      "pending",
      "in_progress",
      "resolved",
      "closed",
      "dismissed",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 }
      );
    }

    // Get admin user info from the admin check
    const reviewedBy = adminCheck.user?.id || "admin";
    const reviewedByName = adminCheck.user?.username || "Admin";

    const updatedReport = await updateReportStatus(id, {
      status,
      reviewed_by: reviewedBy,
      reviewed_by_name: reviewedByName,
      admin_notes,
      resolution_notes,
    });

    if (!updatedReport) {
      return NextResponse.json(
        { error: "Report not found or failed to update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reports/[id] - Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin authentication
    const adminCheck = await ensureAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const success = await deleteReport(id);

    // Treat missing report as success (idempotent delete)
    return NextResponse.json({
      success: true,
      message: success
        ? "Report deleted successfully"
        : "Report not found (already deleted)",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
