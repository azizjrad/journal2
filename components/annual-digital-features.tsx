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
          <div className="aspect-square w-full bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
            <Image
              src="/annual-digital-graphic.jpg"
              alt={
                language === "ar"
                  ? "رسم الاشتراك السنوي"
                  : "Annual Digital Graphic"
              }
              width={600}
              height={600}
              className="object-cover w-full h-full"
              priority
            />
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
