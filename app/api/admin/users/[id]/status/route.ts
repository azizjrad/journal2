import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function PATCH(
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

      try {
        const tokenPayload = jwt.verify(
          adminToken,
          process.env.JWT_SECRET!
        ) as any;

        const adminUser = await getUserById(tokenPayload.userId);
        if (!adminUser || adminUser.role !== "admin") {
          return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 }
          );
        }
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const { is_active } = await request.json();
      const { id: userId } = await params;

      console.log("🔄 Updating user status:", { userId, is_active });

      if (typeof is_active !== "boolean") {
        return NextResponse.json(
          { error: "is_active must be a boolean" },
          { status: 400 }
        );
      }

      // Update user status
      const updatedUser = await updateUser(userId, { is_active });
      console.log("✅ User status updated successfully:", updatedUser._id);

      return NextResponse.json({
        message: `User ${is_active ? "activated" : "banned"} successfully`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating user status:", error);
      return NextResponse.json(
        { error: "Failed to update user status" },
        { status: 500 }
      );
    }
  })();
}
