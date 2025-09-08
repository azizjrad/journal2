import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { User } from "@/lib/models/User";
import jwt from "jsonwebtoken";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      await connectDB();

      // Verify admin token
      const token = request.cookies.get("admin-token")?.value;
      if (!token) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const adminUser = await User.findById(decoded.userId);

        if (!adminUser || adminUser.role !== "admin" || !adminUser.is_active) {
          return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, message: "Invalid token" },
          { status: 401 }
        );
      }

      const { id } = await params;
      const body = await request.json();
      const { is_verified } = body;

      console.log("🔄 Updating user verification:", { id, is_verified });

      if (typeof is_verified !== "boolean") {
        return NextResponse.json(
          { success: false, message: "is_verified must be a boolean" },
          { status: 400 }
        );
      }

      // Update user verification status
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          is_verified,
          updated_at: new Date(),
        },
        { new: true, select: "-password_hash" }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      console.log(
        "✅ User verification updated successfully:",
        updatedUser._id
      );

      return NextResponse.json({
        success: true,
        message: `User ${is_verified ? "verified" : "unverified"} successfully`,
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("❌ Error updating user verification:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update user verification" },
        { status: 500 }
      );
    }
  })();
}
