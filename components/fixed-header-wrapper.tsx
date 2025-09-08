"use client";

import { useState, useEffect } from "react";
import Header from "./header";
import { BreakingNewsTicker } from "./breaking-news-ticker";
import { CategoryInterface, ArticleInterface } from "@/lib/db";

interface FixedHeaderWrapperProps {
  categories: CategoryInterface[];
  articles?: ArticleInterface[];
}

export function FixedHeaderWrapper({
  categories,
  articles,
}: FixedHeaderWrapperProps) {
  const [isTickerVisible, setIsTickerVisible] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isTickerDismissed, setIsTickerDismissed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle manual dismissal of the ticker
  const handleTickerClose = () => {
    setIsTickerDismissed(true);
    setIsTickerVisible(false);
  };

  // Check localStorage on mount to see if ticker was previously dismissed
  // Always show ticker on page load (do not persist dismissal)
  useEffect(() => {
    setIsTickerDismissed(false);
    setIsTickerVisible(true);
  }, []);

  // Handle scroll visibility - both header and ticker together
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Don't hide if mobile menu is open
      if (isMobileMenuOpen) {
        return;
      }

      // Show both when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsHeaderVisible(true);
        if (!isTickerDismissed) {
          setIsTickerVisible(true);
        }
      }
      // Hide both when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
        if (!isTickerDismissed) {
          setIsTickerVisible(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [lastScrollY, isMobileMenuOpen, isTickerDismissed]);

  // Ensure both are visible when mobile menu opens (except dismissed ticker)
  useEffect(() => {
    if (isMobileMenuOpen) {
      if (!isTickerDismissed) {
        setIsTickerVisible(true);
      }
      setIsHeaderVisible(true);
    }
  }, [isMobileMenuOpen, isTickerDismissed]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Combined Header and Breaking News */}
      <div
        className={`transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Main navbar */}
        <Header
          categories={categories}
          onMobileMenuChange={setIsMobileMenuOpen}
        />

        {/* Featured Articles Ticker - only show if not dismissed */}
        {!isTickerDismissed && isTickerVisible && (
          <BreakingNewsTicker
            articles={articles}
            isVisible={true}
            onClose={handleTickerClose}
          />
        )}
      </div>
    </div>
  );
}
