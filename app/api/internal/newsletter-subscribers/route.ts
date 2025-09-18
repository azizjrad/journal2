import { NextRequest, NextResponse } from "next/server";
import { getNewsletterSubscribers } from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";

export async function GET(request: NextRequest) {
  const adminCheck = await ensureAdmin(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subscribers = await getNewsletterSubscribers();
  return NextResponse.json({ subscribers });
}
