"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available
                  if (
                    confirm(
                      "New content is available! Would you like to refresh?"
                    )
                  ) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });

      // Handle online/offline status
      const updateOnlineStatus = () => {
        if (navigator.onLine) {
          document.body.classList.remove("offline");
          // Sync data when back online
          if (
            "serviceWorker" in navigator &&
            "sync" in window.ServiceWorkerRegistration.prototype
          ) {
            navigator.serviceWorker.ready.then((registration) => {
              return (registration as any).sync.register("analytics-sync");
            });
          }
        } else {
          document.body.classList.add("offline");
        }
      };

      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);
      updateOnlineStatus(); // Set initial status

      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
      };
    }
  }, []);

  return null;
}
