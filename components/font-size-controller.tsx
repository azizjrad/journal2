"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export function FontSizeController() {
  const { t } = useLanguage();
  const [fontSize, setFontSize] = useState("normal");

  useEffect(() => {
    // Load saved font size preference
    const savedFontSize = localStorage.getItem("fontSize") || "normal";
    setFontSize(savedFontSize);
    document.documentElement.setAttribute("data-font-size", savedFontSize);
  }, []);

  const changeFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
    document.documentElement.setAttribute("data-font-size", size);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <span className="text-sm font-medium text-gray-600 px-2">
        {t("font_size", "Font Size", "حجم الخط")}
      </span>
      <Button
        variant={fontSize === "small" ? "default" : "ghost"}
        size="sm"
        onClick={() => changeFontSize("small")}
        className="text-xs px-2 py-1 hover:text-black"
        title={t("small_font", "Small Font", "خط صغير")}
      >
        A-
      </Button>
      <Button
        variant={fontSize === "normal" ? "default" : "ghost"}
        size="sm"
        onClick={() => changeFontSize("normal")}
        className="text-sm px-2 py-1 hover:text-black"
        title={t("normal_font", "Normal Font", "خط عادي")}
      >
        A
      </Button>
      <Button
        variant={fontSize === "large" ? "default" : "ghost"}
        size="sm"
        onClick={() => changeFontSize("large")}
        className="text-base px-2 py-1 hover:text-black"
        title={t("large_font", "Large Font", "خط كبير")}
      >
        A+
      </Button>
    </div>
  );
}
