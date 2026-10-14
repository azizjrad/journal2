import { unstable_cache } from "next/cache";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/db/connection";
import { Report } from "@/lib/models/Article";

export interface ReportInterface {
  _id?: string;
  article_id: string;
  article_title: string;
  report_type:
    | "spam"
    | "inappropriate"
    | "copyright"
    | "misinformation"
    | "other";
  reason: string;
  reporter_email?: string;
  reporter_name?: string;
  reporter_ip?: string;
  status: "pending" | "in_progress" | "resolved" | "closed" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  reviewed_at?: Date;
  reviewed_by?: string;
  reviewed_by_name?: string;
  admin_notes?: string;
  resolution_notes?: string;
  escalated_at?: Date;
  escalated_by?: string;
  closed_at?: Date;
  closed_by?: string;
  dismissed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetReportsOptions {
  status?: string;
  priority?: string;
  reportType?: string;
  sortBy?: "date" | "priority" | "status";
  limit?: number;
  skip?: number;
}

function formatReport(report: any): ReportInterface {
  return {
    _id: report._id.toString(),
    article_id: report.article_id.toString(),
    article_title: report.article_title,
    report_type: report.report_type,
    reason: report.reason,
    reporter_email: report.reporter_email,
    reporter_name: report.reporter_name,
    reporter_ip: report.reporter_ip,
    status: report.status,
    priority: report.priority,
    reviewed_at: report.reviewed_at,
    reviewed_by: report.reviewed_by?._id?.toString(),
    reviewed_by_name: report.reviewed_by
      ? `${report.reviewed_by.first_name || ""} ${
          report.reviewed_by.last_name || ""
        }`.trim() || report.reviewed_by.username
      : report.reviewed_by_name,
    admin_notes: report.admin_notes,
    resolution_notes: report.resolution_notes,
    escalated_at: report.escalated_at,
    escalated_by: report.escalated_by?.toString(),
    closed_at: report.closed_at,
    closed_by: report.closed_by?.toString(),
    dismissed_at: report.dismissed_at,
    created_at: report.created_at,
    updated_at: report.updated_at,
  };
}

export async function getReports(
  options: GetReportsOptions = {},
): Promise<ReportInterface[]> {
  try {
    await dbConnect();

    const {
      status,
      priority,
      reportType,
      sortBy = "date",
      limit = 50,
      skip = 0,
    } = options;

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (priority && priority !== "all") {
      filter.priority = priority;
    }
    if (reportType && reportType !== "all") {
      filter.report_type = reportType;
    }

    let sort: any = {};
    switch (sortBy) {
      case "date":
        sort = { created_at: -1 };
        break;
      case "priority":
        sort = { priority: 1, created_at: -1 };
        break;
      case "status":
        sort = { status: 1, created_at: -1 };
        break;
      default:
        sort = { created_at: -1 };
    }

    const reports = await Report.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate("reviewed_by", "first_name last_name username")
      .lean();

    return reports.map(formatReport);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function getReportById(
  reportId: string,
): Promise<ReportInterface | null> {
  try {
    await dbConnect();

    const report = await Report.findById(reportId)
      .populate("reviewed_by", "first_name last_name username")
      .lean();

    return report ? formatReport(report) : null;
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
}

export async function createReport(reportData: {
  article_id: string;
  article_title: string;
  report_type:
    | "spam"
    | "inappropriate"
    | "copyright"
    | "misinformation"
    | "other";
  reason: string;
  reporter_email?: string | null;
  reporter_name?: string | null;
  reporter_ip?: string;
  priority?: "low" | "medium" | "high" | "critical";
}): Promise<ReportInterface | null> {
  try {
    await dbConnect();

    const report = new Report({
      ...reportData,
      status: "in_progress",
      priority: reportData.priority || "medium",
    });

    const savedReport = await report.save();

    return {
      _id: savedReport._id.toString(),
      article_id: savedReport.article_id.toString(),
      article_title: savedReport.article_title,
      report_type: savedReport.report_type,
      reason: savedReport.reason,
      reporter_email: savedReport.reporter_email,
      reporter_name: savedReport.reporter_name,
      reporter_ip: savedReport.reporter_ip,
      status: savedReport.status,
      priority: savedReport.priority,
      created_at: savedReport.created_at,
      updated_at: savedReport.updated_at,
    };
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

export async function updateReportStatus(
  reportId: string,
  statusData: {
    status: "in_progress" | "resolved" | "closed" | "dismissed";
    reviewed_by: string;
    reviewed_by_name?: string;
    admin_notes?: string;
    resolution_notes?: string;
  },
): Promise<ReportInterface | null> {
  try {
    await dbConnect();

    const updateData: any = {
      status: statusData.status,
      reviewed_by_name: statusData.reviewed_by_name,
      reviewed_at: new Date(),
    };

    if (
      statusData.reviewed_by &&
      Types.ObjectId.isValid(statusData.reviewed_by)
    ) {
      updateData.reviewed_by = statusData.reviewed_by;
    }

    if (statusData.admin_notes) {
      updateData.admin_notes = statusData.admin_notes;
    }

    if (statusData.resolution_notes) {
      updateData.resolution_notes = statusData.resolution_notes;
    }

    if (statusData.status === "closed") {
      updateData.closed_at = new Date();
      if (
        statusData.reviewed_by &&
        Types.ObjectId.isValid(statusData.reviewed_by)
      ) {
        updateData.closed_by = statusData.reviewed_by;
      }
    }

    if (statusData.status === "dismissed") {
      updateData.dismissed_at = new Date();
    }

    const updatedReport = await Report.findByIdAndUpdate(reportId, updateData, {
      new: true,
    })
      .populate("reviewed_by", "first_name last_name username")
      .lean();

    return updatedReport ? formatReport(updatedReport) : null;
  } catch (error) {
    console.error("Error updating report status:", error);
    return null;
  }
}

export async function deleteReport(reportId: string): Promise<boolean> {
  try {
    await dbConnect();

    const deletedReport = await Report.findByIdAndDelete(reportId);
    return !!deletedReport;
  } catch (error) {
    console.error("Error deleting report:", error);
    return false;
  }
}

export async function getReportStats(): Promise<{
  total: number;
  in_progress: number;
  resolved: number;
  closed: number;
  dismissed: number;
  high_priority: number;
  by_type: Record<string, number>;
}> {
  try {
    await dbConnect();

    const [totalResult, statusResult, priorityResult, typeResult] =
      await Promise.all([
        Report.countDocuments(),
        Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Report.countDocuments({
          priority: { $in: ["high", "critical"] },
        }),
        Report.aggregate([
          { $group: { _id: "$report_type", count: { $sum: 1 } } },
        ]),
      ]);

    const stats = {
      total: totalResult,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      dismissed: 0,
      high_priority: priorityResult,
      by_type: {} as Record<string, number>,
    };

    statusResult.forEach((item: any) => {
      stats[item._id as keyof typeof stats] = item.count;
    });

    typeResult.forEach((item: any) => {
      stats.by_type[item._id] = item.count;
    });

    return stats;
  } catch (error) {
    console.error("Error fetching report stats:", error);
    return {
      total: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      dismissed: 0,
      high_priority: 0,
      by_type: {},
    };
  }
}

export const getReportsCached = unstable_cache(
  async (options: GetReportsOptions = {}) => getReports(options),
  ["reports-list"],
  {
    revalidate: 300,
    tags: ["reports"],
  },
);

export const getReportStatsCached = unstable_cache(
  async () => getReportStats(),
  ["report-stats"],
  {
    revalidate: 300,
    tags: ["reports"],
  },
);

export async function cleanupDismissedReports(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    await dbConnect();

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    console.log(
      `🧹 Cleaning up dismissed reports older than ${twoDaysAgo.toISOString()}`,
    );

    const result = await Report.deleteMany({
      status: "dismissed",
      dismissed_at: {
        $exists: true,
        $lt: twoDaysAgo,
      },
    });

    console.log(
      `✅ Cleanup completed: ${result.deletedCount} dismissed reports deleted`,
    );

    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    console.error("❌ Error during dismissed reports cleanup:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
