"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/context/language-context";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const { language } = useLanguage();

  if (items.length <= 1) return null;

  return (
    <nav
      className="bg-[#f8f7f4] border-b border-stone-200 py-3"
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <ol className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-slate-600">
          {items.map((item, index) => (
            <li key={index} className="flex items-center min-w-0">
              {index > 0 &&
                (language === "ar" ? (
                  <ChevronLeft className="h-4 w-4 text-stone-400 mx-1 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-stone-400 mx-1 flex-shrink-0" />
                ))}
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="text-slate-700 hover:text-slate-900 hover:underline underline-offset-2 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`truncate ${index === items.length - 1 ? "text-slate-900 font-medium" : ""}`}
                  aria-current={index === items.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
