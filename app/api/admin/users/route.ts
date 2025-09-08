import { NextRequest, NextResponse } from "next/server";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  logUserActivity,
  createUser,
} from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";
import bcrypt from "bcryptjs";

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization using ensureAdmin
    const adminCheck = await ensureAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
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
    // Check admin authorization using ensureAdmin
    const adminCheck = await ensureAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
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
    // Check admin authorization using ensureAdmin
    const adminCheck = await ensureAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
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

    // Prevent self-deletion (if user info is available)
    if (adminCheck.user && userId === adminCheck.user.id) {
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

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Creating new user - POST /api/admin/users");

    const admin = await ensureAdmin(request);
    if (!admin) {
      console.log("❌ Admin verification failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Admin verified:", admin.user);

    const body = await request.json();
    console.log("📝 Request body:", body);

    const {
      username,
      email,
      password,
      role = "user",
      accountType,
      isVerified = false,
    } = body;

    // Validate required fields
    if (!username || !email || !password) {
      console.log("❌ Missing required fields:", {
        username: !!username,
        email: !!email,
        password: !!password,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["user", "writer", "admin"].includes(role)) {
      console.log("❌ Invalid role:", role);
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate account type for writers
    if (role === "writer" && !accountType) {
      console.log("❌ Missing account type for writer");
      return NextResponse.json(
        { error: "Account type is required for writers" },
        { status: 400 }
      );
    }

    console.log("🔐 Hashing password...");
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      username,
      email,
      password_hash: hashedPassword,
      role: role as "admin" | "writer" | "user",
      writer_status: (role === "writer" ? "approved" : null) as
        | "approved"
        | "pending"
        | "rejected"
        | null,
    };

    console.log("💾 Creating user in database with data:", {
      ...userData,
      password_hash: "[HASHED]",
    });

    // Create user in database
    const newUser = await createUser(userData);

    console.log("✅ User created successfully:", newUser);

    // Log admin activity
    console.log("📝 Logging admin activity...");
    try {
      await logUserActivity(
        admin.user.id,
        "create_user",
        `Created user: ${username}`
      );
    } catch (error) {
      console.warn("⚠️ Failed to log admin activity:", error);
      // Continue with user creation even if logging fails
    }

    console.log("🎉 Returning success response");
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        is_verified: newUser.is_verified,
      },
    });
  } catch (error) {
    console.error("❌ Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
