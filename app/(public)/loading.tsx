"use client";

import { useEffect, useState } from "react";

export default function MainSiteLoading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detect slow network or only show after significant delay
    const slowNetworkThreshold = 1000; // Show after 1 second (means loading is actually slow)

    // Check if network is slow using Network Information API
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    const isSlowNetwork =
      connection &&
      (connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g" ||
        connection.saveData);

    // Show immediately if network is detected as slow, otherwise wait longer
    const delay = isSlowNetwork ? 500 : slowNetworkThreshold;

    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything if not showing (prevents flash on fast loads)
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-100/80">
      {/* Simulated main site content background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-16 bg-white border-b border-gray-200"></div>
        <div className="absolute top-16 left-0 w-full h-8 bg-red-600"></div>
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-4/5 space-y-4 mt-12">
          <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="h-32 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Blur overlay */}
      <div
        className="absolute inset-0 bg-transparent"
        style={{
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      {/* Loading content */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          {/* Large Red Circle with Pulse Animation */}
          <div className="w-24 h-24 bg-red-600 rounded-full mb-8 animate-pulse shadow-2xl relative">
            <div className="absolute inset-0 w-24 h-24 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute inset-2 w-20 h-20 bg-red-700 rounded-full animate-pulse"></div>
          </div>

          {/* Enhanced Loading Dots Animation */}
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s] shadow-lg"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s] shadow-lg"></div>
            <div className="w-3 h-3 bg-red-700 rounded-full animate-bounce shadow-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
