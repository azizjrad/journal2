"use client";

import { useEffect, useState } from "react";
type CategoryInterface = { _id?: string; id?: string; name_en: string; name_ar: string; slug: string; };
import Header from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/context/language-context";

export default function AdvertisePage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then(setCategories).catch(() => setCategories([]));
  }, []);

  const breadcrumbItems = [
    { label: t("home", "Home", "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠة"), href: "/" },
    { label: t("advertise", "Advertise", "Ø£Ø¹Ù„Ù† Ù…Ø¹Ù†ا") },
  ];

  const options = [
    {
      title: t("display_ads", "Display placements", "Ù…ساحات Ø¥Ø¹Ù„Ø§Ù†ÙŠة"),
      body: t(
        "display_ads_body",
        "Brand visibility across selected pages and editorial sections, designed to fit the reading experience.",
        "Ø¸Ù‡Ùˆر Ù„Ù„Ø¹Ù„Ø§Ù…ة Ø§Ù„ØªØ¬Ø§Ø±ÙŠة ÙÙŠ صفحات ÙˆØ£Ù‚Ø³Ø§Ù… ØªØ­Ø±ÙŠØ±ÙŠة Ù…ختارة Ø¨Ù…ا ÙŠÙ†Ø³Ø¬Ù… Ù…ع تجربة Ø§Ù„Ù‚راءة.",
      ),
    },
    {
      title: t("sponsored", "Sponsored content", "Ù…Ø­ØªÙˆÙ‰ Ø¨Ø±Ø¹Ø§ÙŠة"),
      body: t(
        "sponsored_body",
        "Clearly labeled sponsored storytelling opportunities aligned with our audience and editorial standards.",
        "فرص Ù„Ù…Ø­ØªÙˆÙ‰ Ø¨Ø±Ø¹Ø§ÙŠة Ù…Ùˆضح Ø¨ÙˆØ¶Ùˆح ÙˆÙ…ØªÙˆØ§ÙÙ‚ Ù…ع Ø¬Ù…Ù‡ÙˆØ±Ù†ا ÙˆÙ…Ø¹Ø§ÙŠÙŠØ±Ù†ا Ø§Ù„ØªØ­Ø±ÙŠØ±ÙŠة.",
      ),
    },
    {
      title: t("partnerships", "Partnerships", "Ø´Ø±Ø§Ùƒات"),
      body: t(
        "partnerships_body",
        "Custom collaborations for campaigns, events, or thematic initiatives relevant to the Maghreb corridor.",
        "ØªØ¹Ø§ÙˆÙ†ات Ù…خصصة Ù„Ù„Ø­Ù…Ù„ات Ø£Ùˆ Ø§Ù„ÙØ¹Ø§Ù„ÙŠات Ø£Ùˆ Ø§Ù„Ù…بادرات Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ÙŠة ذات Ø§Ù„ØµÙ„ة Ø¨Ø§Ù„Ù…Ù…ر Ø§Ù„Ù…ØºØ§Ø±Ø¨ÙŠ.",
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <Header categories={categories} />
      <Breadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 lg:px-6 py-10 md:py-14 space-y-10 md:space-y-12">
        <section className="max-w-3xl">
          <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-3">
            {t("advertise_kicker", "Advertise", "Ø£Ø¹Ù„Ù† Ù…Ø¹Ù†ا")}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-4">
            {t("advertise_title", "Work with The Maghreb Corridor", "ØªØ¹Ø§ÙˆÙ† Ù…ع Ù†شرة Ø§Ù„Ù…Ù…ر Ø§Ù„Ù…ØºØ§Ø±Ø¨ÙŠ")}
          </h1>
          <p className="text-slate-600 leading-relaxed">
            {t(
              "advertise_intro",
              "Reach readers interested in regional developments through clear, well-integrated advertising and partnership options.",
              "ØµÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ù‚راء Ø§Ù„Ù…Ù‡ØªÙ…ÙŠÙ† Ø¨Ø§Ù„ØªØ·Ùˆرات Ø§Ù„Ø¥Ù‚Ù„ÙŠÙ…ÙŠة Ù…Ù† Ø®Ù„Ø§Ù„ Ø®ÙŠارات Ø¥Ø¹Ù„Ø§Ù†ÙŠة ÙˆØ´Ø±Ø§Ùƒات Ùˆاضحة ÙˆÙ…ØªÙƒØ§Ù…Ù„ة.",
            )}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {options.map((item) => (
            <article key={item.title} className="border border-stone-200 bg-white/70 rounded-md p-5">
              <h2 className="text-lg font-semibold text-slate-950 mb-2">{item.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="border-t border-stone-200 pt-8 max-w-3xl">
          <h2 className="text-xl font-semibold text-slate-950 mb-3">
            {t("get_in_touch", "Get in touch", "ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†ا")}
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {t(
              "advertise_contact",
              "To discuss advertising or partnership opportunities, please contact us and include your organization, objectives, and timeline.",
              "Ù„Ù…Ù†Ø§Ù‚شة فرص Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø£Ùˆ Ø§Ù„Ø´Ø±Ø§ÙƒØ©ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†ا Ù…ع Ø°Ùƒر Ø§Ù„Ø¬Ù‡ة ÙˆØ§Ù„Ø£Ù‡داف ÙˆØ§Ù„إطار Ø§Ù„Ø²Ù…Ù†ÙŠ.",
            )}{" "}
            <a href="/contact" className="text-[#7a3030] underline underline-offset-2 hover:text-[#632626]">
              {t("contact_page", "Contact page", "صفحة Ø§Ù„ØªÙˆØ§ØµÙ„")}
            </a>.
          </p>
        </section>
      </main>
      <Footer categories={categories} />
    </div>
  );
}