"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
  articleId?: number;
}

export function ShareButtons({ title, url, articleId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const trackEngagement = async (platform: string) => {
    if (articleId) {
      try {
        await fetch("/api/track/engagement", {
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
      } catch (error) {
        // Silently fail for analytics tracking
        console.debug("Engagement tracking failed:", error);
      }
    }
  };

  const copyLink = async () => {
    try {
      // Check if clipboard API is available and allowed
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API not available");
      }

      await navigator.clipboard.writeText(url);
      trackEngagement("copy_link");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);

      // Fallback: Try to select and copy using document.execCommand
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
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
        // Show error message to user
        alert("Copy failed. Please copy the URL manually: " + url);
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
        className={copied ? "text-green-600 bg-green-50" : ""}
      >
        <LinkIcon className="h-4 w-4" />
        {copied && <span className="ml-1 text-xs">Copied!</span>}
      </Button>
    </div>
  );
}
