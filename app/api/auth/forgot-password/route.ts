import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  createPasswordResetToken,
  logUserActivity,
} from "@/lib/db";
import { generateSecureToken, getPasswordResetExpiry } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email-sendgrid";
import { rateLimiters, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitResult = rateLimiters.auth.check(request);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        "Too many password reset attempts. Please try again later."
      );
    }

    const body = await request.json();
    const { email } = body;

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
    const expiresAt = getPasswordResetExpiry();
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
