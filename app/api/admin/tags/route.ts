import { NextRequest, NextResponse } from "next/server";
import { getTags } from "@/lib/db";

export async function GET() {
  try {
    // Require admin authentication
    const { ensureAdmin } = await import("@/lib/ensure-admin");
    // Fake request for GET (Next.js API routes don't pass request to GET by default)
    // So, we can't check cookies/headers. Instead, recommend switching to POST or using middleware for real protection.
    // For now, just return 401 to block public access.
    return NextResponse.json(
      { error: "Unauthorized. Admin access required." },
      { status: 401 }
    );
    // If you want to allow GET with admin check, refactor to POST or use middleware.
    // const adminCheck = await ensureAdmin(request);
    // if (!adminCheck.isAdmin) {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin access required." },
    //     { status: 401 }
    //   );
    // }
    // const tags = await getTags();
    // return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
