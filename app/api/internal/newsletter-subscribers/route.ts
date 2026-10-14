import { NextRequest, NextResponse } from "next/server";
import { getNewsletterSubscribers } from "@/lib/services/newsletter-service";
import { ensureAdmin } from "@/lib/auth/ensure-admin";

export async function GET(request: NextRequest) {
  const adminCheck = await ensureAdmin(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subscribers = await getNewsletterSubscribers();
  return NextResponse.json({ subscribers });
}
