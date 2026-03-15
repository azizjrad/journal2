"use client";

import { useLanguage } from "@/lib/context/language-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";

interface HomeBreadcrumbProps {}

export function HomeBreadcrumb({}: HomeBreadcrumbProps) {
  const { t } = useLanguage();

  const breadcrumbItems = [{ label: t("home", "Home", "الرئيسية") }];

  return <Breadcrumb items={breadcrumbItems} />;
}
