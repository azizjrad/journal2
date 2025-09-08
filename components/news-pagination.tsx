"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalArticles: number;
}

export function NewsPagination({
  currentPage,
  totalPages,
  totalArticles,
}: NewsPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show

    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination logic
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= Math.min(showPages - 1, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > showPages - 1) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        if (totalPages > showPages - 1) {
          pages.push("...");
        }
        for (
          let i = Math.max(totalPages - (showPages - 2), 2);
          i <= totalPages;
          i++
        ) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {" "}
        {/* Previous Button */}{" "}
        {currentPage === 1 ? (
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center ${
              language === "ar" ? "space-x-reverse" : ""
            } space-x-2 opacity-50 cursor-not-allowed`}
            disabled
          >
            {language === "ar" ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span>{t("previous", "Previous", "السابق")}</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-50 hover:border-red-200"
            asChild
          >
            <Link
              href={createPageURL(currentPage - 1)}
              className={`flex items-center ${
                language === "ar" ? "space-x-reverse" : ""
              } space-x-2`}
            >
              {language === "ar" ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span>{t("previous", "Previous", "السابق")}</span>
            </Link>
          </Button>
        )}
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;
            return isCurrentPage ? (
              <Button
                key={pageNumber}
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                <span>{pageNumber}</span>
              </Button>
            ) : (
              <Button
                key={pageNumber}
                variant="outline"
                size="sm"
                className="hover:bg-red-50 hover:border-red-200"
                asChild
              >
                <Link href={createPageURL(pageNumber)}>{pageNumber}</Link>
              </Button>
            );
          })}
        </div>{" "}
        {/* Next Button */}{" "}
        {currentPage === totalPages ? (
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center ${
              language === "ar" ? "space-x-reverse" : ""
            } space-x-2 opacity-50 cursor-not-allowed`}
            disabled
          >
            <span>{t("next", "Next", "التالي")}</span>
            {language === "ar" ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-50 hover:border-red-200"
            asChild
          >
            <Link
              href={createPageURL(currentPage + 1)}
              className={`flex items-center ${
                language === "ar" ? "space-x-reverse" : ""
              } space-x-2`}
            >
              <span>{t("next", "Next", "التالي")}</span>
              {language === "ar" ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          </Button>
        )}
      </div>

      {/* Quick Jump (for mobile) */}
      <div className="md:hidden text-center">
        <div className="text-xs text-gray-500 mb-2">
          {t("quick_jump", "Quick Jump", "الانتقال السريع")}
        </div>
        <div className="flex items-center justify-center space-x-2">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={createPageURL(1)}>
                {t("first", "First", "الأول")}
              </Link>
            </Button>
          )}
          {currentPage < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={createPageURL(totalPages)}>
                {t("last", "Last", "الأخير")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
