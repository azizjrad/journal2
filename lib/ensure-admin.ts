import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

// Global flag to track if admin setup has been completed
let adminSetupComplete = false;
let adminSetupPromise: Promise<void> | null = null;

export async function ensureAdminExists(): Promise<void> {
  // If admin setup is already complete, return immediately
  if (adminSetupComplete) {
    console.log("✅ Admin user verification skipped (already confirmed)");
    return;
  }

  // Use a singleton pattern to ensure this only runs once
  if (adminSetupPromise) {
    return adminSetupPromise;
  }

  adminSetupPromise = setupAdmin();
  return adminSetupPromise;
}

async function setupAdmin(): Promise<void> {
  try {
    await dbConnect();

    console.log("🔍 Checking for existing admin user...");

    // Check if admin already exists - check multiple possible admin accounts
    const existingAdmin = await User.findOne({
      $or: [
        { email: "admin@journal.com" },
        { username: "admin" },
        { role: "admin" },
      ],
    });

    if (existingAdmin) {
      console.log(
        `✅ Admin user found: ${existingAdmin.email} (${existingAdmin.username})`
      );
      console.log("📧 Login Email: admin@journal.com");
      console.log("🔑 Login Password: admin123");

      // Mark admin setup as complete to prevent future checks
      adminSetupComplete = true;
      return;
    }

    console.log("🔧 No admin user found. Creating admin user...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const adminUser = await User.create({
      username: "admin",
      email: "admin@journal.com",
      password_hash: hashedPassword,
      first_name: "Admin",
      last_name: "User",
      role: "admin",
      is_active: true,
      is_verified: true,
    });

    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@journal.com");
    console.log("🔑 Password: admin123");

    // Mark admin setup as complete
    adminSetupComplete = true;
  } catch (error: any) {
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      console.log("✅ Admin user already exists (duplicate key detected)");
      console.log("📧 Email: admin@journal.com");
      console.log("🔑 Password: admin123");

      // Mark admin setup as complete
      adminSetupComplete = true;
      return;
    }

    console.error("❌ Failed to create admin user:", error.message);
    // Don't throw error for admin setup failures in production
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Admin setup failed, but continuing...");
    }
  }
}

// Function to check if the current request is from an authenticated admin
export async function ensureAdmin(
  request: NextRequest
): Promise<{ isAdmin: boolean; user?: any }> {
  try {
    await dbConnect();

    // For development, allow access if in development mode
    // Removed development mode bypass for better security

    // Get the admin session cookie from request
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return { isAdmin: false };
    }

    // Parse cookies manually
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);

    const adminSessionCookie = cookies["admin-session"];
    if (!adminSessionCookie) {
      return { isAdmin: false };
    }

    // Parse the session data
    const sessionData = JSON.parse(adminSessionCookie);

    if (!sessionData.userId || !sessionData.email) {
      return { isAdmin: false };
    }

    // Verify the user exists and is an admin
    const user = await User.findById(sessionData.userId);

    if (!user || user.role !== "admin" || !user.is_active) {
      return { isAdmin: false };
    }

    return {
      isAdmin: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return { isAdmin: false };
  }
}
