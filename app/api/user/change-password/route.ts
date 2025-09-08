import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUserPassword, logUserActivity } from "@/lib/db";
import {
  verifyToken,
  verifyPassword,
  hashPassword,
  validatePasswordStrength,
} from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    // Get user from token - check both auth-token and admin-token
    const authToken = request.cookies.get("auth-token")?.value;
    const adminToken = request.cookies.get("admin-token")?.value;
    const token = authToken || adminToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Password requirements not met",
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Get user with password hash for verification
    const user = await getUserById(tokenPayload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log("🔄 Password change request for user:", tokenPayload.userId);
    console.log("📧 User email:", user.email);

    // Get user with password hash for current password verification
    const { getUserByEmailWithPassword } = await import("@/lib/db");
    const userWithPassword = await getUserByEmailWithPassword(user.email);

    console.log("🔍 User with password found:", !!userWithPassword);
    console.log("🔐 Password hash exists:", !!userWithPassword?.password_hash);

    if (!userWithPassword || !userWithPassword.password_hash) {
      console.log("❌ No password hash found for user");
      return NextResponse.json(
        { success: false, message: "Unable to verify current password" },
        { status: 500 }
      );
    }

    // Verify current password
    console.log("🔍 Verifying current password...");
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      userWithPassword.password_hash
    );
    console.log("✅ Current password valid:", isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      console.log("❌ Current password verification failed");
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    console.log("🔐 Hashing new password...");
    const newPasswordHash = await hashPassword(newPassword);
    console.log("✅ New password hashed successfully");

    // Update password
    console.log("💾 Updating password in database...");
    await updateUserPassword(tokenPayload.userId, newPasswordHash);
    console.log("✅ Password updated successfully in database");

    // Log password change activity
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;
    await logUserActivity(
      tokenPayload.userId,
      "PASSWORD_CHANGED",
      "User changed their password",
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password" },
      { status: 500 }
    );
  }
}
