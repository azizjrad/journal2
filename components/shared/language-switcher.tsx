"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/context/language-context";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 bg-stone-100 rounded-md p-1 border border-stone-200">
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-0 ${
          language === "en"
            ? "bg-white text-slate-900 shadow-sm border border-stone-200 hover:bg-white"
            : "text-slate-600 hover:text-slate-900 hover:bg-transparent bg-transparent"
        }`}
      >
        EN
      </Button>
      <Button
        variant={language === "ar" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ar")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-0 ${
          language === "ar"
            ? "bg-white text-slate-900 shadow-sm border border-stone-200 hover:bg-white"
            : "text-slate-600 hover:text-slate-900 hover:bg-transparent bg-transparent"
        }`}
      >
        عربي
      </Button>
    </div>
  );
}
