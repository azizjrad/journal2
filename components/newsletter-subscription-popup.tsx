import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/lib/language-context";

interface NewsletterSubscriptionPopupProps {
  selectedPlan: string;
}

export function NewsletterSubscriptionPopup({
  selectedPlan,
}: NewsletterSubscriptionPopupProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [sessionHidden, setSessionHidden] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setSessionHidden(false);
      }
      if (window.scrollY > 100 && !sessionHidden) {
        setVisible(true);
        setAnimating(true);
      } else {
        if (visible) {
          setAnimating(false);
          timeoutRef.current = setTimeout(() => setVisible(false), 500);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, [visible, sessionHidden]);

  // Only unmount after animation completes
  if (!visible && !animating) return null;
  if (sessionHidden && !animating) return null;
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 transition-all duration-500 ${
        !animating && !visible ? "pointer-events-none" : ""
      }`}
    >
      <div
        className={`bg-white/60 backdrop-blur-md border border-gray-300 shadow-xl rounded-2xl flex items-center justify-between px-6 py-4 relative transition-all duration-500
            ${
              visible && animating
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
        style={{ transitionProperty: "opacity, transform" }}
      >
        {/* No need for setHidden, handled by sessionHidden */}
        {/* X button */}
        <button
          onClick={() => {
            setAnimating(false);
            setTimeout(() => {
              setSessionHidden(true);
              setVisible(false);
            }, 500);
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold rounded-full focus:outline-none focus:ring-0"
          aria-label="Close popup"
        >
          &times;
        </button>
        <div>
          <div className="text-sm text-gray-500 mb-1">
            {t("selected_plan", "Selected Plan:", "الخطة المختارة:")}
          </div>
          <div className="text-lg font-bold text-gray-900 capitalize">
            {selectedPlan === "annual"
              ? t("annual_digital", "Annual Digital", "الاشتراك السنوي")
              : t("monthly_digital", "Monthly Digital", "الاشتراك الشهري")}
          </div>
          <div className="text-base font-semibold text-red-700 mt-1">
            {selectedPlan === "annual" ? (
              <>
                <span className="line-through text-gray-400 text-base mr-2">
                  $4
                </span>
                $2/month
              </>
            ) : (
              <>$4/month</>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t("first_month_free", "First month FREE", "الشهر الأول مجانًا")}
          </div>
        </div>
        <button className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
          {t("get_access", "Get Digital Access", "احصل على الوصول الرقمي")}
        </button>
      </div>
    </div>
  );
}
