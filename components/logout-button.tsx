"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/user-auth";

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Use Next.js router to reload the current route for a smooth UI update
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: redirect to auth page
      window.location.href = "/auth";
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="text-white border-red-400/30 bg-red-600/20 backdrop-blur-sm hover:bg-red-600/30 hover:border-red-400/50 hover:text-white transition-all duration-200"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}
