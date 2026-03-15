"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
  articleId?: string;
}

export function ShareButtons({ title, url, articleId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const trackEngagement = async (platform: string) => {
    if (articleId) {
      try {
        const res = await fetch("/api/track/engagement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleId,
            engagementType: "share",
            platform,
          }),
        });
        const data = await res.json().catch(() => ({}));
        console.log("[Engagement API] status:", res.status, "data:", data);
      } catch (error) {
        console.error("Engagement tracking failed:", error);
      }
    }
  };

  const copyLink = async () => {
    // Ensure we copy the absolute URL
    let absoluteUrl = url;
    if (typeof window !== "undefined" && url.startsWith("/")) {
      absoluteUrl = window.location.origin + url;
    }
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(absoluteUrl);
      trackEngagement("copy_link");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = absoluteUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        trackEngagement("copy_link");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy also failed:", fallbackErr);
        alert("Copy failed. Please copy the URL manually: " + absoluteUrl);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 mr-2">Share:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        className={`transition-colors duration-200 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 group ${
          copied ? "text-green-600 bg-green-50 border-green-400" : ""
        }`}
        aria-label="Copy article link"
      >
        <LinkIcon className="h-4 w-4 group-hover:text-blue-600 transition-colors duration-200" />
        {copied && <span className="ml-1 text-xs">Copied!</span>}
      </Button>
    </div>
  );
}
