import { NextRequest, NextResponse } from "next/server";
import {
  replyToContactMessage,
  getUserById,
  getContactMessageById,
} from "@/lib/db";
import { sendContactReplyEmail } from "@/lib/email-sendgrid";
import jwt from "jsonwebtoken";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      // Check admin authorization
      const adminToken = request.cookies.get("admin-token")?.value;

      if (!adminToken) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      let adminUserId: string;
      try {
        const tokenPayload = jwt.verify(
          adminToken,
          process.env.JWT_SECRET!
        ) as any;
        const adminUser = await getUserById(tokenPayload.userId);

        if (!adminUser || adminUser.role !== "admin" || !adminUser._id) {
          return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 }
          );
        }
        adminUserId = adminUser._id.toString();
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const { id } = await params;
      const { reply, attachments } = await request.json();

      // Validate reply
      if (!reply || typeof reply !== "string") {
        return NextResponse.json(
          { error: "Reply content is required" },
          { status: 400 }
        );
      }

      if (reply.trim().length === 0) {
        return NextResponse.json(
          { error: "Reply cannot be empty" },
          { status: 400 }
        );
      }

      if (reply.length > 2000) {
        return NextResponse.json(
          { error: "Reply must be less than 2000 characters" },
          { status: 400 }
        );
      }

      console.log("💬 Admin replying to contact message:", { id, adminUserId });

      // Get the original contact message
      const contactMessage = await getContactMessageById(id);
      if (!contactMessage) {
        return NextResponse.json(
          { error: "Contact message not found" },
          { status: 404 }
        );
      }

      // Save reply to database
      const success = await replyToContactMessage(
        id,
        reply.trim(),
        adminUserId
      );

      if (!success) {
        return NextResponse.json(
          { error: "Failed to send reply" },
          { status: 400 }
        );
      }

      // Send email notification to the user
      try {
        await sendContactReplyEmail({
          recipientEmail: contactMessage.email,
          recipientName: contactMessage.name,
          originalSubject: contactMessage.subject,
          originalMessage: contactMessage.message,
          replyMessage: reply.trim(),
          attachments: attachments || [],
        });
        console.log("✅ Reply email sent to:", contactMessage.email);
      } catch (emailError) {
        console.error("❌ Failed to send reply email:", emailError);
        // Don't fail the request if email fails - reply is already saved
      }

      console.log("✅ Reply sent successfully");

      return NextResponse.json({
        success: true,
        message: "Reply sent successfully",
      });
    } catch (error) {
      console.error("❌ Error sending reply:", error);
      return NextResponse.json(
        { error: "Failed to send reply" },
        { status: 500 }
      );
    }
  })();
}
