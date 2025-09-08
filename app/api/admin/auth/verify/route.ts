import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "No token found",
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findById(decoded.userId).select("-password_hash");

    if (!user || !user.is_active) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "User not found or inactive",
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Insufficient permissions",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Auth verification error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Token verification failed",
      },
      { status: 401 }
    );
  }
}
