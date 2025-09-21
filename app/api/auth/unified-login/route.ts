import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie, validateCsrf } from "@/lib/csrf";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Direct database connection function
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI!;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if ((global as any).mongoose?.conn) {
    return (global as any).mongoose.conn;
  }

  if (!(global as any).mongoose) {
    (global as any).mongoose = { conn: null, promise: null };
  }

  if (!(global as any).mongoose.promise) {
    (global as any).mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  (global as any).mongoose.conn = await (global as any).mongoose.promise;
  return (global as any).mongoose.conn;
}

export async function POST(request: NextRequest) {
  // CSRF protection for state-changing requests
  if (!validateCsrf(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid CSRF token" },
      { status: 403 }
    );
  }
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Get client info for logging
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials or request",
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
      is_active: true,
    });
    if (!user) {
      // Always return a generic error message
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials or request",
        },
        { status: 401 }
      );
    }

    // Check password (only for local auth users)
    if (user.auth_provider === "local" || user.password_hash) {
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        // Always return a generic error message
        return NextResponse.json(
          {
            success: false,
            message: "Invalid credentials or request",
          },
          { status: 401 }
        );
      }
    }

    // Generate JWT token with tokenVersion for revocation
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    };
    const expiresIn = user.role === "admin" ? "1h" : "7d";
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      last_login_at: new Date(),
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });

    // Set appropriate cookie based on user role
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: "strict" as const,
      maxAge: user.role === "admin" ? 60 * 60 : 7 * 24 * 60 * 60, // 1h or 7d
      path: "/",
    };
    if (user.role === "admin") {
      response.cookies.set("admin-token", token, cookieOptions);
      console.log("[unified-login] Set admin-token cookie:", {
        value: token.slice(0, 12) + "...",
        options: cookieOptions,
        env: process.env.NODE_ENV,
      });
    } else if (user.role === "writer") {
      response.cookies.set("writer-token", token, cookieOptions);
      console.log("[unified-login] Set writer-token cookie:", {
        value: token.slice(0, 12) + "...",
        options: cookieOptions,
        env: process.env.NODE_ENV,
      });
    } else {
      response.cookies.set("auth-token", token, cookieOptions);
      console.log("[unified-login] Set auth-token cookie:", {
        value: token.slice(0, 12) + "...",
        options: cookieOptions,
        env: process.env.NODE_ENV,
      });
    }

    console.log(`✅ Unified login successful for ${user.role}: ${user.email}`);

    return response;
  } catch (error: any) {
    console.error("Unified login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Request failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
