"use client";

import { useEffect, useState } from "react";
type CategoryInterface = { _id?: string; id?: string; name_en: string; name_ar: string; slug: string; };
import Header from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/context/language-context";

export default function UserAgreementPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then(setCategories).catch(() => setCategories([]));
  }, []);

  const breadcrumbItems = [
    { label: t("home", "Home", "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠة"), href: "/" },
    { label: t("user_agreement", "User Agreement", "Ø§ØªÙØ§Ù‚ÙŠة Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…") },
  ];

  const sections = [
    {
      title: t("account_responsibility", "Account responsibility", "Ù…Ø³Ø¤ÙˆÙ„ÙŠة Ø§Ù„حساب"),
      body: t(
        "account_responsibility_body",
        "If you create an account, you are responsible for maintaining accurate information and for activity that occurs under your account, subject to applicable security and authentication measures.",
        "إذا Ø£Ù†شأت Ø­Ø³Ø§Ø¨Ù‹Ø§ØŒ ÙØ£Ù†ت Ù…Ø³Ø¤ÙˆÙ„ Ø¹Ù† Ø§Ù„حفاظ Ø¹Ù„Ù‰ Ø¯Ù‚ة Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙƒ ÙˆØ¹Ù† Ø§Ù„Ø£Ù†شطة Ø§Ù„ØªÙŠ ØªØªÙ… عبر Ø­Ø³Ø§Ø¨ÙƒØŒ ÙˆÙÙ‚Ù‹ا Ù„إجراءات Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ù…ØµØ§Ø¯Ù‚ة Ø§Ù„Ù…Ø¹Ù…ÙˆÙ„ Ø¨Ù‡ا.",
      ),
    },
    {
      title: t("acceptable_use", "Acceptable use", "Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„"),
      body: t(
        "acceptable_use_body",
        "Users must not misuse the platform, submit unlawful or harmful content where applicable, or attempt to disrupt services, compromise security, or infringe on othersâ€™ rights.",
        "ÙŠجب Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø¹Ø¯Ù… إساءة Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù†صة Ø£Ùˆ Ø¥Ø±Ø³Ø§Ù„ Ù…Ø­ØªÙˆÙ‰ ØºÙŠر Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ø£Ùˆ ضار Ø¹Ù†د Ø§Ù†Ø·Ø¨Ø§Ù‚ Ø°Ù„ÙƒØŒ Ø£Ùˆ Ù…Ø­Ø§ÙˆÙ„ة ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…ات Ø£Ùˆ Ø§Ù„إضرار Ø¨Ø§Ù„Ø£Ù…Ù† Ø£Ùˆ Ø§Ù†ØªÙ‡Ø§Ùƒ Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ø¢Ø®Ø±ÙŠÙ†.",
      ),
    },
    {
      title: t("editorial_independence", "Editorial and service information", "Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات Ø§Ù„ØªØ­Ø±ÙŠØ±ÙŠة ÙˆØ§Ù„Ø®Ø¯Ù…ÙŠة"),
      body: t(
        "editorial_independence_body",
        "Content is provided for informational purposes and may be updated, corrected, or changed. Features and availability of services may evolve over time.",
        "ÙŠÙÙ‚Ø¯Ù‘ÙŽÙ… Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù„أغراض Ø¥Ø¹Ù„Ø§Ù…ÙŠة ÙˆÙ‚د ÙŠØªÙ… ØªØ­Ø¯ÙŠØ«Ù‡ Ø£Ùˆ ØªØµØ­ÙŠØ­Ù‡ Ø£Ùˆ ØªØºÙŠÙŠØ±Ù‡. ÙƒÙ…ا Ù‚د ØªØªØ·Ùˆر Ù…ÙŠزات Ø§Ù„Ø®Ø¯Ù…ات ÙˆØªÙˆØ§ÙØ±Ù‡ا Ø¨Ù…Ø±Ùˆر Ø§Ù„ÙˆÙ‚ت.",
      ),
    },
    {
      title: t("agreement_contact", "Questions", "Ø£Ø³Ø¦Ù„ة"),
      body: t(
        "agreement_contact_body",
        "For questions about this User Agreement, please contact us through the contact page.",
        "Ù„Ù„استفسارات Ø­ÙˆÙ„ Ø§ØªÙØ§Ù‚ÙŠة Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù‡Ø°Ù‡ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†ا عبر صفحة Ø§Ù„ØªÙˆØ§ØµÙ„.",
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <Header categories={categories} />
      <Breadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 lg:px-6 py-10 md:py-14">
        <article className="max-w-3xl">
          <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-3">
            {t("legal", "Legal", "Ù‚Ø§Ù†ÙˆÙ†ÙŠ")}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-4">
            {t("user_agreement_title", "User Agreement", "Ø§ØªÙØ§Ù‚ÙŠة Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…")}
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            {t(
              "user_agreement_intro",
              "This agreement outlines the basic responsibilities and acceptable use expectations for users of The Maghreb Corridor.",
              "ØªÙˆضح Ù‡Ø°Ù‡ Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠة Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠات Ø§Ù„Ø£Ø³Ø§Ø³ÙŠة ÙˆØªÙˆÙ‚عات Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„ Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠ Ù†شرة Ø§Ù„Ù…Ù…ر Ø§Ù„Ù…ØºØ§Ø±Ø¨ÙŠ.",
            )}
          </p>
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-slate-950 mb-2">{section.title}</h2>
                <p className="text-slate-600 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer categories={categories} />
    </div>
  );
}