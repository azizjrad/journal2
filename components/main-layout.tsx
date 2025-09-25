import type React from "react";
import Header from "@/components/header";

// Fetch categories from API (server component)
async function fetchCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/categories`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await fetchCategories();
  return (
    <>
      <Header categories={categories} />
      {children}
    </>
  );
}
