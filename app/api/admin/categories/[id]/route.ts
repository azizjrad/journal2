import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db";

export function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      const body = await request.json();
      const { name_en, name_ar } = body;
      const { id } = await params;

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
      };

      const updatedCategory = await updateCategory(id, categoryData);
      return NextResponse.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      );
    }
  })();
}

export function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      const { id } = await params;
      await deleteCategory(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      );
    }
  })();
}
