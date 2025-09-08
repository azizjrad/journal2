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

      const { role } = await request.json();
      const { id: userId } = await params;

      console.log("🔄 Updating user role:", { userId, role });

      if (!role || !["admin", "writer", "user"].includes(role)) {
        return NextResponse.json(
          { error: "Valid role is required (admin, writer, user)" },
          { status: 400 }
        );
      }

      // Update user role
      const updatedUser = await updateUser(userId, { role });
      console.log("✅ User role updated successfully:", updatedUser._id);

      return NextResponse.json({
        message: "User role updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating user role:", error);
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      );
    }
  })();
}
