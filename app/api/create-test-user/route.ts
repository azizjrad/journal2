import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    await dbConnect();

    console.log("🔧 Creating test user...");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@journal.com" });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "Test user already exists",
        credentials: {
          email: "test@journal.com",
          password: "test123",
        },
      });
    }

    // Create test user
    const passwordHash = await hashPassword("test123");

    const testUser = await User.create({
      username: "testuser",
      email: "test@journal.com",
      password_hash: passwordHash,
      first_name: "Test",
      last_name: "User",
      role: "user",
      is_active: true,
      is_verified: true,
      created_at: new Date(),
    });

    console.log("✅ Test user created successfully");

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      credentials: {
        email: "test@journal.com",
        password: "test123",
      },
      user: {
        id: testUser._id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      },
    });
  } catch (error: any) {
    console.error("❌ Error creating test user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
