import { NextRequest, NextResponse } from "next/server";
import { getUserById, deleteUser } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function DELETE(
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

      let tokenPayload;
      try {
        tokenPayload = jwt.verify(adminToken, process.env.JWT_SECRET!) as any;

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

      const { id: userId } = await params;

      console.log("🗑️ Deleting user:", userId);

      // Prevent self-deletion
      if (userId === tokenPayload.userId) {
        return NextResponse.json(
          { error: "Cannot delete your own account" },
          { status: 400 }
        );
      }

      // Delete user
      await deleteUser(userId);
      console.log("✅ User deleted successfully:", userId);

      return NextResponse.json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("❌ Error deleting user:", error);

      if (
        error instanceof Error &&
        error.message.includes("Cannot delete user with published articles")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }
  })();
}
