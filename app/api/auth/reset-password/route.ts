import { NextRequest, NextResponse } from "next/server";
import {
  getPasswordResetToken,
  markPasswordResetTokenAsUsed,
  updateUserPassword,
  getUserById,
  logUserActivity,
} from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validation
    if (!token || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials or request",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials or request",
        },
        { status: 400 }
      );
    }

    // Find and validate reset token
    const resetToken = await getPasswordResetToken(token);

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials or request" },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserById(resetToken.user_id);
    if (!user || !user.id || !user.is_active) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials or request" },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await updateUserPassword(user.id, passwordHash);

    // Mark token as used
    await markPasswordResetTokenAsUsed(resetToken.id);

    // Log password reset activity
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;
    await logUserActivity(
      user.id,
      "PASSWORD_RESET_COMPLETED",
      "Password was successfully reset",
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Request failed. Please try again." },
      { status: 500 }
    );
  }
}
