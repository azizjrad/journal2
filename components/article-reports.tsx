"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertTriangle,
  MessageSquare,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  _id: string;
  article_id: string;
  article_title: string;
  reporter_name?: string;
  reporter_email?: string;
  report_type: string;
  reason: string;
  status: "pending" | "in_progress" | "resolved" | "closed" | "dismissed";
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  dismissed_at?: string;
  priority: "low" | "medium" | "high";
}

export function ArticleReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("in_progress");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/reports", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data.data?.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report status");
      }

      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report._id === reportId
            ? {
                ...report,
                status: status as any,
                reviewed_at: new Date().toISOString(),
              }
            : report
        )
      );
    } catch (err) {
      console.error("Error updating report status:", err);
      toast.error("Failed to update report status", {
        description: "Please try again later.",
        duration: 4000,
      });
    }
  };

  const handleDeleteClick = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      const response = await fetch(`/api/admin/reports/${reportToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state for immediate UI feedback
        setReports((prevReports) =>
          prevReports.filter((report) => report._id !== reportToDelete)
        );

        toast.success("Report deleted successfully!", {
          description:
            "The report has been permanently removed from the system.",
          duration: 4000,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete report");
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("Failed to delete report", {
        description:
          err instanceof Error ? err.message : "Please try again later.",
        duration: 4000,
      });
    } finally {
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  // Keep the old function name for backward compatibility but update implementation
  const deleteReport = (reportId: string) => {
    handleDeleteClick(reportId);
  };

  const handleCleanupClick = () => {
    setCleanupDialogOpen(true);
  };

  const confirmCleanup = async () => {
    try {
      const response = await fetch("/api/admin/reports/cleanup", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();

        // Calculate what would be cleaned up locally
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Update local state by removing dismissed reports older than 2 days
        setReports((prevReports) =>
          prevReports.filter((report) => {
            if (report.status !== "dismissed") return true;
            // If no dismissed_at field, keep the report (shouldn't be cleaned)
            if (!report.dismissed_at) return true;
            // Remove if older than 2 days
            const dismissedDate = new Date(report.dismissed_at);
            return dismissedDate >= twoDaysAgo;
          })
        );

        if (result.deletedCount > 0) {
          toast.success("Cleanup completed successfully!", {
            description: `${result.deletedCount} dismissed reports older than 2 days have been deleted.`,
            duration: 5000,
          });
        } else {
          toast.info("No reports to cleanup", {
            description: "No dismissed reports older than 2 days were found.",
            duration: 4000,
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to cleanup dismissed reports"
        );
      }
    } catch (err) {
      console.error("Error cleaning up dismissed reports:", err);
      toast.error("Failed to cleanup dismissed reports", {
        description:
          err instanceof Error ? err.message : "Please try again later.",
        duration: 4000,
      });
    } finally {
      setCleanupDialogOpen(false);
    }
  };

  // Keep the old function name for backward compatibility but update implementation
  const cleanupDismissedReports = () => {
    handleCleanupClick();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
      case "resolved":
        return "bg-green-500/20 text-green-300 border-green-400/30";
      case "closed":
        return "bg-green-500/20 text-green-300 border-green-400/30";
      case "dismissed":
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Eye className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      case "dismissed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const groupedReports = {
    in_progress: reports.filter((r) => r.status === "in_progress"),
    resolved: reports.filter(
      (r) => r.status === "resolved" || r.status === "closed"
    ),
    dismissed: reports.filter((r) => r.status === "dismissed"),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Article Reports</h2>
            <p className="text-gray-300 mt-1">
              Manage user reports and content moderation
            </p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Article Reports</h2>
            <p className="text-gray-300 mt-1">
              Manage user reports and content moderation
            </p>
          </div>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Loading Reports
          </h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="flex justify-center">
            <Button
              onClick={fetchReports}
              variant="outline"
              size="lg"
              className="text-white border-white/30 bg-red-600/80 hover:bg-red-700/90 font-bold text-base px-8 py-3 rounded-xl shadow-lg focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Article Reports</h2>
          <p className="text-gray-300 mt-1">
            Manage user reports and content moderation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={cleanupDismissedReports}
            variant="outline"
            className="text-red-300 border-red-400/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Dismissed
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 sm:px-4">
        <Card className="bg-blue-500/10 border-blue-400/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">In Progress</p>
                <p className="text-2xl font-bold text-blue-300">
                  {groupedReports.in_progress.length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-400/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Resolved</p>
                <p className="text-2xl font-bold text-green-300">
                  {groupedReports.resolved.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-400/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Dismissed</p>
                <p className="text-2xl font-bold text-red-300">
                  {groupedReports.dismissed.length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="bg-white/10 border-0 rounded-xl flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-none px-0 h-10 sm:h-12 mt-2 mb-1 w-full"
          style={{
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
            marginRight: "-8px",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          <TabsTrigger
            value="in_progress"
            className="text-white text-xs sm:text-sm hover:text-white data-[state=active]:text-white data-[state=active]:bg-blue-600/20 hover:bg-blue-600/10 min-w-[90px] sm:min-w-[120px] px-2 sm:px-3 h-10 sm:h-12 rounded-xl"
            style={{ marginLeft: 0, marginRight: 4 }}
          >
            In Progress ({groupedReports.in_progress.length})
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="text-white text-xs sm:text-sm hover:text-white data-[state=active]:text-white data-[state=active]:bg-green-600/20 hover:bg-green-600/10 min-w-[90px] sm:min-w-[120px] px-2 sm:px-3 h-10 sm:h-12 rounded-xl"
            style={{ marginLeft: 0, marginRight: 4 }}
          >
            Resolved ({groupedReports.resolved.length})
          </TabsTrigger>
          <TabsTrigger
            value="dismissed"
            className="text-white text-xs sm:text-sm hover:text-white data-[state=active]:text-white data-[state=active]:bg-red-600/20 hover:bg-red-600/10 min-w-[90px] sm:min-w-[120px] px-2 sm:px-3 h-10 sm:h-12 rounded-xl"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            Dismissed ({groupedReports.dismissed.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedReports).map(([status, statusReports]) => (
          <TabsContent key={status} value={status}>
            {statusReports.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No {status} reports
                </h3>
                <p className="text-gray-300">
                  There are no reports with {status} status at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {statusReports.map((report) => (
                  <Card key={report._id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {report.article_title}
                            </h3>
                            <Badge className={getStatusColor(report.status)}>
                              {getStatusIcon(report.status)}
                              <span className="ml-1 capitalize">
                                {report.status}
                              </span>
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-400">
                              <strong>Type:</strong> {report.report_type}
                            </p>
                            <p className="text-sm text-gray-300">
                              <strong>Reason:</strong> {report.reason}
                            </p>
                            <p className="text-sm text-gray-400">
                              <strong>Priority:</strong> {report.priority}
                            </p>
                            {report.reporter_name && (
                              <p className="text-sm text-gray-400">
                                <User className="h-4 w-4 inline mr-1" />
                                <strong>Reporter:</strong>{" "}
                                {report.reporter_name}
                                {report.reporter_email &&
                                  ` (${report.reporter_email})`}
                              </p>
                            )}
                            <p className="text-sm text-gray-400">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              <strong>Reported:</strong>{" "}
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                            {report.reviewed_at && (
                              <p className="text-sm text-gray-400">
                                <strong>Reviewed:</strong>{" "}
                                {new Date(
                                  report.reviewed_at
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {report.status === "in_progress" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateReportStatus(report._id, "resolved")
                                }
                                className="bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30"
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateReportStatus(report._id, "dismissed")
                                }
                                className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border border-gray-500/30"
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                          {report.status === "dismissed" && (
                            <Button
                              size="sm"
                              onClick={() => deleteReport(report._id)}
                              className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Report
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this report? This action cannot be
              undone and will permanently remove the report from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white hover:text-white bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 hover:border-white/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cleanup Confirmation Dialog */}
      <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Cleanup Dismissed Reports
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete all dismissed reports older than 2
              days? This action cannot be undone and will permanently remove
              multiple reports from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white hover:text-white bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 hover:border-white/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCleanup}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cleanup Reports
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
