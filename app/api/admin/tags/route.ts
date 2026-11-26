import { NextRequest, NextResponse } from "next/server";
import { getTags } from "@/lib/services/category-service";
import { ensureAdminOrWriter } from "@/lib/auth/ensure-admin";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await ensureAdminOrWriter(request);
    if (!authCheck.isAdmin && !authCheck.isWriter) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or writer access required." },
        { status: 401 },
      );
    }

    const tags = await getTags();
    return NextResponse.json(tags, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}
