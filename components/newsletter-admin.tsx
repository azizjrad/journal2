"use client";
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
import { toast } from "@/lib/use-toast";

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
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Please fill all fields and select at least one subscriber.",
      });
      return;
    }
    setLoading(true);
    try {
      // Create FormData to support file attachments
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("content", content);
      formData.append("subscriberIds", JSON.stringify(Array.from(selected)));

      // Add attachments if any
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      const res = await fetch("/api/internal/send-newsletter", {
        method: "POST",
        body: formData, // Send as FormData instead of JSON
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success!",
          description: "Newsletter sent successfully!",
        });
        setSubject("");
        setContent("");
        setAttachments([]);
        setAttachmentPreviews([]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to send newsletter.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send newsletter. Please try again.",
      });
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
                  <label
                    htmlFor={`sub-${s._id}`}
                    className="text-white cursor-pointer hover:text-red-400 transition-colors"
                  >
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
            <div className="mt-8 p-6 rounded-xl bg-white shadow-2xl border border-gray-200">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">
                  📧 Email Preview
                </span>
                <span className="text-sm text-gray-500 italic">
                  This is how subscribers will see your newsletter
                </span>
              </div>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>${subject || "Newsletter Preview"}</title>
                      <style>
                        body {
                          margin: 0;
                          padding: 0;
                          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                          background-color: #f4f4f4;
                          line-height: 1.6;
                        }
                        .email-container {
                          max-width: 600px;
                          margin: 20px auto;
                          background-color: #ffffff;
                          border-radius: 12px;
                          overflow: hidden;
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .email-header {
                          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                          padding: 40px 30px;
                          text-align: center;
                        }
                        .logo {
                          font-size: 42px;
                          font-weight: bold;
                          color: #ffffff;
                          margin: 0;
                          letter-spacing: -1px;
                          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                        }
                        .tagline {
                          color: #ffffff;
                          font-size: 14px;
                          margin-top: 8px;
                          opacity: 0.95;
                          letter-spacing: 1px;
                        }
                        .email-body {
                          padding: 40px 30px;
                          color: #333333;
                        }
                        .email-subject {
                          font-size: 28px;
                          font-weight: bold;
                          color: #1f2937;
                          margin: 0 0 25px 0;
                          line-height: 1.3;
                        }
                        .email-content {
                          font-size: 16px;
                          color: #4b5563;
                          line-height: 1.8;
                          margin-bottom: 30px;
                          white-space: pre-wrap;
                        }
                        .email-content p {
                          margin: 15px 0;
                        }
                        .divider {
                          height: 1px;
                          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
                          margin: 30px 0;
                        }
                        .cta-button {
                          display: inline-block;
                          padding: 14px 32px;
                          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                          color: #ffffff !important;
                          text-decoration: none;
                          border-radius: 8px;
                          font-weight: bold;
                          font-size: 16px;
                          margin: 20px 0;
                          box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
                        }
                        .email-footer {
                          background-color: #f9fafb;
                          padding: 30px;
                          text-align: center;
                          border-top: 1px solid #e5e7eb;
                        }
                        .footer-text {
                          color: #6b7280;
                          font-size: 14px;
                          margin: 10px 0;
                        }
                        .footer-links a {
                          color: #dc2626;
                          text-decoration: none;
                          margin: 0 12px;
                          font-size: 14px;
                          font-weight: 600;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="email-container">
                        <div class="email-header">
                          <h1 class="logo">Akhbarna</h1>
                          <p class="tagline">Your Trusted News Source</p>
                        </div>
                        <div class="email-body">
                          <h2 class="email-subject">${
                            subject || "Newsletter Subject"
                          }</h2>
                          <div class="divider"></div>
                          <div class="email-content">
                            ${
                              content ||
                              "<p style='color: #9ca3af; font-style: italic;'>Your newsletter content will appear here...</p>"
                            }
                          </div>
                          <div class="divider"></div>
                          <p style="text-align: center;">
                            <a href="#" class="cta-button">Visit Akhbarna</a>
                          </p>
                        </div>
                        <div class="email-footer">
                          <p class="footer-text">
                            <strong>Akhbarna</strong> - Delivering quality journalism you can trust
                          </p>
                          <div class="footer-links">
                            <a href="#">About Us</a> |
                            <a href="#">Contact</a> |
                            <a href="#">Privacy Policy</a>
                          </div>
                          <p class="footer-text">
                            © ${new Date().getFullYear()} Akhbarna. All rights reserved.
                          </p>
                        </div>
                      </div>
                    </body>
                    </html>
                  `}
                  style={{
                    width: "100%",
                    height: "700px",
                    border: "none",
                  }}
                  title="Newsletter Preview"
                />
              </div>
              {attachments.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📎</span>
                    <span>Attachments ({attachments.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center bg-white p-2 rounded border border-gray-300"
                      >
                        <span className="text-xs text-gray-600 mb-1">
                          {file.name}
                        </span>
                        {file.type.startsWith("image/") ? (
                          <img
                            src={attachmentPreviews[i]}
                            alt={file.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <span className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded text-gray-500 text-2xl">
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
