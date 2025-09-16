import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

const faqs = [
  {
    key: "what_included",
    question_en: "What does my subscription include?",
    question_ar: "ماذا يتضمن اشتراكي؟",
    answer_en:
      "All subscriptions provide unlimited digital access, invitations to subscriber-only livestreams, and subscriber-only newsletters. Annual subscribers may receive a limited-edition tote.",
    answer_ar:
      "جميع الاشتراكات توفر وصولاً رقمياً غير محدود، ودعوات لجلسات أسئلة وأجوبة حصرية للمشتركين، ونشرات بريدية خاصة بالمشتركين. قد يحصل المشتركون السنويون على حقيبة إصدار محدود.",
  },
  {
    key: "newsletter_signup",
    question_en: "How do I sign up for newsletters?",
    question_ar: "كيف يمكنني الاشتراك في النشرات البريدية؟",
    answer_en:
      "You can sign up for newsletters in your account dashboard after subscribing.",
    answer_ar: "يمكنك الاشتراك في النشرات البريدية من لوحة حسابك بعد الاشتراك.",
  },
  {
    key: "more_info",
    question_en: "Want more information about your subscription?",
    question_ar: "تريد المزيد من المعلومات عن اشتراكك؟",
    answer_en: (
      <>
        Please contact our support team for more details about your subscription{" "}
        <a
          href="/contact"
          className="text-blue-600 underline hover:text-blue-800"
        >
          here
        </a>
        .
      </>
    ),
    answer_ar: (
      <>
        يرجى التواصل مع فريق الدعم لمزيد من التفاصيل حول اشتراكك{" "}
        <a
          href="/contact"
          className="text-blue-600 underline hover:text-blue-800"
        >
          من هنا
        </a>
        .
      </>
    ),
  },
];

export function NewsletterFAQ() {
  const [open, setOpen] = useState(0);
  const { language } = useLanguage();
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          {language === "ar" ? "أسئلتك الشائعة" : "Your questions answered"}
        </h2>
        <div className="divide-y divide-gray-300 border-t border-b border-gray-300">
          {faqs.map((faq, idx) => (
            <div key={faq.key}>
              <button
                className="w-full text-left py-6 outline-none ring-0 focus:outline-none focus:ring-0 flex items-center justify-between"
                onClick={() => setOpen(open === idx ? -1 : idx)}
              >
                <span className="text-lg md:text-xl font-semibold text-gray-900">
                  {language === "ar" ? faq.question_ar : faq.question_en}
                </span>
                <span className="ml-4 text-gray-500 text-2xl select-none">
                  {open === idx ? "\u25B2" : "\u25BC"}
                </span>
              </button>
              {open === idx && (
                <div className="pb-6 pl-2 pr-8 text-gray-800 text-base md:text-lg animate-fade-in">
                  {language === "ar" ? faq.answer_ar : faq.answer_en}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
