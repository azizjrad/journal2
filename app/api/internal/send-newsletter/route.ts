import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterToSubscribers } from "@/lib/newsletter";
import { ensureAdmin } from "@/lib/ensure-admin";

export async function POST(request: NextRequest) {
  const adminCheck = await ensureAdmin(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const subject = formData.get("subject") as string;
    const content = formData.get("content") as string;
    const subscriberIdsStr = formData.get("subscriberIds") as string;

    if (!subject || !content || !subscriberIdsStr) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const subscriberIds = JSON.parse(subscriberIdsStr);

    if (!Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty subscriber list" },
        { status: 400 }
      );
    }

    // Extract attachments from FormData
    const attachments: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith("attachment_") && value instanceof File) {
        attachments.push(value);
      }
    });

    const result = await sendNewsletterToSubscribers(
      subject,
      content,
      subscriberIds,
      attachments.length > 0 ? attachments : undefined
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
    console.error("Send newsletter error:", err);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
