import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  createUserProfile,
  createEmailVerificationToken,
  logUserActivity,
} from "@/lib/db";
import {
  hashPassword,
  isValidEmail,
  validatePasswordStrength,
  generateSecureToken,
  getEmailVerificationExpiry,
  checkRateLimit,
} from "@/lib/auth";
import { sendEmailVerification } from "@/lib/email-sendgrid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      accountType = "user", // New field for account type selection
    } = body;

    // Rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`register-${clientIP}`, 3, 60 * 60 * 1000)) {
      // 3 attempts per hour
      return NextResponse.json(
        {
          success: false,
          message: "Too many registration attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials or request",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials or request" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            passwordValidation.errors.join(". ") ||
            "Password does not meet requirements.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      getUserByEmail(email),
      getUserByUsername(username),
    ]);

    if (existingUserByEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, message: "This username is already taken." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Determine user role and writer status based on account type
    let userRole: "user" | "writer" | "admin" = "user";
    let writerStatus: "pending" | "approved" | "rejected" | null = null;

    if (accountType === "writer") {
      userRole = "user"; // Start as regular user
      writerStatus = "pending"; // Writer application pending
    }

    // Create email verification token
    const verificationToken = generateSecureToken();
    const expiresAt = getEmailVerificationExpiry();

    // Try sending email verification first
    let emailSent = false;
    try {
      emailSent = await sendEmailVerification({
        email: email.toLowerCase(),
        verificationToken,
        userName: firstName || username,
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email. Account not created.",
        },
        { status: 500 }
      );
    }

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email. Account not created.",
        },
        { status: 500 }
      );
    }

    // Create user
    const user = await createUser({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: userRole,
      writer_status: writerStatus,
    });

    // Create user profile
    await createUserProfile(String(user.id), {
      display_name: `${firstName || ""} ${lastName || ""}`.trim() || username,
    });

    // Save verification token
    if (!user.id || typeof user.id !== "string") {
      throw new Error("User ID is missing or invalid");
    }
    await createEmailVerificationToken(user.id, verificationToken, expiresAt);

    // Log registration activity
    const userAgent = request.headers.get("user-agent") || undefined;
    await logUserActivity(
      user.id,
      "USER_REGISTERED",
      `User account created${
        accountType === "writer" ? " with writer application pending" : ""
      }. Verification email sent: ${emailSent}`,
      clientIP,
      userAgent
    );

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    // Prepare success message based on account type
    let successMessage =
      "User registered successfully. Please check your email to verify your account.";
    if (accountType === "writer") {
      successMessage += " Your writer application is pending admin approval.";
    }

    return NextResponse.json(
      {
        success: true,
        message: successMessage,
        user: userResponse,
        ...(process.env.NODE_ENV === "development" && { verificationToken }), // Only in development
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Request failed. Please try again." },
      { status: 500 }
    );
  }
}
