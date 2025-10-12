"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/user-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PaymentPage() {
  // Validation states
  const [emailError, setEmailError] = useState("");
  const [promoError, setPromoError] = useState("");
  const [marketingError, setMarketingError] = useState("");
  // Error modal state
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    redirectTo?: string;
  }>({ open: false, title: "", message: "" });
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const plan = (searchParams.get("plan") as "annual" | "monthly") || "annual";
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);

  // Auto-fill email from logged-in user
  useEffect(() => {
    if (isAuthenticated && user?.email && !email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user, email]);
  // Stepper state
  const [step, setStep] = useState(1);
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [cardExpanded, setCardExpanded] = useState(false);
  // PayPal email state
  const [paypalEmail, setPaypalEmail] = useState("");
  // Card form state
  const [cardFields, setCardFields] = useState({
    number: "",
    expiry: "",
    cvc: "",
    firstName: "",
    lastName: "",
    country: "Libya",
    address: "",
    address2: "",
    postal: "",
    city: "",
  });
  const [cardErrors, setCardErrors] = useState({
    number: "",
    expiry: "",
    cvc: "",
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    postal: "",
    city: "",
  });
  const [cardTouched, setCardTouched] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [legalAgree, setLegalAgree] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await fetch("/api/auth/csrf-token", { credentials: "include" });
        // Token is now in cookie, extract it for headers
        const cookies = document.cookie.split(";");
        const csrfCookie = cookies.find((c) =>
          c.trim().startsWith("csrf-token=")
        );
        if (csrfCookie) {
          const token = csrfCookie.split("=")[1];
          setCsrfToken(token);
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  function validateCardForm() {
    const errors = {
      number: cardFields.number
        ? ""
        : t(
            "card_number_incomplete",
            "Your card number is incomplete.",
            "رقم البطاقة غير مكتمل."
          ),
      expiry: cardFields.expiry
        ? ""
        : t(
            "card_expiry_incomplete",
            "Your card's expiration date is incomplete.",
            "تاريخ انتهاء البطاقة غير مكتمل."
          ),
      cvc: cardFields.cvc
        ? ""
        : t(
            "card_cvc_incomplete",
            "Your card's security code is incomplete.",
            "رمز أمان البطاقة غير مكتمل."
          ),
      firstName: cardFields.firstName
        ? ""
        : t(
            "first_name_required",
            "Please provide your first name.",
            "يرجى إدخال الاسم الأول."
          ),
      lastName: cardFields.lastName
        ? ""
        : t(
            "last_name_required",
            "Please provide your last name.",
            "يرجى إدخال اسم العائلة."
          ),
      address: cardFields.address
        ? ""
        : t(
            "address_required",
            "This field is incomplete.",
            "هذا الحقل غير مكتمل."
          ),
      address2: "",
      postal: !cardFields.postal
        ? t(
            "postal_required",
            "This field is incomplete.",
            "هذا الحقل غير مكتمل."
          )
        : "",
      city: !cardFields.city
        ? t(
            "city_required",
            "This field is incomplete.",
            "هذا الحقل غير مكتمل."
          )
        : "",
    };
    setCardErrors(errors);
    // If all error fields are empty, the form is valid
    return Object.values(errors).every((v) => v === "");
  }
  // Checkbox states
  const [promoChecked, setPromoChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);
  const isContinueEnabled =
    email.trim() !== "" && promoChecked && marketingChecked;

  function validate() {
    let valid = true;
    const emailValue = email.trim();
    if (!emailValue) {
      setEmailError("Enter an email address");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      setEmailError("Add a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
    // No checkbox validation
    setPromoError("");
    setMarketingError("");
    return valid;
  }
  const planDetails = {
    annual: {
      title: t(
        "annual_digital",
        "Annual Digital Access (auto-renews)",
        "الاشتراك السنوي الرقمي (يتجدد تلقائيًا)"
      ),
      price: "$0",
      oldPrice: "$4",
      desc: t(
        "annual_charge_desc",
        "Charged as $24 after your free trial. Renews automatically for $48/year.",
        "يتم احتساب $24 لسنة واحدة بعد الفترة التجريبية المجانية. يتجدد تلقائيًا مقابل $48/سنة."
      ),
    },
    monthly: {
      title: t(
        "monthly_digital",
        "Monthly Digital Access (auto-renews)",
        "الاشتراك الشهري الرقمي (يتجدد تلقائيًا)"
      ),
      price: "$4",
      oldPrice: "",
      desc: t(
        "monthly_renew_desc",
        "Renews automatically for $4/month.",
        "يتجدد تلقائيًا مقابل $4/شهر."
      ),
    },
  };

  function renderStep3() {
    return (
      <div className="w-full flex flex-col md:flex-row gap-8 min-h-[500px]">
        {/* Review Card (left) */}
        <div className="flex-1 min-w-[340px] max-w-2xl bg-white rounded-xl p-8 flex flex-col gap-4 shadow border border-gray-100 order-1 md:order-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-0">
            {t("review", "Review", "مراجعة")}
          </h2>
          <div className="text-gray-500 text-sm mb-1 flex items-center gap-2">
            <Image
              src="/padlock-check.png"
              alt="Padlock check"
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
              priority
            />
            {t(
              "secure_encrypted",
              "All transactions are secure and encrypted.",
              "جميع المعاملات آمنة ومشفرة."
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 mt-0">
            <div className="text-xs text-gray-500 mb-1">
              {t("subscription_plan", "Subscription Plan", "خطة الاشتراك")}
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              {planDetails[plan].title}{" "}
              {t("auto_renews", "(auto-renews)", "(تجدد تلقائي)")}
            </div>
            <div className="flex items-center gap-2 mb-1">
              {planDetails[plan].oldPrice && (
                <span className="text-gray-400 line-through text-base">
                  {planDetails[plan].oldPrice}
                </span>
              )}
              <span className="text-lg font-bold text-gray-900">
                {planDetails[plan].price}
              </span>
            </div>
            <div className="italic text-gray-600 text-sm mb-2">
              {planDetails[plan].desc}
            </div>
            <hr className="my-3 border-dashed border-gray-200" />
            <div className="flex justify-between items-center text-base font-semibold mb-1">
              <span>{t("due_now", "Due now", "المستحق الآن")}</span>
              <span className="text-gray-900">{planDetails[plan].price}</span>
            </div>
            <hr className="my-3 border-dashed border-gray-200" />
            <div className="text-xs text-gray-500 mb-1">
              {t("payment_method", "Payment Method", "طريقة الدفع")}
            </div>
            <div className="flex items-center gap-2 text-base font-medium text-gray-900 mb-2">
              {paymentMethod === "paypal" && (
                <>
                  <span>PayPal</span>
                  <Image
                    src="/paypal2.png"
                    alt="PayPal"
                    width={22}
                    height={22}
                  />
                </>
              )}
              {paymentMethod === "card" && (
                <>
                  <span>{t("credit_card", "Credit Card", "بطاقة مصرفية")}</span>
                  <Image
                    src="/card-icon.png"
                    alt="Card"
                    width={22}
                    height={22}
                  />
                </>
              )}
            </div>
            <hr className="my-3 border-dashed border-gray-200" />
            <div className="text-xs text-gray-500 mb-1">
              {t(
                "subscription_account",
                "Subscription account",
                "حساب الاشتراك"
              )}
            </div>
            <div className="text-base text-gray-900">{email}</div>
          </div>
        </div>
        {/* Legal and payment (right) */}
        <div className="flex flex-col gap-3 flex-1 min-w-[340px] max-w-xl justify-start">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm text-gray-900">
            <span className="font-semibold text-gray-800">
              {t(
                "auto_renewal_title",
                "Automatic renewal and cancellation",
                "التجديد التلقائي والإلغاء"
              )}
            </span>
            <br />
            {t(
              "auto_renewal_desc",
              "After your free trial, your subscription will continue and you will be charged the annual rate unless you cancel. To cancel before your free trial ends, or for future renewals, manage your subscription online or contact support. Payments are non-refundable unless you cancel within 14 days of the charge.",
              "بعد انتهاء الفترة التجريبية، سيستمر اشتراكك وسيتم تحصيل الرسوم السنوية ما لم تقم بالإلغاء. لإلغاء الاشتراك قبل انتهاء الفترة التجريبية أو للتجديدات المستقبلية، قم بإدارة اشتراكك عبر الإنترنت أو اتصل بالدعم. المدفوعات غير قابلة للاسترداد إلا إذا ألغيت خلال 14 يومًا من التحصيل."
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative inline-flex items-center w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] flex-shrink-0">
              <input
                type="checkbox"
                className="peer appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-400 transition-colors duration-200 align-middle"
                style={{ display: "inline-block", verticalAlign: "middle" }}
                id="legalAgree"
                checked={legalAgree}
                onChange={(e) => setLegalAgree(e.target.checked)}
              />
              {/* Custom checkmark SVG */}
              <svg
                className="pointer-events-none absolute left-0 top-0 w-5 h-5 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                viewBox="0 0 20 20"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="5 11 9 15 15 7" />
              </svg>
            </span>
            <label
              htmlFor="legalAgree"
              className="text-xs text-gray-700 align-middle flex items-center h-5"
            >
              {t(
                "agree_terms",
                "I agree to the Automatic Renewal and Cancellation terms above",
                "أوافق على شروط التجديد التلقائي والإلغاء أعلاه"
              )}
            </label>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t(
              "by_subscribing",
              "By subscribing, I also agree to the",
              "بالاشتراك، أوافق أيضًا على "
            )}
            <a
              href="/user-agreement"
              className="underline text-gray-700 hover:text-red-700 mx-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("user_agreement", "user agreement", "اتفاقية المستخدم")}
            </a>
            {t("and", "and", "و")}
            <a
              href="/privacy"
              className="underline text-gray-700 hover:text-red-700 mx-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("privacy_policy", "privacy policy", "سياسة الخصوصية")}
            </a>
          </div>
          <Button
            className="w-full py-3 text-lg font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!legalAgree || isProcessing}
            onClick={async () => {
              if (!legalAgree) {
                setErrorModal({
                  open: true,
                  title: t("required", "Required", "مطلوب"),
                  message: t(
                    "agree_terms_required",
                    "Please agree to the terms and conditions before proceeding.",
                    "يرجى الموافقة على الشروط والأحكام قبل المتابعة."
                  ),
                });
                return;
              }

              setIsProcessing(true);

              try {
                // Create Stripe checkout session
                const response = await fetch(
                  "/api/newsletter/create-checkout-session",
                  {
                    method: "POST",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      "x-csrf-token": csrfToken,
                    },
                    body: JSON.stringify({
                      billing: plan,
                      email: email,
                      paymentMethod: paymentMethod,
                    }),
                  }
                );

                const data = await response.json();

                if (data.success && data.url) {
                  // Redirect to Stripe Checkout
                  window.location.href = data.url;
                } else {
                  setIsProcessing(false);

                  // If already subscribed, show modal and redirect to settings
                  if (data.code === "ALREADY_SUBSCRIBED") {
                    setErrorModal({
                      open: true,
                      title: t(
                        "subscription_exists",
                        "Subscription Already Active",
                        "الاشتراك نشط بالفعل"
                      ),
                      message: data.message,
                      redirectTo: "/settings?tab=subscription",
                    });
                  } else {
                    setErrorModal({
                      open: true,
                      title: t("error", "Error", "خطأ"),
                      message:
                        data.message ||
                        t(
                          "checkout_failed",
                          "Failed to create checkout session. Please try again.",
                          "فشل إنشاء جلسة الدفع. يرجى المحاولة مرة أخرى."
                        ),
                    });
                  }
                }
              } catch (error) {
                console.error("Checkout error:", error);
                setIsProcessing(false);
                setErrorModal({
                  open: true,
                  title: t("error", "Error", "خطأ"),
                  message: t(
                    "error_occurred",
                    "An error occurred. Please try again.",
                    "حدث خطأ. يرجى المحاولة مرة أخرى."
                  ),
                });
              }
            }}
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("processing", "Processing...", "جاري المعالجة...")}
              </>
            ) : paymentMethod === "paypal" ? (
              t("pay_with_paypal", "Pay with PayPal", "ادفع عبر PayPal")
            ) : (
              t("pay_now", "Pay Now", "ادفع الآن")
            )}
          </Button>
          <div className="text-xs text-gray-500 text-center mt-1">
            {t(
              "cancel_anytime",
              "Cancel or pause anytime.",
              "يمكنك الإلغاء أو الإيقاف المؤقت في أي وقت."
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-0 px-2">
      {/* Logo */}
      <div className="w-full flex justify-center pt-8 pb-6">
        <a href="/" className="block">
          <div className="text-3xl sm:text-4xl font-black text-red-700 tracking-tight hover:text-red-800 transition-colors duration-300 text-center">
            Akhbarna
          </div>
        </a>
      </div>
      {/* Stepper */}
      <div
        className="relative w-full max-w-xs sm:max-w-3xl md:max-w-4xl lg:max-w-6xl px-0 sm:px-2 md:px-6 flex items-center justify-between pb-2 sm:pb-4 mx-auto overflow-x-auto z-10"
        style={{ minHeight: "36px" }}
      >
        <div className="w-full flex items-center justify-between min-w-[120px] sm:min-w-[300px]">
          {/* Step 1: Add account (left aligned) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              disabled={step <= 1}
              onClick={() => step > 1 && setStep(1)}
              className="focus:outline-none"
              tabIndex={step > 1 ? 0 : -1}
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-base sm:text-lg border-2 sm:border-4 ${
                  step > 1
                    ? "bg-green-500 border-green-200 text-white cursor-pointer hover:opacity-80"
                    : step === 1
                    ? "bg-red-600 border-red-200 text-white"
                    : "bg-gray-200 border-gray-100 text-gray-500"
                }`}
              >
                {step > 1 ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  1
                )}
              </div>
            </button>
            <span
              className={`hidden sm:inline text-xs mt-2 font-semibold ${
                step > 1
                  ? "text-green-700"
                  : step === 1
                  ? "text-gray-700"
                  : "text-gray-400"
              }`}
            >
              {t("add_account", "Add account", "أضف حساب")}
            </span>
          </div>
          {/* Stepper line 1 */}
          <div
            className={`h-0.5 flex-1 mx-1 sm:mx-2 mt-3 sm:mt-4 ${
              step > 1 ? "bg-green-400" : "bg-gray-300"
            }`}
          />
          {/* Step 2: Add details (center) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              disabled={step <= 2}
              onClick={() => step > 2 && setStep(2)}
              className="focus:outline-none"
              tabIndex={step > 2 ? 0 : -1}
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-base sm:text-lg border-2 sm:border-4 ${
                  step > 2
                    ? "bg-green-500 border-green-200 text-white cursor-pointer hover:opacity-80"
                    : step === 2
                    ? "bg-red-600 border-red-200 text-white"
                    : "bg-gray-200 border-gray-100 text-gray-500"
                }`}
              >
                {step > 2 ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  2
                )}
              </div>
            </button>
            <span
              className={`hidden sm:inline text-xs mt-2 font-semibold ${
                step === 2 ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {t("add_details", "Add details", "أضف التفاصيل")}
            </span>
          </div>
          {/* Stepper line 2 */}
          <div
            className={`h-0.5 flex-1 mx-1 sm:mx-2 mt-3 sm:mt-4 ${
              step > 2 ? "bg-green-400" : "bg-gray-300"
            }`}
          />
          {/* Step 3: Review (right aligned) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              disabled={step <= 3}
              onClick={() => step > 3 && setStep(3)}
              className="focus:outline-none"
              tabIndex={step > 3 ? 0 : -1}
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-base sm:text-lg border-2 sm:border-4 ${
                  step > 3
                    ? "bg-green-500 border-green-200 text-white cursor-pointer hover:opacity-80"
                    : step === 3
                    ? "bg-red-600 border-red-200 text-white"
                    : "bg-gray-200 border-gray-100 text-gray-500"
                }`}
              >
                {step > 3 ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  3
                )}
              </div>
            </button>
            <span
              className={`hidden sm:inline text-xs mt-2 font-semibold ${
                step === 3 ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {t("review", "Review", "مراجعة")}
            </span>
          </div>
        </div>
      </div>
      {/* Main Card */}
      <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-6xl bg-white rounded-2xl shadow-lg p-2 sm:p-4 md:p-8 lg:p-12 flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12 min-h-[520px]">
        {step === 1 && (
          <>
            {/* Account/Email Section */}
            <div className="flex-1 min-w-[220px] sm:min-w-[300px] md:min-w-[340px] max-w-2xl px-0 sm:px-4 md:px-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {t(
                  "subscribe_with_account",
                  "Subscribe with an account",
                  "اشترك بحساب"
                )}
              </h2>
              <p className="text-gray-500 mb-6">
                {t(
                  "access_subscription_email",
                  "You’ll access your subscription through this email.",
                  "ستصل إلى اشتراكك عبر هذا البريد الإلكتروني."
                )}
              </p>
              <input
                className={`w-full border rounded-lg px-4 py-3 mb-1 text-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white ${
                  emailError && !email
                    ? "border-red-500 text-red-600 placeholder-red-500"
                    : "border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder={t("email", "Email", "البريد الإلكتروني")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
              />
              {emailError && (
                <div className="text-red-600 text-sm mb-3">{emailError}</div>
              )}
              <div className="flex flex-col gap-3 mb-4">
                <label className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="relative mt-1 inline-block w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] align-middle flex-shrink-0">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-400 transition-colors duration-200"
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                      checked={promoChecked}
                      onChange={(e) => setPromoChecked(e.target.checked)}
                    />
                    {/* Custom checkmark SVG */}
                    <svg
                      className="pointer-events-none absolute left-0 top-0 w-5 h-5 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="5 11 9 15 15 7" />
                    </svg>
                  </span>
                  {t(
                    "wired_promotional_emails",
                    "Sign up for promotional emails, including digests of stories, perk notifications, and event invites that are included in your subscription.",
                    "اشترك في رسائلنا الترويجية، بما في ذلك ملخصات القصص، وإشعارات المزايا، ودعوات الفعاليات."
                  )}
                </label>
                <label className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="relative mt-1 inline-block w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] align-middle flex-shrink-0">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-400 transition-colors duration-200"
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                      checked={marketingChecked}
                      onChange={(e) => setMarketingChecked(e.target.checked)}
                    />
                    {/* Custom checkmark SVG */}
                    <svg
                      className="pointer-events-none absolute left-0 top-0 w-5 h-5 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="5 11 9 15 15 7" />
                    </svg>
                  </span>
                  {t(
                    "wired_marketing_emails",
                    "Receive marketing emails about other brands and our marketing partners.",
                    "استلم رسائل تسويقية عن علاماتنا التجارية وشركائنا."
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t(
                  "email_marketing_notice",
                  "By continuing, your email may be used for marketing and account-related purposes, in accordance with our ",
                  "بالمتابعة، قد يُستخدم بريدك الإلكتروني لأغراض تسويقية وحسابية وفقًا ل"
                )}
                <a
                  href="/privacy"
                  className="underline text-red-700 hover:text-red-800 mx-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("privacy_policy", "privacy policy", "سياسة الخصوصية")}
                </a>
                {t(
                  "email_marketing_notice_cont",
                  "and applicable law.",
                  "والقانون المعمول به."
                )}
              </p>
            </div>
            {/* Plan Details Section */}
            <div className="flex-1 min-w-[220px] sm:min-w-[300px] md:min-w-[340px] max-w-xl flex flex-col justify-between px-0 sm:px-4 md:px-8 mt-8 md:mt-0">
              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <div className="mb-1">
                  <span className="text-lg font-semibold text-gray-900">
                    {planDetails[plan].title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {planDetails[plan].oldPrice && (
                    <span className="text-gray-400 line-through text-base">
                      {planDetails[plan].oldPrice}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-red-700">
                    {planDetails[plan].price}
                  </span>
                </div>
                <div className="text-gray-700 text-sm mb-2">
                  {planDetails[plan].desc}
                </div>
              </div>
              <Button
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-xl transition-all duration-300"
                onClick={() => {
                  if (validate()) setStep(2);
                }}
              >
                {t("continue", "Continue", "استمر")}
              </Button>
            </div>
          </>
        )}
        {step === 2 && (
          <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8 min-h-[400px]">
            {/* Payment Method Selection */}
            <div className="flex-1 min-w-[220px] sm:min-w-[300px] md:min-w-[340px] max-w-2xl bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {t(
                  "select_payment_method",
                  "Select payment method",
                  "اختر طريقة الدفع"
                )}
              </h2>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                <Image
                  src="/padlock-check.png"
                  alt="Padlock check"
                  width={14}
                  height={14}
                  className="w-4 h-4 object-contain"
                  priority
                />
                {t(
                  "secure_encrypted",
                  "All transactions are secure and encrypted.",
                  "جميع المعاملات آمنة ومشفرة."
                )}
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer bg-white hover:border-red-400 transition-all">
                  <span className="relative flex items-center">
                    <input
                      type="radio"
                      name="payment-method"
                      className="sr-only peer"
                      checked={paymentMethod === "paypal"}
                      onChange={() => {
                        setPaymentMethod("paypal");
                        if (email) setPaypalEmail(email);
                      }}
                    />
                    {/* Show PayPal email if PayPal is selected */}
                    {paymentMethod === "paypal" && paypalEmail && (
                      <div className="mb-4 text-base text-gray-700">
                        <span className="font-semibold">PayPal Email:</span>{" "}
                        {paypalEmail}
                      </div>
                    )}
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors bg-white ${
                        paymentMethod === "paypal"
                          ? "border-red-600"
                          : "border-black"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full transition-colors ${
                          paymentMethod === "paypal" ? "bg-red-600" : "bg-white"
                        }`}
                      ></span>
                    </span>
                  </span>
                  <span className="font-medium text-gray-900">PayPal</span>
                  <span className="ml-auto">
                    <Image
                      src="/paypal2.png"
                      alt="PayPal logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                      priority
                    />
                  </span>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer bg-white hover:border-red-400 transition-all relative">
                  <span className="relative flex items-center">
                    <input
                      type="radio"
                      name="payment-method"
                      className="sr-only peer"
                      checked={paymentMethod === "card"}
                      onChange={() => {
                        setPaymentMethod("card");
                      }}
                    />
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors bg-white ${
                        paymentMethod === "card"
                          ? "border-red-600"
                          : "border-black"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full transition-colors ${
                          paymentMethod === "card" ? "bg-red-600" : "bg-white"
                        }`}
                      ></span>
                    </span>
                  </span>
                  <span className="font-medium text-gray-900">
                    Credit / Debit card
                  </span>
                  <span className="ml-auto flex gap-1">
                    <Image
                      src="/card.png"
                      alt="Mastercard"
                      width={32}
                      height={20}
                      className="object-contain"
                    />
                    <Image
                      src="/visa.png"
                      alt="Visa"
                      width={32}
                      height={20}
                      className="object-contain"
                    />
                  </span>
                </label>
                {paymentMethod === "card" && (
                  <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>💳 Secure Payment</strong>
                      <br />
                      You'll be redirected to our secure payment page to enter
                      your card details in the next step.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Plan Summary and Due Now */}
            <div className="flex flex-col gap-4 sm:gap-6 flex-1 min-w-[220px] sm:min-w-[300px] md:min-w-[340px] max-w-xl mt-8 md:mt-0">
              <div className="bg-gray-100 rounded-xl p-4 sm:p-6">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {planDetails[plan].title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {planDetails[plan].oldPrice && (
                    <span className="text-gray-400 line-through text-base">
                      {planDetails[plan].oldPrice}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-red-700">
                    {planDetails[plan].price}
                  </span>
                </div>
                <div className="text-gray-700 text-sm mb-2 italic">
                  {planDetails[plan].desc}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {t("due_now", "Due now", "المستحق الآن")}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {planDetails[plan].price}
                  </span>
                </div>
                <Button
                  className="w-full py-3 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-xl transition-all duration-300"
                  onClick={() => {
                    setStep(3);
                  }}
                >
                  {t(
                    "continue_to_review",
                    "Continue to review",
                    "استمر للمراجعة"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        {step === 3 && renderStep3()}
      </div>
      <Footer categories={[]} />

      {/* Error Modal */}
      <AlertDialog
        open={errorModal.open}
        onOpenChange={(open) => setErrorModal({ ...errorModal, open })}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {errorModal.title ===
              t(
                "subscription_exists",
                "Subscription Already Active",
                "الاشتراك نشط بالفعل"
              ) ? (
                <span className="text-2xl">✅</span>
              ) : (
                <span className="text-2xl">⚠️</span>
              )}
              {errorModal.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-700 leading-relaxed pt-2">
              {errorModal.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:gap-3">
            {errorModal.redirectTo ? (
              <AlertDialogAction
                onClick={() => {
                  setErrorModal({ ...errorModal, open: false });
                  window.location.href = errorModal.redirectTo!;
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
              >
                {t("view_subscription", "View Subscription", "عرض الاشتراك")}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={() => setErrorModal({ ...errorModal, open: false })}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
              >
                {t("ok", "OK", "حسناً")}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
