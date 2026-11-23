import { useState } from "react";
import { useLanguage } from "@/lib/context/language-context";

const faqs = [
  {
    key: "what_included",
    question_en: "What does a subscription include?",
    question_ar: "ماذا يتضمن الاشتراك؟",
    answer_en:
      "Subscriptions provide access to subscriber features and updates according to the selected plan. Plan details and benefits may vary over time.",
    answer_ar:
      "يوفر الاشتراك الوصول إلى ميزات وتحديثات المشتركين وفق الخطة المختارة. قد تختلف تفاصيل الخطة والمزايا بمرور الوقت.",
  },
  {
    key: "newsletter_signup",
    question_en: "How do I receive newsletter updates?",
    question_ar: "كيف أتلقى تحديثات النشرة البريدية؟",
    answer_en:
      "After subscribing or registering where applicable, you can receive updates based on your account and subscription status.",
    answer_ar:
      "بعد الاشتراك أو التسجيل عند توفر ذلك، يمكنك تلقي التحديثات وفق حالة حسابك واشتراكك.",
  },
  {
    key: "more_info",
    question_en: "Need more information?",
    question_ar: "هل تحتاج إلى مزيد من المعلومات؟",
    answer_en: (
      <>
        For questions about plans or billing, please{" "}
        <a href="/contact" className="text-[#7a3030] underline underline-offset-2 hover:text-[#632626]">
          contact us
        </a>
        .
      </>
    ),
    answer_ar: (
      <>
        للاستفسارات حول الخطط أو الفوترة، يرجى{" "}
        <a href="/contact" className="text-[#7a3030] underline underline-offset-2 hover:text-[#632626]">
          التواصل معنا
        </a>
        .
      </>
    ),
  },
];

export function NewsletterFAQ() {
  const [open, setOpen] = useState(0);
  const { language, t } = useLanguage();

  return (
    <section className="bg-[#f8f7f4] py-12 md:py-16 px-4 lg:px-6 border-t border-stone-200">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-2">
          {t("faq_kicker", "FAQ", "الأسئلة الشائعة")}
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-950 mb-8">
          {language === "ar" ? "أسئلة شائعة" : "Frequently asked questions"}
        </h2>
        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {faqs.map((faq, idx) => (
            <div key={faq.key}>
              <button
                className="w-full text-start py-5 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === idx ? -1 : idx)}
              >
                <span className="text-base md:text-lg font-medium text-slate-900">
                  {language === "ar" ? faq.question_ar : faq.question_en}
                </span>
                <span className="text-slate-500 text-sm select-none" aria-hidden="true">
                  {open === idx ? "−" : "+"}
                </span>
              </button>
              {open === idx && (
                <div className="pb-5 pe-8 text-slate-700 leading-relaxed">
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