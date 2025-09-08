"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/date-formatter";
import { Calendar, Clock } from "lucide-react";

interface DateTimeDisplayProps {
  isMobile?: boolean;
}

export function DateTimeDisplay({ isMobile = false }: DateTimeDisplayProps) {
  const { language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = formatDate(language);

  if (isMobile) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{formattedDate}</span>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
      <Calendar className="h-4 w-4" />
      <span className="font-medium">{formattedDate}</span>
    </div>
  );
}
