"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
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
      className="bg-gray-50 border-b border-gray-200 py-3"
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <ol className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {" "}
              {index > 0 &&
                (language === "ar" ? (
                  <ChevronLeft className="h-4 w-4 text-gray-400 mx-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                ))}
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="text-red-600 hover:text-red-800 hover:underline font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${
                    index === items.length - 1
                      ? "text-gray-800 font-semibold"
                      : "text-gray-600"
                  }`}
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
