import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/lib/context/language-context";

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
      } else if (visible) {
        setAnimating(false);
        timeoutRef.current = setTimeout(() => setVisible(false), 500);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [visible, sessionHidden]);

  if (!visible && !animating) return null;
  if (sessionHidden && !animating) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 transition-all duration-500 ${
        !animating && !visible ? "pointer-events-none" : ""
      }`}
    >
      <div
        className={`bg-white/95 backdrop-blur-sm border border-stone-200 shadow-lg rounded-md flex items-center justify-between gap-4 px-5 py-4 relative transition-all duration-500 ${
          visible && animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionProperty: "opacity, transform" }}
      >
        <button
          onClick={() => {
            setAnimating(false);
            setTimeout(() => {
              setSessionHidden(true);
              setVisible(false);
            }, 500);
          }}
          className="absolute top-2 end-2 text-slate-400 hover:text-slate-700 text-lg leading-none"
          aria-label={t("close", "Close", "إغلاق")}
        >
          ×
        </button>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 mb-1">
            {t("selected_plan", "Selected plan", "الخطة المختارة")}
          </div>
          <div className="text-base font-semibold text-slate-900">
            {selectedPlan === "annual"
              ? t("annual_digital", "Annual Digital", "الاشتراك السنوي الرقمي")
              : t("monthly_digital", "Monthly Digital", "الاشتراك الشهري الرقمي")}
          </div>
          <div className="text-sm font-medium text-[#7a3030] mt-1">
            {selectedPlan === "annual" ? (
              <>
                <span className="line-through text-slate-400 text-sm me-2">$4</span>
                {t("annual_price", "$2/month", "2 دولار/شهريًا")}
              </>
            ) : (
              <>{t("monthly_price", "$4/month", "4 دولارات/شهريًا")}</>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {selectedPlan === "annual"
              ? t("first_month_free", "First month free", "الشهر الأول مجانًا")
              : t("cancel_anytime", "Cancel anytime", "يمكنك الإلغاء في أي وقت")}
          </div>
        </div>
        <button
          className="shrink-0 px-4 py-2 bg-[#7a3030] hover:bg-[#632626] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={async () => {
            try {
              const billing = selectedPlan === "annual" ? "annual" : "monthly";
              const response = await fetch("/api/newsletter/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ billing }),
              });
              const data = await response.json();
              if (data.success && data.url) {
                window.location.href = data.url;
              } else {
                alert(data.message || "Failed to create checkout session");
              }
            } catch (error) {
              console.error("Checkout error:", error);
              alert("An error occurred. Please try again.");
            }
          }}
        >
          {t("get_access", "Continue", "متابعة")}
        </button>
      </div>
    </div>
  );
}