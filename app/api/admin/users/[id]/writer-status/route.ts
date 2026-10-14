import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/auth/ensure-admin";
import { getUserById, setUserWriterStatus } from "@/lib/user";
import { sendWriterApprovalEmail } from "@/lib/email/email-sendgrid";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check admin authorization using ensureAdmin
    const adminCheck = await ensureAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { writer_status, reason } = body;

    console.log("🔄 Updating writer status:", { id, writer_status });

    if (!["pending", "approved", "rejected"].includes(writer_status)) {
      return NextResponse.json(
        { success: false, message: "Invalid writer status" },
        { status: 400 },
      );
    }

    // Get user before update to check previous status
    const previousUser = await getUserById(id);
    if (!previousUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const updatedUser = await setUserWriterStatus(id, writer_status, {
      role: writer_status === "approved" ? "writer" : undefined,
      verifyAndActivate: writer_status === "approved",
    });

    console.log("✅ Writer status updated successfully:", updatedUser._id);

    // Send email notification if status changed to approved or rejected
    if (
      previousUser.writer_status === "pending" &&
      (writer_status === "approved" || writer_status === "rejected")
    ) {
      const emailSent = await sendWriterApprovalEmail({
        email: updatedUser.email,
        userName:
          updatedUser.first_name ||
          updatedUser.username ||
          updatedUser.email.split("@")[0],
        approved: writer_status === "approved",
        reason: writer_status === "rejected" ? reason : undefined,
      });

      if (!emailSent) {
        console.error(
          "Failed to send writer approval email to:",
          updatedUser.email,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Writer application ${writer_status} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("❌ Error updating writer status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update writer status" },
      { status: 500 },
    );
  }
}
