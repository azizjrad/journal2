import { NextRequest, NextResponse } from "next/server";
import {
  getEmailVerificationToken,
  markEmailVerificationTokenAsUsed,
  updateUser,
  getUserById,
  logUserActivity,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validation
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find and validate verification token
    const verificationToken = await getEmailVerificationToken(token);

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserById(verificationToken.user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.is_verified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified",
      });
    }

    // Update user as verified
    if (!user.id) {
      return NextResponse.json(
        { success: false, message: "User ID is missing" },
        { status: 500 }
      );
    }
    await updateUser(user.id, { is_verified: true });

    // Mark token as used
    await markEmailVerificationTokenAsUsed(verificationToken.id);

    // Log email verification activity
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;
    await logUserActivity(
      user.id,
      "EMAIL_VERIFIED",
      "Email address verified successfully",
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. Your account is now active.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Email verification failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
