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
              Akhbarna is a digital news platform providing comprehensive
              coverage of current events, politics, business, and culture.
            </p>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                The service features:
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Business news and analysis</li>
                <li>Tenders</li>
                <li>
                  Profiles of around 600 Libyan companies and government
                  entities, with management and contact details
                </li>
                <li>Listings of local and international events on Libya</li>
                <li>Stock market data</li>
                <li>
                  Economic and financial data from local and international
                  sources
                </li>
                <li>
                  Periodic sector profiles, factsheets, reference documents and
                  other analysis
                </li>
              </ul>
            </div>

            <p>
              Akhbarna is published by an independent editorial team. We strive
              to meet the highest standards of editorial quality and are fully
              independent, with no links to any political or religious
              organisations.
            </p>

            <p>
              The content on our site is freely accessible to all readers, with
              additional features available for registered users.
            </p>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Content Access:
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Free Articles</span>
                  <span className="font-semibold text-green-600">
                    Unlimited
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Premium Features</span>
                  <span className="font-semibold text-blue-600">Available</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Newsletter Subscription</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Advanced Search & Archive</span>
                  <span className="font-semibold text-red-600">Contact us</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Contact Information
              </h3>
              <div className="space-y-3">
                <p className="text-red-700">
                  Email us at{" "}
                  <a
                    href="mailto:contact@akhbarna.com"
                    className="underline hover:no-underline"
                  >
                    contact@akhbarna.com
                  </a>
                </p>
                <p className="text-red-700">
                  To receive our weekly newsletter, please{" "}
                  <a href="#" className="underline hover:no-underline">
                    register your details
                  </a>
                  .
                </p>
                <p className="text-red-700">
                  For editorial inquiries,{" "}
                  <a href="/contact" className="underline hover:no-underline">
                    visit our contact page
                  </a>
                  .
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
