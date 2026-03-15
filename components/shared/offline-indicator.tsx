"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ${
        isOnline
          ? "bg-green-600 transform translate-y-0"
          : "bg-red-600 transform translate-y-0"
      }`}
      style={{
        transform:
          showIndicator || !isOnline ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          Back online! Content will update automatically.
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          You're offline. Some features may be limited.
        </>
      )}
    </div>
  );
}
