import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  createPasswordResetToken,
  logUserActivity,
} from "@/lib/db";
import { generateSecureToken, checkRateLimit } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email-sendgrid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`reset-${clientIP}`, 3, 60 * 60 * 1000)) {
      // 3 attempts per hour
      return NextResponse.json(
        {
          success: false,
          message: "Too many password reset attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await getUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Account is deactivated. Please contact support.",
        },
        { status: 403 }
      );
    }

    // Generate password reset token
    const resetToken = generateSecureToken();
    // Set expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await createPasswordResetToken(String(user.id), resetToken, expiresAt);

    // Send password reset email
    const emailSent = await sendPasswordResetEmail({
      email: user.email,
      resetToken,
      userName: user.first_name || user.username,
    });

    // Log password reset request
    const userAgent = request.headers.get("user-agent") || undefined;
    await logUserActivity(
      String(user.id),
      "PASSWORD_RESET_REQUESTED",
      `Password reset token generated. Email sent: ${emailSent}`,
      clientIP || "unknown",
      userAgent
    );

    // In production, don't return the token
    return NextResponse.json({
      success: true,
      message: "Password reset instructions have been sent to your email.",
      ...(process.env.NODE_ENV === "development" && { resetToken }), // Only in development
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Password reset failed. Please try again." },
      { status: 500 }
    );
  }
}
