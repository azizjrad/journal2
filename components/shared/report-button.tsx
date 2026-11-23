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
import { toast } from "@/lib/context/use-toast";
import { useLanguage } from "@/lib/context/language-context";

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
  const { t } = useLanguage();
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
      label: t("report_type_spam", "Spam or misleading", "محتوى مزعج أو مضلل"),
      description: t("report_type_spam_desc", "Content appears to be spam or misleading", "يبدو المحتوى مزعجًا أو مضللًا"),
    },
    {
      value: "inappropriate",
      label: t("report_type_inappropriate", "Inappropriate content", "محتوى غير لائق"),
      description: t("report_type_inappropriate_desc", "Offensive, hateful, or inappropriate content", "محتوى مسيء أو كراهية أو غير لائق"),
    },
    {
      value: "copyright",
      label: t("report_type_copyright", "Copyright violation", "انتهاك حقوق النشر"),
      description: t("report_type_copyright_desc", "Content violates copyright or intellectual property", "ينتهك المحتوى حقوق النشر أو الملكية الفكرية"),
    },
    {
      value: "misinformation",
      label: t("report_type_misinformation", "Misinformation", "معلومات مضللة"),
      description: t("report_type_misinformation_desc", "False or misleading information", "معلومات خاطئة أو مضللة"),
    },
    {
      value: "other",
      label: t("report_type_other", "Other", "أخرى"),
      description: t("report_type_other_desc", "Other issues not listed above", "مشكلات أخرى غير مذكورة أعلاه"),
    },
  ];

  const handleSubmit = async () => {
    if (!reportData.report_type || !reportData.reason.trim()) {
      toast.error(t("report_validation", "Please select a report type and provide a reason.", "يرجى اختيار نوع البلاغ وذكر السبب."));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        toast.success(t("report_success", "Report submitted. Thank you for helping us maintain quality content.", "تم إرسال البلاغ. شكرًا لمساعدتك في الحفاظ على جودة المحتوى."));
        setOpen(false);
        setReportData({ report_type: "", reason: "", reporter_name: "", reporter_email: "" });
      } else {
        toast.error(data.error || t("report_failed", "Failed to submit report. Please try again.", "تعذر إرسال البلاغ. يرجى المحاولة مرة أخرى."));
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(t("report_failed", "Failed to submit report. Please try again.", "تعذر إرسال البلاغ. يرجى المحاولة مرة أخرى."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size={size}
            className="h-8 w-8 p-0 text-slate-500 hover:text-[#7a3030] hover:bg-stone-100 rounded-md"
            aria-label={t("report_article", "Report article", "الإبلاغ عن المقال")}
          >
            <Flag className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size={size}
            className="text-slate-700 border-stone-300 hover:border-[#7a3030]/40 hover:text-[#7a3030] hover:bg-stone-50 rounded-md"
          >
            <Flag className="h-4 w-4 me-2" />
            {t("report_article", "Report article", "الإبلاغ عن المقال")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col border-stone-200 bg-[#fbfaf7]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg text-slate-950">
            <AlertTriangle className="h-5 w-5 text-[#7a3030]" />
            {t("report_article", "Report article", "الإبلاغ عن المقال")}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {t(
              "report_help",
              "Help us maintain quality by reporting an issue with this article.",
              "ساعدنا في الحفاظ على الجودة بالإبلاغ عن مشكلة في هذا المقال.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pe-2">
          <div className="p-3 bg-white rounded-md border border-stone-200">
            <p className="text-sm font-medium text-slate-900 line-clamp-2">{articleTitle}</p>
            <p className="text-xs text-slate-500 mt-1">ID: {articleId}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-type" className="text-sm font-medium text-slate-800">
              {t("report_type_label", "Report type", "نوع البلاغ")} *
            </Label>
            <Select
              value={reportData.report_type}
              onValueChange={(value) => setReportData((prev) => ({ ...prev, report_type: value }))}
            >
              <SelectTrigger className="w-full bg-white border-stone-300 focus:ring-[#7a3030]/20">
                <SelectValue placeholder={t("select_report_type", "Select a report type", "اختر نوع البلاغ")} />
              </SelectTrigger>
              <SelectContent className="max-h-56 border-stone-200">
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="py-2">
                    <div>
                      <div className="font-medium text-sm text-slate-900">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-slate-800">
              {t("report_reason", "Reason", "السبب")} *
            </Label>
            <Textarea
              id="reason"
              placeholder={t("report_reason_placeholder", "Provide details about the issue...", "اذكر تفاصيل المشكلة...")}
              value={reportData.reason}
              onChange={(e) => setReportData((prev) => ({ ...prev, reason: e.target.value }))}
              className="min-h-[90px] resize-none text-sm bg-white border-stone-300 focus-visible:ring-[#7a3030]/20"
              maxLength={1000}
            />
            <p className="text-xs text-slate-500">{reportData.reason.length}/1000</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-800">
              {t("contact_optional", "Contact information (optional)", "معلومات التواصل (اختياري)")}
            </Label>
            <div className="space-y-2">
              <Input
                placeholder={t("your_name_optional", "Your name (optional)", "اسمك (اختياري)")}
                value={reportData.reporter_name}
                onChange={(e) => setReportData((prev) => ({ ...prev, reporter_name: e.target.value }))}
                className="w-full text-sm bg-white border-stone-300 focus-visible:ring-[#7a3030]/20"
                maxLength={100}
              />
              <Input
                type="email"
                placeholder={t("your_email_optional", "Your email (optional)", "بريدك الإلكتروني (اختياري)")}
                value={reportData.reporter_email}
                onChange={(e) => setReportData((prev) => ({ ...prev, reporter_email: e.target.value }))}
                className="w-full text-sm bg-white border-stone-300 focus-visible:ring-[#7a3030]/20"
                maxLength={255}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("contact_followup", "Providing contact information helps us follow up if needed.", "تزويدنا بمعلومات التواصل يساعدنا على المتابعة عند الحاجة.")}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t border-stone-200 bg-[#fbfaf7]">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="flex-1 sm:flex-none border-stone-300 bg-white text-slate-700 hover:bg-stone-100 hover:text-slate-900 hover:border-stone-400"
          >
            {t("cancel", "Cancel", "إلغاء")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !reportData.report_type || !reportData.reason.trim()}
            className="bg-[#7a3030] hover:bg-[#632626] text-white flex-1 sm:flex-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("submitting", "Submitting...", "جارٍ الإرسال...")}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {t("submit_report", "Submit report", "إرسال البلاغ")}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}