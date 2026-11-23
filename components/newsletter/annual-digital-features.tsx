import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/lib/context/language-context";

const features = [
  {
    key: "unlimited_access",
    title_en: "Unlimited digital access",
    title_ar: "وصول رقمي غير محدود",
    desc_en: "Read briefings, dispatches, and coverage across topics.",
    desc_ar: "اطلع على الإحاطات والتقارير والتغطيات عبر مختلف المواضيع.",
  },
  {
    key: "livestream_qas",
    title_en: "Subscriber updates",
    title_ar: "تحديثات للمشتركين",
    desc_en: "Receive curated updates and subscriber-focused communications.",
    desc_ar: "احصل على تحديثات منتقاة ورسائل مخصصة للمشتركين.",
  },
  {
    key: "limited_tote",
    title_en: "Flexible plans",
    title_ar: "خطط مرنة",
    desc_en: "Choose monthly or annual access based on your needs.",
    desc_ar: "اختر بين الخطة الشهرية أو السنوية وفق احتياجاتك.",
  },
];

export function AnnualDigitalFeatures() {
  const [active, setActive] = useState(0);
  const { language, t } = useLanguage();

  return (
    <section className="max-w-5xl mx-auto mb-12 px-4 lg:px-6">
      <div className="border-t border-stone-200 pt-10">
        <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-2">
          {t("included_kicker", "What’s included", "ما الذي يشمله الاشتراك")}
        </p>
        <h3 className="text-2xl md:text-3xl font-semibold text-slate-950 mb-8">
          {language === "ar" ? "مزايا الاشتراك الرقمي" : "Digital subscription benefits"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 items-start">
          <div className="w-full bg-white/80 border border-stone-200 rounded-md p-8 flex items-center justify-center min-h-[280px]">
            <div className="text-center">
              <svg className="w-28 h-28 mx-auto mb-4 text-[#7a3030]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                {language === "ar" ? "وصول رقمي للمشتركين" : "Subscriber digital access"}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {language === "ar"
                  ? "إحاطات وتحديثات منتقاة ضمن تجربة قراءة واضحة وبسيطة."
                  : "Briefings and curated updates in a clear, focused reading experience."}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            {features.map((feature, idx) => (
              <button
                key={feature.key}
                onClick={() => setActive(idx)}
                className={`text-start border rounded-md p-4 transition-colors ${
                  active === idx ? "border-[#7a3030]/40 bg-white" : "border-stone-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div className={`text-base font-semibold ${active === idx ? "text-slate-950" : "text-slate-800"}`}>
                  {language === "ar" ? feature.title_ar : feature.title_en}
                </div>
                <div className={`text-sm mt-1 leading-relaxed ${active === idx ? "text-slate-700" : "text-slate-600"}`}>
                  {language === "ar" ? feature.desc_ar : feature.desc_en}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}