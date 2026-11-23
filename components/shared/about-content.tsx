"use client";

import { useLanguage } from "@/lib/context/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Target, Newspaper, Users } from "lucide-react";
import { NewsletterSection } from "@/components/home/newsletter-section";

export function AboutContent() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: <Newspaper className="h-5 w-5" />,
      number: t("focus_regions_value", "3+", "+٣"),
      label: t("focus_regions", "Focus regions", "مناطق تركيز"),
    },
    {
      icon: <Users className="h-5 w-5" />,
      number: t("key_themes_value", "4", "٤"),
      label: t("key_themes", "Key themes", "محاور أساسية"),
    },
    {
      icon: <Globe className="h-5 w-5" />,
      number: t("bilingual_value", "EN/AR", "عربي/إنجليزي"),
      label: t("bilingual_reporting", "Bilingual reporting", "تغطية ثنائية اللغة"),
    },
    {
      icon: <Target className="h-5 w-5" />,
      number: t("editorial_standard_value", "Editorial", "تحريري"),
      label: t("editorial_standard", "Clear, sourced analysis", "تحليل واضح وموثّق"),
    },
  ];

  const values = [
    {
      title: t("accuracy", "Accuracy", "الدقة"),
      body: t(
        "accuracy_desc",
        "We prioritize verified information, clear sourcing, and careful editorial review.",
        "نُعطي الأولوية للمعلومات الموثقة والمصادر الواضحة والمراجعة التحريرية الدقيقة.",
      ),
    },
    {
      title: t("clarity", "Clarity", "الوضوح"),
      body: t(
        "clarity_desc",
        "We present developments in a clear, accessible format for readers across the region and beyond.",
        "نقدّم التطورات بصياغة واضحة وسهلة للقراء داخل المنطقة وخارجها.",
      ),
    },
    {
      title: t("independence", "Independence", "الاستقلالية"),
      body: t(
        "independence_desc",
        "Our editorial perspective is guided by public-interest reporting and professional standards.",
        "يوجّه عملنا التحريري المصلحة العامة والمعايير المهنية.",
      ),
    },
  ];

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="max-w-3xl">
        <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-3">
          {t("about_kicker", "About", "من نحن")}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-4">
          {t("about_title", "An editorial dispatch on the Maghreb corridor", "نشرة تحريرية عن الممر المغاربي")}
        </h1>
        <p className="text-slate-600 leading-relaxed text-base md:text-lg">
          {t(
            "about_intro",
            "The Maghreb Corridor publishes focused reporting and analysis on the political, economic, and civic developments shaping Tunisia, Libya, and their wider neighborhood — with attention to governance, mobility, markets, and cross-border dynamics.",
            "تنشر نشرة الممر المغاربي تقارير وتحليلات مركّزة حول التطورات السياسية والاقتصادية والمدنية التي تشكّل تونس وليبيا ومحيطهما الأوسع، مع اهتمام بالحوكمة والتنقل والأسواق والديناميات العابرة للحدود.",
          )}
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-stone-200 bg-white/80 shadow-none rounded-md">
            <CardContent className="p-4 md:p-5">
              <div className="text-[#7a3030] mb-2">{stat.icon}</div>
              <div className="text-xl md:text-2xl font-semibold text-slate-950">{stat.number}</div>
              <div className="text-xs md:text-sm text-slate-600 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {values.map((value) => (
          <article key={value.title} className="border border-stone-200 bg-white/70 rounded-md p-5">
            <h2 className="text-base md:text-lg font-semibold text-slate-950 mb-2">{value.title}</h2>
            <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">{value.body}</p>
          </article>
        ))}
      </section>

      <section className="max-w-3xl border-t border-stone-200 pt-8">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-950 mb-3">
          {t("our_mission", "Our mission", "رسالتنا")}
        </h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          {t(
            "mission_body",
            "We aim to help readers follow complex regional developments with clarity — connecting events, policies, and local realities through careful reporting and accessible analysis.",
            "نهدف إلى مساعدة القراء على متابعة التطورات الإقليمية المعقّدة بوضوح، عبر ربط الأحداث والسياسات والواقع المحلي بتغطية دقيقة وتحليل ميسّر.",
          )}
        </p>
        <p className="text-slate-600 leading-relaxed">
          {t(
            "coverage_body",
            "Our coverage follows corridor-wide themes including municipal governance, economy and currency, borderlands and mobility, and the stories that connect communities across the region.",
            "تتابع تغطيتنا محاور تمتد على مستوى الممر، بما في ذلك الحوكمة المحلية والاقتصاد والعملة والمناطق الحدودية والتنقل، والقصص التي تربط المجتمعات عبر المنطقة.",
          )}
        </p>
      </section>

      <NewsletterSection />
    </div>
  );
}