import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/user-auth";
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
  const { language, t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mt-12">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
        {t("choose_subscription", "Choose Your Subscription", "اختر اشتراكك")}
      </h2>
      <p className="text-center text-sm text-gray-500 mb-8 font-light">
        {t(
          "choose_plan_desc",
          "Choose your plan and get exclusive access to premium content.",
          "اختر خطتك واحصل على وصول حصري للمحتوى المميز."
        )}
      </p>
      <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">
        {/* Annual Digital Card */}
        <div
          className={`relative flex-1 border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
            selected === "annual"
              ? "border-red-500 bg-red-50 shadow-md"
              : "border-gray-200 bg-white hover:border-red-300"
          }`}
          onClick={() => setSelected("annual")}
        >
          {/* BEST VALUE badge positioned on border */}
          {selected === "annual" && (
            <span className="absolute -top-3 right-4 px-2 py-0.5 text-[10px] bg-black text-white rounded-full font-bold shadow z-10">
              BEST VALUE
            </span>
          )}
          <div className="flex items-center mb-2 mt-2">
            <input
              type="radio"
              checked={selected === "annual"}
              onChange={() => setSelected("annual")}
              className="w-5 h-5 mr-2 appearance-none rounded-full border-2 border-red-400 bg-white checked:bg-red-600 checked:border-red-600 outline-none ring-0 focus:outline-none focus:ring-0 transition-colors duration-200"
              style={{
                boxShadow:
                  selected === "annual"
                    ? "0 0 0 2px #fff, 0 0 0 4px #ef4444"
                    : undefined,
              }}
            />
            <span className="text-lg font-semibold text-gray-900">
              {t("annual_digital", "Annual Digital", "الاشتراك السنوي")}
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700 mb-1">
            <span className="line-through text-gray-400 text-lg mr-2">$4</span>
            {t("annual_price", "$2/month", "$2/شهر")}
          </div>
          <div className="text-gray-700 mb-2">
            {t("first_month_free", "First month FREE", "الشهر الأول مجانًا")}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {t(
              "tote_included",
              "Includes a limited-edition tote",
              "يشمل حقيبة حصرية"
            )}
          </div>
          <div className="text-xs text-gray-500">
            {t(
              "annual_charge_desc",
              "Charged as $24 for one year after your free trial. Renews automatically for $48/year.",
              "يتم احتساب $24 لسنة واحدة بعد الفترة التجريبية المجانية. يتجدد تلقائيًا مقابل $48/سنة."
            )}
          </div>
        </div>
        <div
          className={`flex-1 border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
            selected === "monthly"
              ? "border-red-500 bg-red-50 shadow-md"
              : "border-gray-200 bg-white hover:border-red-300"
          }`}
          onClick={() => setSelected("monthly")}
        >
          <div className="flex items-center mb-2">
            <input
              type="radio"
              checked={selected === "monthly"}
              onChange={() => setSelected("monthly")}
              className="w-5 h-5 mr-2 appearance-none rounded-full border-2 border-red-400 bg-white checked:bg-red-600 checked:border-red-600 outline-none ring-0 focus:outline-none focus:ring-0 transition-colors duration-200"
              style={{
                boxShadow:
                  selected === "monthly"
                    ? "0 0 0 2px #fff, 0 0 0 4px #ef4444"
                    : undefined,
              }}
            />
            <span className="text-lg font-semibold text-gray-900">
              {t("monthly_digital", "Monthly Digital", "الاشتراك الشهري")}
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700 mb-1">
            {t("monthly_price", "$4/month", "$4/شهر")}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {t(
              "monthly_renew_desc",
              "Renews automatically for $4/month.",
              "يتجدد تلقائيًا مقابل $4/شهر."
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 mb-8">
        {paymentLogos.map((logo) => (
          <div key={logo.alt} className="relative h-8 w-16">
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="64px"
              className="object-contain opacity-80 hover:opacity-100 transition"
            />
          </div>
        ))}
      </div>
      <Button
        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isProcessing}
        onClick={() => {
          // Check if user is logged in
          if (!isAuthenticated || !user) {
            // Save selected plan to sessionStorage so we can return after login
            sessionStorage.setItem("pendingNewsletterPlan", selected);
            // Redirect to auth page
            router.push("/auth?redirect=/newsletter");
            return;
          }

          // Redirect to custom payment page with selected plan
          router.push(`/payment?plan=${selected}`);
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t("processing", "Processing...", "جاري المعالجة...")}
          </>
        ) : (
          t("get_access", "Get Digital Access", "احصل على الوصول الرقمي")
        )}
      </Button>
      <p className="text-xs text-gray-500 text-center mt-2 font-light">
        {t(
          "cancel_anytime",
          "Cancel or pause anytime.",
          "يمكنك الإلغاء أو الإيقاف في أي وقت."
        )}
      </p>
    </div>
  );
}
