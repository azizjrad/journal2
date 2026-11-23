import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/context/language-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/user-auth";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const paymentLogos = [
  { src: "/credit-card.png", alt: "Card" },
  { src: "/apple-pay.png", alt: "Apple Pay" },
  { src: "/google-pay.png", alt: "Google Pay" },
  { src: "/paypal.png", alt: "PayPal" },
];

interface NewsletterSubscriptionOptionsProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

export function NewsletterSubscriptionOptions({
  selected,
  setSelected,
}: NewsletterSubscriptionOptionsProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="max-w-3xl mx-auto bg-white/80 rounded-md border border-stone-200 p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-2 text-slate-950">
        {t("choose_subscription", "Choose your subscription", "اختر اشتراكك")}
      </h2>
      <p className="text-center text-sm text-slate-600 mb-8 leading-relaxed">
        {t(
          "choose_plan_desc",
          "Select a plan to access premium briefings and subscriber updates.",
          "اختر خطة للوصول إلى الإحاطات المميزة وتحديثات المشتركين.",
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <button
          type="button"
          className={`relative text-start border rounded-md p-5 transition-colors ${
            selected === "annual"
              ? "border-[#7a3030] bg-[#f8f7f4]"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
          onClick={() => setSelected("annual")}
        >
          {selected === "annual" && (
            <span className="absolute -top-2.5 end-4 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] bg-slate-900 text-white rounded-sm font-semibold">
              {t("best_value", "Best value", "أفضل قيمة")}
            </span>
          )}
          <div className="flex items-center mb-2 mt-1">
            <span
              className={`w-4 h-4 me-2 rounded-full border ${
                selected === "annual" ? "border-[#7a3030] bg-[#7a3030]" : "border-stone-400 bg-white"
              }`}
              aria-hidden="true"
            />
            <span className="text-lg font-semibold text-slate-900">
              {t("annual_digital", "Annual Digital", "اشتراك رقمي سنوي")}
            </span>
          </div>
          <div className="text-2xl font-semibold text-[#7a3030] mb-1">
            <span className="line-through text-slate-400 text-base me-2">$4</span>
            {t("annual_price", "$2/month", "2 دولار/شهر")}
          </div>
          <div className="text-slate-700 mb-2 text-sm">
            {t("first_month_free", "First month free", "الشهر الأول مجانًا")}
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            {t(
              "annual_charge_desc",
              "Charged as $24 for the first year after your free trial, then renews automatically at $48/year.",
              "يتم احتساب 24$ للسنة الأولى بعد الفترة التجريبية المجانية، ثم يتجدد تلقائيًا مقابل 48$/سنة.",
            )}
          </div>
        </button>

        <button
          type="button"
          className={`text-start border rounded-md p-5 transition-colors ${
            selected === "monthly"
              ? "border-[#7a3030] bg-[#f8f7f4]"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
          onClick={() => setSelected("monthly")}
        >
          <div className="flex items-center mb-2">
            <span
              className={`w-4 h-4 me-2 rounded-full border ${
                selected === "monthly" ? "border-[#7a3030] bg-[#7a3030]" : "border-stone-400 bg-white"
              }`}
              aria-hidden="true"
            />
            <span className="text-lg font-semibold text-slate-900">
              {t("monthly_digital", "Monthly Digital", "اشتراك رقمي شهري")}
            </span>
          </div>
          <div className="text-2xl font-semibold text-[#7a3030] mb-1">
            {t("monthly_price", "$4/month", "4 دولارات/شهر")}
          </div>
          <div className="text-xs text-slate-600 mt-2 leading-relaxed">
            {t(
              "monthly_renew_desc",
              "Renews automatically at $4/month.",
              "يتجدد تلقائيًا مقابل 4$/شهر.",
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center gap-5 mb-8 flex-wrap">
        {paymentLogos.map((logo) => (
          <div key={logo.alt} className="relative h-7 w-14 opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-default">
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="56px"
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <Button
        className="w-full py-5 text-base font-medium bg-[#7a3030] hover:bg-[#632626] text-white rounded-md shadow-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isProcessing}
        onClick={() => {
          if (!isAuthenticated || !user) {
            sessionStorage.setItem("pendingNewsletterPlan", selected);
            router.push("/auth?redirect=/newsletter");
            return;
          }
          setIsProcessing(true);
          router.push(`/payment?plan=${selected}`);
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin me-2" />
            {t("processing", "Processing...", "جارٍ المعالجة...")}
          </>
        ) : (
          t("get_access", "Continue to subscription", "المتابعة إلى الاشتراك")
        )}
      </Button>
      <p className="text-xs text-slate-500 text-center mt-3">
        {t("cancel_anytime", "Cancel or pause anytime.", "يمكنك الإلغاء أو الإيقاف في أي وقت.")}
      </p>
    </div>
  );
}
