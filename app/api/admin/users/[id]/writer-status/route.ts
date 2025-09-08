import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/models/User";
import { ensureAdmin } from "@/lib/ensure-admin";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Check admin authorization using ensureAdmin
    const adminCheck = await ensureAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { writer_status } = body;

    console.log("🔄 Updating writer status:", { id, writer_status });

    if (!["pending", "approved", "rejected"].includes(writer_status)) {
      return NextResponse.json(
        { success: false, message: "Invalid writer status" },
        { status: 400 }
      );
    }

    // Prepare update object
    const updateData: any = {
      writer_status,
      updated_at: new Date(),
    };

    // If approving, also set role to writer and ensure they're verified
    if (writer_status === "approved") {
      updateData.role = "writer";
      updateData.is_verified = true;
      updateData.is_active = true;
    }

    // Update user writer status
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-password_hash",
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ Writer status updated successfully:", updatedUser._id);

    return NextResponse.json({
      success: true,
      message: `Writer application ${writer_status} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("❌ Error updating writer status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update writer status" },
      { status: 500 }
    );
  }
}
