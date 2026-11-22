"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  User,
  LogIn,
  LogOut,
  Settings,
  Shield,
  Edit,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/lib/context/language-context";
import { useAuth } from "@/lib/context/user-auth";

export function ProfileButton() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowMenu(false);
    } catch (error) {
      console.error("Error logging out:", error);
      setShowMenu(false);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 px-3 md:px-4 h-9 border-stone-300 text-stone-400 rounded-md"
        disabled
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">...</span>
      </Button>
    );
  }

  if (isAuthenticated && user) {
    const displayName = user.first_name || user.username;

    return (
      <div className="relative" ref={menuRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 md:px-4 h-9 border-stone-300 text-slate-800 hover:bg-stone-100 hover:text-slate-900 transition-colors rounded-md"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline font-medium max-w-20 truncate">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-md shadow-lg z-50">
            <div className="py-2">
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-stone-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <User className="h-4 w-4" />
                {t("account", "Account", "الحساب")}
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-stone-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <Settings className="h-4 w-4" />
                {t(
                  "profileSettings",
                  "Profile Settings",
                  "إعدادات الملف الشخصي"
                )}
              </Link>

              {(user.role === "admin" || user.role === "writer") && (
                <>
                  <hr className="my-1 border-stone-200" />
                  <Link
                    href={user.role === "admin" ? "/admin" : "/writer"}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-stone-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    {user.role === "admin" ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                    {user.role === "admin"
                      ? t(
                          "adminDashboard",
                          "Admin Dashboard",
                          "لوحة تحكم المدير"
                        )
                      : t(
                          "writerDashboard",
                          "Writer Dashboard",
                          "لوحة تحكم الكاتب"
                        )}
                  </Link>
                </>
              )}

              <hr className="my-1 border-stone-200" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-4 py-2 w-full text-left text-slate-700 hover:bg-stone-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("logout", "Logout", "تسجيل الخروج")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href="/auth">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 px-3 md:px-4 h-9 border-stone-300 text-slate-800 hover:bg-stone-100 hover:text-slate-900 transition-colors rounded-md"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">
          {t("login", "Login", "تسجيل الدخول")}
        </span>
      </Button>
    </Link>
  );
}
