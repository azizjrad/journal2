"use client";

import { useEffect, useState } from "react";
type CategoryInterface = { _id?: string; id?: string; name_en: string; name_ar: string; slug: string; };
import Header from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/context/language-context";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then(setCategories).catch(() => setCategories([]));
  }, []);

  const breadcrumbItems = [
    { label: t("home", "Home", "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠة"), href: "/" },
    { label: t("privacy", "Privacy Policy", "Ø³ÙŠاسة Ø§Ù„Ø®ØµÙˆØµÙŠة") },
  ];

  const sections = [
    {
      title: t("info_collect", "Information we collect", "Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات Ø§Ù„ØªÙŠ Ù†Ø¬Ù…Ø¹Ù‡ا"),
      body: t(
        "info_collect_body",
        "We may collect information you provide directly, such as contact details, account information, newsletter preferences, and messages you send us. We may also collect limited technical data such as browser type, device information, and usage data to operate and improve the service.",
        "Ù‚د Ù†Ø¬Ù…ع Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات Ø§Ù„ØªÙŠ ØªÙ‚Ø¯Ù…Ù‡ا Ù…باشرة Ù…Ø«Ù„ Ø¨ÙŠØ§Ù†ات Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆÙ…Ø¹Ù„ÙˆÙ…ات Ø§Ù„حساب ÙˆØªÙØ¶ÙŠÙ„ات Ø§Ù„Ù†شرة ÙˆØ§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ØªÙŠ ØªØ±Ø³Ù„Ù‡ا Ø¥Ù„ÙŠÙ†ا. ÙƒÙ…ا Ù‚د Ù†Ø¬Ù…ع Ø¨ÙŠØ§Ù†ات ØªÙ‚Ù†ÙŠة Ù…Ø­Ø¯Ùˆدة Ù…Ø«Ù„ Ù†Ùˆع Ø§Ù„Ù…تصفح ÙˆÙ…Ø¹Ù„ÙˆÙ…ات Ø§Ù„Ø¬Ù‡از ÙˆØ¨ÙŠØ§Ù†ات Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø¯Ù…ة ÙˆØªØ­Ø³ÙŠÙ†Ù‡ا.",
      ),
    },
    {
      title: t("how_use", "How we use information", "ÙƒÙŠÙÙŠة Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات"),
      body: t(
        "how_use_body",
        "We use information to provide and maintain our services, respond to inquiries, manage subscriptions and newsletters, improve content and user experience, and protect the security and integrity of our platform.",
        "Ù†Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات Ù„ØªÙ‚Ø¯ÙŠÙ… Ø®Ø¯Ù…Ø§ØªÙ†ا ÙˆØµÙŠØ§Ù†ØªÙ‡Ø§ØŒ ÙˆØ§Ù„رد Ø¹Ù„Ù‰ Ø§Ù„Ø§Ø³ØªÙØ³Ø§Ø±Ø§ØªØŒ Ùˆإدارة Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒات ÙˆØ§Ù„Ù†Ø´Ø±Ø§ØªØŒ ÙˆØªØ­Ø³ÙŠÙ† Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ùˆتجربة Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ØŒ ÙˆØ­Ù…Ø§ÙŠة Ø£Ù…Ù† Ø§Ù„Ù…Ù†صة ÙˆØ³Ù„Ø§Ù…ØªÙ‡ا.",
      ),
    },
    {
      title: t("sharing", "Sharing and disclosure", "Ø§Ù„Ù…Ø´Ø§Ø±Ùƒة ÙˆØ§Ù„إفصاح"),
      body: t(
        "sharing_body",
        "We do not sell personal information. We may share information with service providers who help us operate the site (such as hosting, analytics, email, or payment providers), or when required by law.",
        "Ù„ا Ù†Ø¨ÙŠع Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات Ø§Ù„Ø´Ø®ØµÙŠة. Ù‚د Ù†Ø´Ø§Ø±Ùƒ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات Ù…ع Ù…Ø²ÙˆØ¯ÙŠ Ø®Ø¯Ù…ات ÙŠØ³Ø§Ø¹Ø¯ÙˆÙ†Ù†ا ÙÙŠ ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…ÙˆÙ‚ع (Ù…Ø«Ù„ Ø§Ù„استضافة Ø£Ùˆ Ø§Ù„ØªØ­Ù„ÙŠÙ„ات Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠد Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø§Ù„دفع)ØŒ Ø£Ùˆ Ø¹Ù†Ø¯Ù…ا ÙŠÙ‚ØªØ¶ÙŠ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ† Ø°Ù„Ùƒ.",
      ),
    },
    {
      title: t("choices", "Your choices", "Ø®ÙŠØ§Ø±Ø§ØªÙƒ"),
      body: t(
        "choices_body",
        "You may request access to, correction of, or deletion of certain personal information, subject to applicable law. You can also unsubscribe from newsletters using the options provided in our communications.",
        "ÙŠÙ…ÙƒÙ†Ùƒ Ø·Ù„ب Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ بعض Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات Ø§Ù„Ø´Ø®ØµÙŠة Ø£Ùˆ ØªØµØ­ÙŠØ­Ù‡ا Ø£Ùˆ Ø­Ø°ÙÙ‡ا ÙˆÙÙ‚Ù‹ا Ù„Ù„Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù…Ø¹Ù…ÙˆÙ„ Ø¨Ù‡ا. ÙƒÙ…ا ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ù„غاء Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙÙŠ Ø§Ù„Ù†شرات عبر Ø§Ù„Ø®ÙŠارات Ø§Ù„Ù…تاحة ÙÙŠ Ø±Ø³Ø§Ø¦Ù„Ù†ا.",
      ),
    },
    {
      title: t("contact_privacy", "Contact", "Ø§Ù„ØªÙˆØ§ØµÙ„"),
      body: t(
        "contact_privacy_body",
        "If you have questions about this Privacy Policy, please contact us through our contact page.",
        "إذا ÙƒØ§Ù†ت Ù„Ø¯ÙŠÙƒ Ø£Ø³Ø¦Ù„ة Ø­ÙˆÙ„ Ø³ÙŠاسة Ø§Ù„Ø®ØµÙˆØµÙŠة Ù‡Ø°Ù‡ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†ا عبر صفحة Ø§Ù„ØªÙˆØ§ØµÙ„.",
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
            {t("privacy_title", "Privacy Policy", "Ø³ÙŠاسة Ø§Ù„Ø®ØµÙˆØµÙŠة")}
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            {t(
              "privacy_intro",
              "This policy explains how The Maghreb Corridor collects, uses, and protects information when you use our website and services.",
              "ØªÙˆضح Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠاسة ÙƒÙŠÙÙŠة Ù‚ÙŠØ§Ù… Ù†شرة Ø§Ù„Ù…Ù…ر Ø§Ù„Ù…ØºØ§Ø±Ø¨ÙŠ Ø¨Ø¬Ù…ع Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…ات ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù…Ù‡ا ÙˆØ­Ù…Ø§ÙŠØªÙ‡ا Ø¹Ù†د Ø§Ø³ØªØ®Ø¯Ø§Ù…Ùƒ Ù„Ù…ÙˆÙ‚Ø¹Ù†ا ÙˆØ®Ø¯Ù…Ø§ØªÙ†ا.",
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