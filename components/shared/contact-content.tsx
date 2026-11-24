"use client";

import { useState } from "react";
import { Mail, Send, User, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/context/language-context";

export function ContactContent() {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Failed to send contact form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 md:space-y-12">
      <section className="max-w-3xl">
        <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-3">
          {t("contact_us_page", "Contact Us: The Maghreb Orbit", "تواصل معنا: مدار المغرب")}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-4">
          {t("contact_title", "Get in Touch", "تواصل معنا")}
        </h1>
        <p className="text-slate-600 leading-relaxed text-base md:text-lg">
          {t(
            "contact_intro",
            "Have a local news tip, a correction to our regional indicators, or a partnership inquiry? Reach out to The Maghreb Orbit desk directly.",
            "هل لديك معلومة محلية، أو تصحيح لمؤشراتنا الإقليمية، أو استفسار حول شراكة؟ تواصل مباشرة مع مكتب مدار المغرب.",
          )}
        </p>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          {t(
            "contact_sub_intro",
            "A clean, low-friction Contact page designed for both institutional inquiries and quick tips from the ground across Libya and the Maghreb.",
            "صفحة تواصل بسيطة وسهلة مصممة للاستفسارات المؤسسية والمعلومات السريعة من الميدان عبر ليبيا والمغرب العربي.",
          )}
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6 md:gap-8">
        <div className="bg-white/80 border border-stone-200 rounded-md p-5 md:p-6">
          <h2 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#7a3030]" />
            {t("send_message", "Send a message", "أرسل رسالة")}
          </h2>

          {submitStatus === "success" && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {t(
                "contact_success",
                "Your message has been sent. Thank you for reaching out.",
                "تم إرسال رسالتك بنجاح. شكرًا لتواصلك معنا.",
              )}
            </div>
          )}
          {submitStatus === "error" && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {t(
                "contact_error",
                "We couldn’t send your message. Please try again.",
                "تعذر إرسال رسالتك. يرجى المحاولة مرة أخرى.",
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("name", "Name", "الاسم")}
                </span>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-stone-300 bg-white ps-9 pe-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3030]/20 focus:border-[#7a3030]"
                    placeholder={t("your_name", "Your name", "اسمك")}
                  />
                </div>
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("email", "Email", "البريد الإلكتروني")}
                </span>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-stone-300 bg-white ps-9 pe-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3030]/20 focus:border-[#7a3030]"
                    placeholder={t("your_email", "you@example.com", "you@example.com")}
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("subject", "Subject", "الموضوع")}
              </span>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3030]/20 focus:border-[#7a3030]"
                placeholder={t("subject_placeholder", "How can we help?", "كيف يمكننا مساعدتك؟")}
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("message", "Message", "الرسالة")}
              </span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3030]/20 focus:border-[#7a3030] resize-y"
                placeholder={t("message_placeholder", "Write your message...", "اكتب رسالتك...")}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7a3030] hover:bg-[#632626] text-white px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isSubmitting
                ? t("sending", "Sending...", "جارٍ الإرسال...")
                : t("send", "Send message", "إرسال الرسالة")}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="bg-white/80 border border-stone-200 rounded-md p-5 md:p-6">
            <h2 className="text-lg font-semibold text-slate-950 mb-4">
              {t("direct_contact", "Direct Email & Tip Line", "البريد المباشر وخط الإبلاغ")}
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium text-slate-900">{t("editorial_desk", "General & Editorial Desk", "المكتب العام والتحريري")}</div>
                <a href="mailto:desk@maghreborbit.com" className="text-[#7a3030] hover:text-[#632626] underline underline-offset-2 break-all">desk@maghreborbit.com</a>
              </div>
              <div>
                <div className="font-medium text-slate-900">{t("partnerships_data", "Partnerships & Data Inquiries", "الشراكات واستفسارات البيانات")}</div>
                <a href="mailto:partnerships@maghreborbit.com" className="text-[#7a3030] hover:text-[#632626] underline underline-offset-2 break-all">partnerships@maghreborbit.com</a>
              </div>
              <div>
                <div className="font-medium text-slate-900">{t("secure_tip_line", "Secure Tip Line (WhatsApp / Signal)", "خط الإبلاغ الآمن (واتساب / سيجنال)")}</div>
                <div className="text-slate-700 break-all">+218 [Insert Number]</div>
              </div>
              <div>
                <div className="font-medium text-slate-900">{t("encrypted_email", "Encrypted Email (ProtonMail)", "البريد المشفّر (ProtonMail)")}</div>
                <a href="mailto:orbit.tips@proton.me" className="text-[#7a3030] hover:text-[#632626] underline underline-offset-2 break-all">orbit.tips@proton.me</a>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-200">
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                <strong className="font-semibold text-slate-900">{t("privacy_note_label", "Privacy Note:", "ملاحظة الخصوصية:")}</strong>{" "}
                <em>
                  {t(
                    "privacy_note_body",
                    "To remain anonymous, leave your name and email blank below or message us directly via WhatsApp, Signal/ProtonMail.",
                    "للحفاظ على عدم الكشف عن هويتك، اترك اسمك وبريدك الإلكتروني فارغين أدناه أو راسلنا مباشرة عبر واتساب أو سيجنال/ProtonMail.",
                  )}
                </em>
              </p>
            </div>
          </div>

          <div className="bg-white/60 border border-stone-200 rounded-md p-5 md:p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              {t("official_channels_schedule", "Official Channels & Schedule", "القنوات الرسمية وجدول النشر")}
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
              <li>
                <span className="font-medium text-slate-900">{t("follow_updates", "Follow Updates:", "تابع التحديثات:")}</span>{" "}
                X (<code className="text-slate-700">@MaghrebOrbit</code>) | Telegram (<code className="text-slate-700">t.me/MaghrebOrbit</code>) | LinkedIn (<span className="text-slate-700">The Maghreb Orbit</span>)
              </li>
              <li>
                <span className="font-medium text-slate-900">{t("publishing_schedule", "Publishing Schedule:", "جدول النشر:")}</span>{" "}
                {t("publishing_schedule_value", "Every Monday, Wednesday, and Friday at 07:00 EET.", "كل إثنين وأربعاء وجمعة الساعة 07:00 بتوقيت شرق أوروبا.")}
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}