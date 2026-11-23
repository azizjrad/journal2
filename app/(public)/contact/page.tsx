"use client";

import { useLanguage } from "@/lib/context/language-context";
type CategoryInterface = { _id?: string; id?: string; name_en: string; name_ar: string; slug: string; };
import Header from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { ContactContent } from "@/components/shared/contact-content";
import { useEffect, useState } from "react";


export default function ContactPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<CategoryInterface[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then(setCategories).catch(() => setCategories([]));
  }, []);

  const breadcrumbItems = [
    { label: t("home", "Home", "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠة"), href: "/" },
    { label: t("contact", "Contact", "ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†ا") },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-slate-900">
      <Header categories={categories} />
      <Breadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 lg:px-6 py-10 md:py-14">
        <ContactContent />
      </main>
      <Footer categories={categories} />
    </div>
  );
}