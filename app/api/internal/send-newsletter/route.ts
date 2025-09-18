import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterToSubscribers } from "@/lib/newsletter";
import { ensureAdmin } from "@/lib/ensure-admin";

export async function POST(request: NextRequest) {
  const adminCheck = await ensureAdmin(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { subject, content, subscriberIds } = await request.json();
    if (
      !subject ||
      !content ||
      !Array.isArray(subscriberIds) ||
      subscriberIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const result = await sendNewsletterToSubscribers(
      subject,
      content,
      subscriberIds
    );
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send newsletter" },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
