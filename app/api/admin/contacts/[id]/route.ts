import { NextRequest, NextResponse } from "next/server";
import {
  getContactMessageById,
  markContactMessageAsRead,
  deleteContactMessage,
  getUserById,
} from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(
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

      const { id } = await params;

      const message = await getContactMessageById(id);

      if (!message) {
        return NextResponse.json(
          { error: "Contact message not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message });
    } catch (error) {
      console.error("❌ Error fetching contact message:", error);
      return NextResponse.json(
        { error: "Failed to fetch contact message" },
        { status: 500 }
      );
    }
  })();
}

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

      let adminUserId;
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
        adminUserId = adminUser._id;
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const { id } = await params;
      const { action } = await request.json();

      console.log("📝 PATCH request received:", { id, action });

      if (action === "mark_read") {
        console.log("🔄 Attempting to mark message as read:", id);
        const success = await markContactMessageAsRead(id);
        console.log("✅ Mark as read result:", success);

        if (!success) {
          console.error(
            "❌ Failed to mark message as read - function returned false"
          );
          return NextResponse.json(
            { error: "Failed to mark message as read" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Message marked as read",
        });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
      console.error("❌ Error updating contact message:", error);
      return NextResponse.json(
        { error: "Failed to update contact message" },
        { status: 500 }
      );
    }
  })();
}

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

      const { id } = await params;

      const success = await deleteContactMessage(id);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to delete contact message" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Contact message deleted successfully",
      });
    } catch (error) {
      console.error("❌ Error deleting contact message:", error);
      return NextResponse.json(
        { error: "Failed to delete contact message" },
        { status: 500 }
      );
    }
  })();
}
