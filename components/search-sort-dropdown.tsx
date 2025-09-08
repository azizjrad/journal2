"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Calendar,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface SearchSortDropdownProps {
  currentSort: string;
}

export function SearchSortDropdown({ currentSort }: SearchSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  const options = [
    {
      value: "relevance",
      label: t("sort_relevance", "Relevance", "الصلة"),
      icon: TrendingUp,
    },
    {
      value: "date_desc",
      label: t("sort_newest", "Newest First", "الأحدث أولاً"),
      icon: ArrowDown,
    },
    {
      value: "date_asc",
      label: t("sort_oldest", "Oldest First", "الأقدم أولاً"),
      icon: ArrowUp,
    },
  ];

  const currentOption =
    options.find((option) => option.value === currentSort) ||
    options.find((option) => option.value === "relevance") ||
    options[0];

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSort === "relevance") {
      params.set("sortBy", "relevance");
      params.delete("sortOrder");
    } else if (newSort === "date_desc") {
      params.set("sortBy", "date");
      params.set("sortOrder", "desc");
    } else if (newSort === "date_asc") {
      params.set("sortBy", "date");
      params.set("sortOrder", "asc");
    }

    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex items-center gap-4 ml-auto"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <span className="text-sm font-medium text-gray-700">
        {t("sort_by", "Sort by", "ترتيب حسب")}
      </span>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="appearance-none bg-white border border-gray-400 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-500 focus:outline-none focus:border-red-500 transition-colors cursor-pointer flex items-center gap-2 min-w-[160px] justify-between"
        >
          <span className="flex items-center gap-2">
            <currentOption.icon className="w-4 h-4" />
            {currentOption.label}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-400 rounded-lg shadow-xl mt-1 z-50 overflow-hidden">
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-700 border-b border-gray-100 last:border-b-0 flex items-center gap-2 ${
                    option.value === currentSort
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700"
                  }`}
                >
                  <OptionIcon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
