import { NextRequest, NextResponse } from "next/server";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  logUserActivity,
} from "@/lib/db";
import jwt from "jsonwebtoken";

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization using admin-token
    const adminToken = request.cookies.get("admin-token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
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
          { success: false, message: "Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Get all users
    const users = await getAllUsers();

    return NextResponse.json({
      success: true,
      users,
      profiles: {}, // Will implement profiles later
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get users" },
      { status: 500 }
    );
  }
}

// PUT update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization
    const adminToken = request.cookies.get("admin-token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
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
          { success: false, message: "Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await updateUser(userId, updates);

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization
    const adminToken = request.cookies.get("admin-token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
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
          { success: false, message: "Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    const tokenPayload = jwt.verify(adminToken, process.env.JWT_SECRET!) as any;
    if (userId === tokenPayload.userId) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    await deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Cannot delete user with published articles")
    ) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
