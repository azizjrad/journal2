"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { User, Settings, Key, Mail } from "lucide-react";
import { useLanguage } from "@/lib/context/language-context";

interface CategoryInterface {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  slug: string;
  created_at?: string;
  meta_description_en?: string;
  meta_description_ar?: string;
  order?: number;
}

export default function AccountPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const breadcrumbItems = [
    { label: t("home", "Home", "الرئيسية"), href: "/" },
    { label: t("account", "Account", "الحساب") },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <Header categories={categories} />
      <Breadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 lg:px-6 py-10 md:py-14">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <User className="w-7 h-7 text-[#7a3030]" />
            </div>
            <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-2">
              {t("account_kicker", "Account", "الحساب")}
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-950 mb-3">
              {t("account_title", "Account management", "إدارة الحساب")}
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t(
                "account_intro",
                "Manage your profile, preferences, and security settings.",
                "قم بإدارة ملفك الشخصي وتفضيلاتك وإعدادات الأمان.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <Link href="/profile" className="bg-white/80 rounded-md border border-stone-200 p-6 hover:border-stone-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-md bg-[#f8f7f4] border border-stone-200 flex items-center justify-center me-3">
                  <Settings className="w-5 h-5 text-[#7a3030]" />
                </div>
                <h2 className="text-xl font-semibold text-slate-950">{t("profile_settings", "Profile settings", "إعدادات الملف الشخصي")}</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {t("profile_settings_body", "Update your personal information and account details.", "حدّث معلوماتك الشخصية وتفاصيل حسابك.")}
              </p>
              <span className="text-sm font-medium text-[#7a3030]">{t("manage_profile", "Manage profile", "إدارة الملف الشخصي")}</span>
            </Link>

            <Link href="/profile" className="bg-white/80 rounded-md border border-stone-200 p-6 hover:border-stone-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-md bg-[#f8f7f4] border border-stone-200 flex items-center justify-center me-3">
                  <Key className="w-5 h-5 text-[#7a3030]" />
                </div>
                <h2 className="text-xl font-semibold text-slate-950">{t("security_settings", "Security settings", "إعدادات الأمان")}</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {t("security_settings_body", "Manage your password and account security options.", "أدِر كلمة المرور وخيارات أمان الحساب.")}
              </p>
              <span className="text-sm font-medium text-[#7a3030]">{t("security_options", "Security options", "خيارات الأمان")}</span>
            </Link>
          </div>

          <div className="bg-white/80 rounded-md border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-4">{t("quick_actions", "Quick actions", "إجراءات سريعة")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/profile" className="flex items-center gap-3 p-3 rounded-md border border-stone-200 hover:bg-stone-50 transition-colors">
                <Settings className="w-4 h-4 text-[#7a3030]" />
                <span className="text-sm text-slate-700">{t("edit_profile", "Edit profile", "تعديل الملف الشخصي")}</span>
              </Link>
              <Link href="/profile" className="flex items-center gap-3 p-3 rounded-md border border-stone-200 hover:bg-stone-50 transition-colors">
                <Key className="w-4 h-4 text-[#7a3030]" />
                <span className="text-sm text-slate-700">{t("change_password", "Change password", "تغيير كلمة المرور")}</span>
              </Link>
              <Link href="/contact" className="flex items-center gap-3 p-3 rounded-md border border-stone-200 hover:bg-stone-50 transition-colors">
                <Mail className="w-4 h-4 text-[#7a3030]" />
                <span className="text-sm text-slate-700">{t("contact_support", "Contact support", "التواصل مع الدعم")}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer categories={categories} />
    </div>
  );
}