"use client";

import { useLanguage } from "@/lib/language-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Target, Newspaper, Users } from "lucide-react";
import { NewsletterSection } from "@/components/home/newsletter-section";

export function AboutContent() {
  const { language, t } = useLanguage();

  const stats = [
    {
      icon: <Newspaper className="w-8 h-8" />,
      number: "10,000+",
      label: t("articles_published", "Articles Published", "مقال منشور"),
      color: "text-blue-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      number: "500K+",
      label: t("monthly_readers", "Monthly Readers", "قارئ شهري"),
      color: "text-green-600",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      number: "25+",
      label: t("countries_reached", "Countries Reached", "دولة وصلنا إليها"),
      color: "text-purple-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-700 px-4 py-2 text-sm font-medium"
        >
          {t("about_badge", "About Our Journal", "حول مجلتنا")}
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          {t("main_title", "Redefining Digital", "إعادة تعريف")}{" "}
          <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            {t("journalism", "Journalism", "الصحافة الرقمية")}
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t(
            "hero_desc",
            "We are committed to delivering accurate, timely, and impactful news that empowers our readers to stay informed in an ever-changing world.",
            "نحن ملتزمون بتقديم أخبار دقيقة وفي الوقت المناسب ومؤثرة تمكن قرائنا من البقاء على اطلاع في عالم متغير باستمرار."
          )}
        </p>
      </div>

      {/* Stats Section */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div
                  className={`mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* About Our Journal */}
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <Badge variant="outline" className="border-red-200 text-red-700">
              <Target className="w-4 h-4 mr-2" />
              {t("about_us", "About Our Journal", "حول مجلتنا")}
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">
              {t(
                "journal_title",
                "Your Trusted Source for News & Information",
                "مصدرك الموثوق للأخبار والمعلومات"
              )}
            </h2>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
            <p>
              {t(
                "about_platform_desc",
                "The Maghreb Orbit is a digital news platform providing comprehensive coverage of current events, politics, business, and culture.",
                "أخبارنا هي منصة إخبارية رقمية تقدم تغطية شاملة للأحداث الجارية والسياسة والأعمال والثقافة."
              )}
            </p>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t(
                  "service_features_title",
                  "The service features:",
                  ":ميزات الخدمة"
                )}
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  {t(
                    "feature_business_news",
                    "Business news and analysis",
                    "أخبار وتحليلات الأعمال"
                  )}
                </li>
                <li>{t("feature_tenders", "Tenders", "المناقصات")}</li>
                <li>
                  {t(
                    "feature_profiles",
                    "Profiles of around 600 Libyan companies and government entities, with management and contact details",
                    "ملفات تعريف لحوالي 600 شركة وهيئة حكومية ليبية، مع تفاصيل الإدارة ووسائل الاتصال"
                  )}
                </li>
                <li>
                  {t(
                    "feature_events",
                    "Listings of local and international events on Libya",
                    "قوائم الفعاليات المحلية والدولية حول ليبيا"
                  )}
                </li>
                <li>
                  {t(
                    "feature_stock_market",
                    "Stock market data",
                    "بيانات سوق الأسهم"
                  )}
                </li>
                <li>
                  {t(
                    "feature_economic_data",
                    "Economic and financial data from local and international sources",
                    "بيانات اقتصادية ومالية من مصادر محلية ودولية"
                  )}
                </li>
                <li>
                  {t(
                    "feature_sector_profiles",
                    "Periodic sector profiles, factsheets, reference documents and other analysis",
                    "ملفات قطاعية دورية، ونشرات معلومات، ووثائق مرجعية وتحليلات أخرى"
                  )}
                </li>
              </ul>
            </div>

            <p>
              {t(
                "about_independent",
                "The Maghreb Orbit is published by an independent editorial team. We strive to meet the highest standards of editorial quality and are fully independent, with no links to any political or religious organisations.",
                "يتم نشر أخبارنا بواسطة فريق تحريري مستقل. نسعى لتحقيق أعلى معايير الجودة التحريرية ونتمتع باستقلالية تامة دون أي صلات سياسية أو دينية."
              )}
            </p>
            <p>
              {t(
                "about_free_content",
                "The content on our site is freely accessible to all readers, with additional features available for registered users.",
                "المحتوى على موقعنا متاح مجانًا لجميع القراء، مع ميزات إضافية متاحة للمستخدمين المسجلين."
              )}
            </p>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t(
                  "content_access_title",
                  "Content Access:",
                  ":إمكانية الوصول إلى المحتوى"
                )}
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span>
                    {t(
                      "content_access_free_articles",
                      "Free Articles",
                      "مقالات مجانية"
                    )}
                  </span>
                  <span className="font-semibold text-green-600">
                    {t("content_access_unlimited", "Unlimited", "غير محدود")}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>
                    {t(
                      "content_access_premium",
                      "Premium Features",
                      "ميزات مميزة"
                    )}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {t("content_access_available", "Available", "متاح")}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>
                    {t(
                      "content_access_newsletter",
                      "Newsletter Subscription (with Annual Plan)",
                      "الاشتراك في النشرة الإخبارية (مع الخطة السنوية)"
                    )}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {t(
                      "content_access_with_subscription",
                      "With Subscription",
                      "مع الاشتراك"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    {t(
                      "content_access_advanced",
                      "Advanced Search & Archive",
                      "بحث متقدم وأرشيف"
                    )}
                  </span>
                  <span className="font-semibold text-red-600">
                    {t("content_access_contact", "Contact us", "اتصل بنا")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                {t(
                  "contact_info_title",
                  "Contact Information",
                  "معلومات الاتصال"
                )}
              </h3>
              <div className="space-y-3">
                <p className="text-red-700">
                  {t(
                    "contact_email",
                    <>
                      Email us at{" "}
                      <a
                        href="mailto:contact@maghriborbit.com"
                        className="underline hover:no-underline"
                      >
                        contact@maghriborbit.com
                      </a>
                    </>,
                    <>
                      راسلنا عبر البريد الإلكتروني{" "}
                      <a
                        href="mailto:contact@maghriborbit.com"
                        className="underline hover:no-underline"
                      >
                        contact@maghriborbit.com
                      </a>
                    </>
                  )}
                </p>
                <p className="text-red-700">
                  {language === "ar" ? (
                    <>
                      {t(
                        "contact_newsletter_text_ar_new",
                        "",
                        "للاستفادة من نشرتنا الأسبوعية الحصرية، يرجى "
                      )}
                      <a
                        href="/payment"
                        className="underline hover:no-underline"
                      >
                        الاشتراك في الخدمة
                      </a>
                      {t("contact_newsletter_text2_ar_new", "", ".")}
                    </>
                  ) : (
                    <>
                      {t(
                        "contact_newsletter_text_en_new",
                        "Enjoy our exclusive weekly newsletter by ",
                        ""
                      )}
                      <a
                        href="/payment"
                        className="underline hover:no-underline"
                      >
                        subscribing to our service
                      </a>
                      {t("contact_newsletter_text2_en_new", ".", "")}
                    </>
                  )}
                </p>
                <p className="text-red-700">
                  {language === "ar" ? (
                    <>
                      {t(
                        "contact_editorial_text_ar",
                        "",
                        "للاستفسارات التحريرية، "
                      )}
                      <a
                        href="/contact"
                        className="underline hover:no-underline"
                      >
                        قم بزيارة صفحة الاتصال الخاصة بنا
                      </a>
                      {t("contact_editorial_text2_ar", "", ".")}
                    </>
                  ) : (
                    <>
                      {t(
                        "contact_editorial_text_en",
                        "For editorial inquiries, ",
                        ""
                      )}
                      <a
                        href="/contact"
                        className="underline hover:no-underline"
                      >
                        visit our contact page
                      </a>
                      {t("contact_editorial_text2_en", ".", "")}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
