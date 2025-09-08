"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flag, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ReportButtonProps {
  articleId: string;
  articleTitle: string;
  variant?: "icon" | "text";
  size?: "sm" | "lg";
}

export function ReportButton({
  articleId,
  articleTitle,
  variant = "icon",
  size = "sm",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    report_type: "",
    reason: "",
    reporter_name: "",
    reporter_email: "",
  });

  const reportTypes = [
    {
      value: "spam",
      label: "Spam or Misleading",
      description: "Content appears to be spam or misleading",
    },
    {
      value: "inappropriate",
      label: "Inappropriate Content",
      description: "Offensive, hateful, or inappropriate content",
    },
    {
      value: "copyright",
      label: "Copyright Violation",
      description: "Content violates copyright or intellectual property",
    },
    {
      value: "misinformation",
      label: "Misinformation",
      description: "False or misleading information",
    },
    {
      value: "other",
      label: "Other",
      description: "Other issues not listed above",
    },
  ];

  const handleSubmit = async () => {
    if (!reportData.report_type || !reportData.reason.trim()) {
      toast.error("Please select a report type and provide a reason");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_id: articleId,
          article_title: articleTitle,
          report_type: reportData.report_type,
          reason: reportData.reason.trim(),
          reporter_name: reportData.reporter_name.trim() || null,
          reporter_email: reportData.reporter_email.trim() || null,
          priority: "medium",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          "Report submitted successfully. Thank you for helping us maintain quality content."
        );
        setOpen(false);
        setReportData({
          report_type: "",
          reason: "",
          reporter_name: "",
          reporter_email: "",
        });
      } else {
        toast.error(data.error || "Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = reportTypes.find(
    (type) => type.value === reportData.report_type
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size={size}
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <Flag className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size={size}
            className="text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report Article
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Article
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Help us maintain quality content by reporting issues with this
            article.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {/* Article Info */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-900 truncate">
              {articleTitle}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Article ID: {articleId}
            </p>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report-type" className="text-sm font-medium">
              Report Type *
            </Label>
            <Select
              value={reportData.report_type}
              onValueChange={(value) =>
                setReportData((prev) => ({ ...prev, report_type: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {reportTypes.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="py-2"
                  >
                    <div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Report *
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide detailed information about the issue..."
              value={reportData.reason}
              onChange={(e) =>
                setReportData((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="min-h-[80px] resize-none text-sm"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {reportData.reason.length}/1000 characters
            </p>
          </div>

          {/* Contact Info (Optional) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Contact Information (Optional)
            </Label>
            <div className="space-y-2">
              <Input
                placeholder="Your name (optional)"
                value={reportData.reporter_name}
                onChange={(e) =>
                  setReportData((prev) => ({
                    ...prev,
                    reporter_name: e.target.value,
                  }))
                }
                className="w-full text-sm"
                maxLength={100}
              />
              <Input
                type="email"
                placeholder="Your email (optional)"
                value={reportData.reporter_email}
                onChange={(e) =>
                  setReportData((prev) => ({
                    ...prev,
                    reporter_email: e.target.value,
                  }))
                }
                className="w-full text-sm"
                maxLength={255}
              />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Providing contact information helps us follow up if needed.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t bg-white">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !reportData.report_type || !reportData.reason.trim()
            }
            className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Report
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
