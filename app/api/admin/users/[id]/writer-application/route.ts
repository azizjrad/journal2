import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/ensure-admin";
import { getUserById, updateUserWriterStatus } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const authResponse = await ensureAdmin(request);
    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;
    const { action } = await request.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the user to verify they exist and have a pending writer application
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.writer_status !== "pending") {
      return NextResponse.json(
        { error: "User does not have a pending writer application" },
        { status: 400 }
      );
    }

    // Update the user's writer status and role
    const newWriterStatus = action === "approve" ? "approved" : "rejected";
    const newRole = action === "approve" ? "writer" : "user";

    await updateUserWriterStatus(id, newWriterStatus, newRole);

    // Get updated user data
    const updatedUser = await getUserById(id);

    return NextResponse.json({
      success: true,
      message: `Writer application ${action}d successfully`,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role,
        writer_status: updatedUser.writer_status,
        created_at: updatedUser.created_at,
      },
    });
  } catch (error) {
    console.error("Writer status update error:", error);
    return NextResponse.json(
      { error: "Failed to update writer status" },
      { status: 500 }
    );
  }
}
