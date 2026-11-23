"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/context/language-context";

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
    { value: "relevance", label: t("sort_relevance", "Relevance", "الأكثر صلة"), icon: TrendingUp },
    { value: "date_desc", label: t("sort_newest", "Newest first", "الأحدث أولاً"), icon: ArrowDown },
    { value: "date_asc", label: t("sort_oldest", "Oldest first", "الأقدم أولاً"), icon: ArrowUp },
  ];

  const currentOption = options.find((option) => option.value === currentSort) || options[0];

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3" dir={language === "ar" ? "rtl" : "ltr"}>
      <span className="text-sm text-slate-600">{t("sort_by", "Sort by", "ترتيب حسب")}</span>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border border-stone-300 rounded-md px-3 py-2 pe-9 text-sm text-slate-700 hover:border-stone-400 transition-colors flex items-center gap-2 min-w-[170px] justify-between"
        >
          <span className="flex items-center gap-2">
            <currentOption.icon className="w-4 h-4 text-slate-500" />
            {currentOption.label}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute top-full start-0 end-0 bg-white border border-stone-200 rounded-md shadow-lg mt-1 z-50 overflow-hidden">
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-start px-3 py-2.5 text-sm transition-colors hover:bg-stone-50 flex items-center gap-2 ${
                    option.value === currentSort ? "bg-stone-50 text-slate-900" : "text-slate-700"
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