import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

const features = [
  {
    key: "unlimited_access",
    title_en: "Unlimited Digital Access",
    title_ar: "وصول رقمي غير محدود",
    desc_en: "Fearless reporting on tech, power, and culture.",
    desc_ar: "تغطية جريئة للتقنية والسلطة والثقافة.",
  },
  {
    key: "livestream_qas",
    title_en: "Subscriber-Only Livestream Q&As",
    title_ar: "جلسات أسئلة وأجوبة حصرية للمشتركين",
    desc_en: "Engage directly with our editors and reporters.",
    desc_ar: "تفاعل مباشر مع المحررين والمراسلين.",
  },
  {
    key: "limited_tote",
    title_en: "Limited-Edition Tote",
    title_ar: "حقيبة إصدار محدود",
    desc_en: "Take us with you everywhere.",
    desc_ar: "خذنا معك أينما ذهبت.",
  },
];

export function AnnualDigitalFeatures() {
  const [active, setActive] = useState(0);
  const { language } = useLanguage();
  return (
    <section className="max-w-5xl mx-auto mt-0 mb-12 px-4">
      <h3 className="text-3xl md:text-4xl font-bold mb-8 border-b border-gray-200 pb-4">
        {language === "ar"
          ? "ما الذي يتضمنه الاشتراك السنوي الرقمي"
          : "What's Included in Annual Digital"}
      </h3>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Left: Graphic */}
        <div className="flex-1 w-full max-w-lg">
          <div className="aspect-square w-full bg-gradient-to-br from-red-50 via-white to-red-50 rounded-xl overflow-hidden flex items-center justify-center border-2 border-red-100">
            <div className="text-center p-8">
              <svg
                className="w-48 h-48 mx-auto mb-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h4 className="text-2xl font-bold text-red-900 mb-2">
                {language === "ar"
                  ? "الوصول الرقمي السنوي"
                  : "Annual Digital Access"}
              </h4>
              <p className="text-gray-600">
                {language === "ar"
                  ? "وصول غير محدود إلى جميع المحتوى"
                  : "Unlimited access to all content"}
              </p>
            </div>
          </div>
        </div>
        {/* Right: Features */}
        <div className="flex-1 w-full max-w-xl flex flex-col gap-4">
          {features.map((feature, idx) => (
            <button
              key={feature.key}
              onClick={() => setActive(idx)}
              className={`text-left group focus:outline-none focus:ring-0 transition-all duration-200 ${
                active === idx ? "" : "opacity-80"
              }`}
            >
              <div className="flex items-start">
                <span
                  className={`h-8 w-1 rounded bg-red-600 mr-4 mt-1 transition-all duration-200 ${
                    active === idx ? "opacity-100" : "opacity-0"
                  }`}
                ></span>
                <div>
                  <div
                    className={`text-lg md:text-xl font-semibold ${
                      active === idx ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {language === "ar" ? feature.title_ar : feature.title_en}
                  </div>
                  <div
                    className={`text-sm md:text-base ${
                      active === idx ? "text-red-700" : "text-gray-500"
                    }`}
                  >
                    {language === "ar" ? feature.desc_ar : feature.desc_en}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
