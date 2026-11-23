"use client";

import { useEffect, useState } from "react";
type CategoryInterface = { _id?: string; id?: string; name_en: string; name_ar: string; slug: string; };
import Header from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/context/language-context";

export default function TermsPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then(setCategories).catch(() => setCategories([]));
  }, []);

  const breadcrumbItems = [
    { label: t("home", "Home", "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠة"), href: "/" },
    { label: t("terms", "Terms of Service", "Ø´Ø±Ùˆط Ø§Ù„Ø®Ø¯Ù…ة") },
  ];

  const sections = [
    {
      title: t("acceptance", "Acceptance of terms", "Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø´Ø±Ùˆط"),
      body: t(
        "acceptance_body",
        "By accessing or using The Maghreb Corridor, you agree to these Terms of Service and applicable laws. If you do not agree, please do not use the service.",
        "Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù…Ùƒ Ù„Ù†شرة Ø§Ù„Ù…Ù…ر Ø§Ù„Ù…ØºØ§Ø±Ø¨ÙŠ Ø£Ùˆ Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„ÙŠÙ‡Ø§ØŒ ÙØ¥Ù†Ùƒ ØªÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø´Ø±Ùˆط Ø§Ù„Ø®Ø¯Ù…ة Ù‡Ø°Ù‡ ÙˆØ§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù…Ø¹Ù…ÙˆÙ„ Ø¨Ù‡ا. إذا ÙƒÙ†ت Ù„ا ØªÙˆØ§ÙÙ‚ØŒ ÙŠØ±Ø¬Ù‰ Ø¹Ø¯Ù… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø®Ø¯Ù…ة.",
      ),
    },
    {
      title: t("use_service", "Use of the service", "Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø®Ø¯Ù…ة"),
      body: t(
        "use_service_body",
        "You agree to use the website lawfully and not to interfere with its operation, attempt unauthorized access, or misuse content, accounts, or subscription features.",
        "ØªÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…ÙˆÙ‚ع Ø¨Ø´ÙƒÙ„ Ù‚Ø§Ù†ÙˆÙ†ÙŠ ÙˆØ¹Ø¯Ù… ØªØ¹Ø·ÙŠÙ„ ØªØ´ØºÙŠÙ„Ù‡ Ø£Ùˆ Ù…Ø­Ø§ÙˆÙ„ة Ø§Ù„ÙˆØµÙˆÙ„ ØºÙŠر Ø§Ù„Ù…صرح Ø¨Ù‡ Ø£Ùˆ إساءة Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø£Ùˆ Ø§Ù„حسابات Ø£Ùˆ Ù…ÙŠزات Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ.",
      ),
    },
    {
      title: t("content_ip", "Content and intellectual property", "Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙˆØ§Ù„Ù…Ù„ÙƒÙŠة Ø§Ù„ÙÙƒØ±ÙŠة"),
      body: t(
        "content_ip_body",
        "Unless otherwise stated, site content is owned by or licensed to The Maghreb Corridor and protected by applicable intellectual property laws. You may not reproduce or distribute content without permission except as permitted by law.",
        "Ù…ا Ù„Ù… ÙŠÙØ°Ùƒر Ø®Ù„اف Ø°Ù„ÙƒØŒ ÙØ¥Ù† Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…ÙˆÙ‚ع Ù…Ù…Ù„ÙˆÙƒ Ø£Ùˆ Ù…Ø±Ø®Ù‘ص Ù„Ù†شرة Ø§Ù„Ù…Ù…ر Ø§Ù„Ù…ØºØ§Ø±Ø¨ÙŠ ÙˆÙ…Ø­Ù…ÙŠ Ø¨Ù…Ùˆجب Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù…Ù„ÙƒÙŠة Ø§Ù„ÙÙƒØ±ÙŠة Ø§Ù„Ù…Ø¹Ù…ÙˆÙ„ Ø¨Ù‡ا. Ù„ا ÙŠØ¬Ùˆز إعادة Ø¥Ù†تاج Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø£Ùˆ ØªÙˆØ²ÙŠØ¹Ù‡ Ø¯ÙˆÙ† Ø¥Ø°Ù† Ø¥Ù„ا ÙÙŠ Ø§Ù„Ø­Ø¯Ùˆد Ø§Ù„ØªÙŠ ÙŠØ³Ù…ح Ø¨Ù‡ا Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†.",
      ),
    },
    {
      title: t("subscriptions", "Subscriptions and payments", "Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒات ÙˆØ§Ù„Ù…Ø¯ÙÙˆعات"),
      body: t(
        "subscriptions_body",
        "Subscription terms, pricing, renewals, and cancellations are presented at the time of purchase and may be subject to additional payment-provider terms.",
        "تُعرض Ø´Ø±Ùˆط Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙˆØ§Ù„أسعار ÙˆØ§Ù„ØªØ¬Ø¯ÙŠد ÙˆØ§Ù„Ø¥Ù„غاء ÙˆÙ‚ت Ø§Ù„شراء ÙˆÙ‚د تخضع Ù„Ø´Ø±Ùˆط Ø¥Ø¶Ø§ÙÙŠة خاصة Ø¨Ù…Ø²Ùˆد Ø§Ù„دفع.",
      ),
    },
    {
      title: t("changes", "Changes to terms", "ØªØºÙŠÙŠرات Ø§Ù„Ø´Ø±Ùˆط"),
      body: t(
        "changes_body",
        "We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the updated terms.",
        "Ù‚د Ù†Ù‚ÙˆÙ… Ø¨ØªØ­Ø¯ÙŠث Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø±Ùˆط Ù…Ù† ÙˆÙ‚ت Ù„آخر. ÙˆÙŠُعد Ø§Ø³ØªÙ…رار Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø®Ø¯Ù…ة بعد Ø³Ø±ÙŠØ§Ù† Ø§Ù„ØªØºÙŠÙŠرات Ù‚Ø¨ÙˆÙ„Ù‹ا Ù„Ù„Ø´Ø±Ùˆط Ø§Ù„Ù…Ø­Ø¯Ù‘ثة.",
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
            {t("terms_title", "Terms of Service", "Ø´Ø±Ùˆط Ø§Ù„Ø®Ø¯Ù…ة")}
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            {t(
              "terms_intro",
              "These terms govern your access to and use of The Maghreb Corridor website, content, and related services.",
              "ØªÙ†Ø¸Ù… Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø±Ùˆط ÙˆØµÙˆÙ„Ùƒ Ø¥Ù„Ù‰ Ù…ÙˆÙ‚ع Ù†شرة Ø§Ù„Ù…Ù…ر Ø§Ù„Ù…ØºØ§Ø±Ø¨ÙŠ ÙˆÙ…Ø­ØªÙˆØ§Ù‡ ÙˆØ§Ù„Ø®Ø¯Ù…ات Ø§Ù„Ù…رتبطة Ø¨Ù‡ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù…Ùƒ Ù„Ù‡ا.",
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