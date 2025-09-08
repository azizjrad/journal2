import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/db";

export function GET() {
  return (async () => {
    try {
      const categories = await getCategories();
      return NextResponse.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }
  })();
}

export function POST(request: NextRequest) {
  return (async () => {
    try {
      const body = await request.json();
      const { name_en, name_ar } = body;

      if (!name_en || !name_ar) {
        return NextResponse.json(
          { error: "Both English and Arabic names are required" },
          { status: 400 }
        );
      }

      // Generate slug from English name
      const slug = name_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const categoryData = {
        name_en,
        name_ar,
        slug,
        meta_description_en: undefined,
        meta_description_ar: undefined,
      };

      const newCategory = await createCategory(categoryData);
      return NextResponse.json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      );
    }
  })();
}
