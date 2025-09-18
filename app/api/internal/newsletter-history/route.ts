import { NextRequest, NextResponse } from "next/server";
import { SentNewsletter } from "@/lib/models/SentNewsletter";
import { ensureAdmin } from "@/lib/ensure-admin";

export async function GET(request: NextRequest) {
  const adminCheck = await ensureAdmin(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const q = searchParams.get("q") || "";
  const PAGE_SIZE = 10;
  const filter: any = {};
  if (q) {
    filter.$or = [
      { subject: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
    ];
  }
  const total = await SentNewsletter.countDocuments(filter);
  const newsletters = await SentNewsletter.find(filter)
    .sort({ sentAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .select("subject sentAt recipientCount");
  return NextResponse.json({ newsletters, total });
}
