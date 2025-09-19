import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
interface SentNewsletter {
  _id: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
}
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const LOGO_URL = "/logo.png"; // Update with your logo path in /public

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
}

export default function NewsletterAdmin() {
  // Newsletter history state
  const [history, setHistory] = useState<SentNewsletter[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState<string | null>(null);
  const [historyEndDate, setHistoryEndDate] = useState<string | null>(null);

  // File upload state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(files);
    setAttachmentPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const fetchHistory = async (
    page = 1,
    q = "",
    startDate: string | null = null,
    endDate: string | null = null
  ) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(page));
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/internal/newsletter-history?${params}`);
      const data = await res.json();
      if (res.ok) {
        setHistory(data.newsletters || []);
        setHistoryTotal(data.total || 0);
      } else {
        setHistoryError(data.error || "Failed to load history");
      }
    } catch (err) {
      setHistoryError("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(historyPage, historyQuery, historyStartDate, historyEndDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage, historyQuery, historyStartDate, historyEndDate]);

  // Subscribers and form state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch("/api/internal/newsletter-subscribers")
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(data.subscribers || []);
        setSelected(
          new Set((data.subscribers || []).map((s: Subscriber) => s._id))
        );
      });
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim() || selected.size === 0) {
      toast.error("Please fill all fields and select at least one subscriber.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/internal/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content,
          subscriberIds: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Newsletter sent successfully!");
        setSubject("");
        setContent("");
      } else {
        toast.error(data.error || "Failed to send newsletter.");
      }
    } catch (err) {
      toast.error("Failed to send newsletter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-8">
      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-red-500">
            Send Newsletter
          </CardTitle>
          <CardDescription className="text-base text-white/80">
            Effortlessly create and deliver stunning newsletters with
            attachments to your audience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2">
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-2 bg-white/30 border border-transparent text-white placeholder:text-white/60 focus:border-red-500 focus:ring-red-400/20"
            />
            <Textarea
              placeholder="Newsletter content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mb-2 bg-white/30 border border-transparent text-white placeholder:text-white/60 focus:border-red-500 focus:ring-red-400/20"
            />
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-white">Attachments</label>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-white rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white/20 border-white/30"
              />
              {attachmentPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachmentPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-lg border border-white/30 shadow"
                      />
                      <button
                        type="button"
                        aria-label="Remove attachment"
                        onClick={() => {
                          setAttachments((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          );
                          setAttachmentPreviews((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          );
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 shadow-lg border-2 border-white"
                        tabIndex={0}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-2 text-white">
              Select Recipients
            </div>
            <div className="max-h-48 overflow-y-auto border rounded p-2 bg-white/10 border-white/20">
              {subscribers.map((s) => (
                <div key={s._id} className="flex items-center gap-2 mb-1">
                  <Checkbox
                    checked={selected.has(s._id)}
                    onCheckedChange={() => toggleSelect(s._id)}
                    id={`sub-${s._id}`}
                  />
                  <label htmlFor={`sub-${s._id}`}>
                    {s.email}
                    {s.name ? ` (${s.name})` : ""}
                  </label>
                </div>
              ))}
              {subscribers.length === 0 && (
                <div className="text-red-500 font-semibold text-center py-2">
                  No subscribers found.
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border border-white/70 text-white bg-white/20 hover:bg-white/30 hover:border-white/90 font-semibold shadow-md"
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg"
            >
              {loading ? "Sending..." : "Send Newsletter"}
            </Button>
          </div>
          {showPreview && (
            <div className="mt-8 p-6 rounded-xl bg-white/80 shadow-2xl border border-white/30">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xl font-bold text-gray-800">
                  Newsletter Preview
                </span>
              </div>
              <div className="mb-2 text-lg font-semibold text-gray-900">
                {subject || (
                  <span className="italic text-gray-400">(No subject)</span>
                )}
              </div>
              <div
                className="prose prose-neutral max-w-none text-gray-800"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {content || (
                  <span className="italic text-gray-400">(No content)</span>
                )}
              </div>
              {attachments.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold text-gray-700 mb-2">
                    Attachments:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs text-gray-600">
                          {file.name}
                        </span>
                        {file.type.startsWith("image/") ? (
                          <img
                            src={attachmentPreviews[i]}
                            alt={file.name}
                            className="h-16 w-16 object-cover rounded border border-gray-300"
                          />
                        ) : (
                          <span className="inline-block h-16 w-16 flex items-center justify-center bg-gray-200 rounded border border-gray-300 text-gray-500">
                            📄
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl overflow-hidden px-2 sm:px-6">
        <CardHeader className="px-2 py-3 sm:px-6 sm:py-6">
          <CardTitle className="text-lg sm:text-2xl font-bold text-white">
            Sent Newsletters
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-white/80">
            View history of sent newsletters. Search by subject or content.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 py-3 sm:px-6 sm:py-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <Input
              placeholder="Search newsletters..."
              value={historyQuery}
              onChange={(e) => {
                setHistoryPage(1);
                setHistoryQuery(e.target.value);
              }}
              className="max-w-xs bg-white/30 border border-transparent text-white placeholder:text-white/60 focus:border-red-500 focus:ring-red-400/20"
            />
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="text-white/80 text-xs sm:text-sm">From</label>
              <input
                type="date"
                value={historyStartDate || ""}
                onChange={(e) => {
                  setHistoryPage(1);
                  setHistoryStartDate(e.target.value || null);
                }}
                className="rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/30 border border-transparent text-white text-xs sm:text-sm focus:border-red-500 focus:ring-red-400/20 outline-none"
                style={{ minWidth: 80, maxWidth: 110 }}
              />
              <label className="text-white/80 text-xs sm:text-sm">To</label>
              <input
                type="date"
                value={historyEndDate || ""}
                onChange={(e) => {
                  setHistoryPage(1);
                  setHistoryEndDate(e.target.value || null);
                }}
                className="rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/30 border border-transparent text-white text-xs sm:text-sm focus:border-red-500 focus:ring-red-400/20 outline-none"
                style={{ minWidth: 80, maxWidth: 110 }}
              />
            </div>
          </div>
          {historyLoading ? (
            <div className="text-white/80">Loading...</div>
          ) : historyError ? (
            <div className="text-red-400 font-semibold">{historyError}</div>
          ) : history.length === 0 ? (
            <div className="text-white/80 font-semibold text-center py-2">
              No sent newsletters found.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {history.map((n) => (
                <div
                  key={n._id}
                  className="py-3 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-medium text-base text-white">
                      {n.subject}
                    </div>
                    <div className="text-xs text-white/70">
                      Sent {new Date(n.sentAt).toLocaleString()} &bull;{" "}
                      {n.recipientCount} recipients
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination
            currentPage={historyPage}
            totalPages={Math.ceil(historyTotal / 10)}
            onPageChange={setHistoryPage}
            itemsPerPage={10}
            totalItems={historyTotal}
          />
        </CardContent>
      </Card>
    </div>
  );
}
