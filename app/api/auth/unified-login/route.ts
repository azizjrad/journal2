import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie, validateCsrf } from "@/lib/csrf";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, RefreshToken } from "@/lib/models/User";
import crypto from "crypto";

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
  const noStoreHeaders = { "Cache-Control": "no-store" };
  if (!validateCsrf(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid CSRF token" },
      { status: 403, headers: noStoreHeaders }
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
        { status: 400, headers: noStoreHeaders }
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
        { status: 401, headers: noStoreHeaders }
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
          { status: 401, headers: noStoreHeaders }
        );
      }
    }

    // Generate JWT access token (15 min expiry)
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "15m" });

    // Generate refresh token (30 days expiry)
    const refreshTokenValue = crypto.randomBytes(48).toString("hex");
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await RefreshToken.create({
      user_id: user._id,
      token: refreshTokenValue,
      expires_at: refreshTokenExpiry,
      ip_address: clientIP,
      user_agent: userAgent,
    });

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      last_login_at: new Date(),
    });

    // Create response
    const response = NextResponse.json(
      {
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
      },
      { headers: noStoreHeaders }
    );

    // Set access token cookie (15 min)
    const isProd = process.env.NODE_ENV === "production";
    const accessCookieOptions = {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: "strict" as const,
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    };
    // Set refresh token cookie (30 days)
    const refreshCookieOptions = {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: "strict" as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    };
    if (user.role === "admin") {
      response.cookies.set("admin-token", accessToken, accessCookieOptions);
      response.cookies.set("admin-refresh", refreshTokenValue, refreshCookieOptions);
    } else if (user.role === "writer") {
      response.cookies.set("writer-token", accessToken, accessCookieOptions);
      response.cookies.set("writer-refresh", refreshTokenValue, refreshCookieOptions);
    } else {
      response.cookies.set("auth-token", accessToken, accessCookieOptions);
      response.cookies.set("auth-refresh", refreshTokenValue, refreshCookieOptions);
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
      { status: 500, headers: noStoreHeaders }
    );
  }
}
