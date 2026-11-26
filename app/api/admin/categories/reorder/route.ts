import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { reorderCategories } from "@/lib/services/category-service";
import { ensureAdmin } from "@/lib/auth/ensure-admin";

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await ensureAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { orderedIds } = body || {};

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds must be an array" },
        { status: 400 },
      );
    }

    await reorderCategories(orderedIds);

    try {
      revalidateTag("categories", "max");
    } catch {}
    try {
      revalidateTag("categories" as never);
    } catch {}
    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering categories:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reorder categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
