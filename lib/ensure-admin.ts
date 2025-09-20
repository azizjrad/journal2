// Ensures at least one admin exists in the database. Creates a default admin if none found.
export async function ensureAdminExists() {
  await dbConnect();
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    const defaultAdmin = new User({
      username: "admin",
      email: "admin@journal.com",
      password_hash: "$2b$10$QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm", // Replace with a real bcrypt hash
      role: "admin",
      is_active: true,
      is_verified: true,
      first_name: "Admin",
      last_name: "User",
    });
    await defaultAdmin.save();
    console.log("Default admin user created: admin@journal.com / admin123");
    return defaultAdmin;
  }
  return admin;
}
import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";

// Function to check if the current request is from an authenticated admin
export async function ensureAdmin(
  request: NextRequest
): Promise<{ isAdmin: boolean; user?: any }> {
  try {
    await dbConnect();

    // For development, allow access if in development mode
    // Removed development mode bypass for better security

    // Get cookies from request
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      console.warn("[ensureAdmin] No cookie header found");
      return { isAdmin: false };
    }

    // Parse cookies manually
    const cookies = cookieHeader
      .split(";")
      .reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {} as Record<string, string>);
    console.log("[ensureAdmin] Cookies:", cookies);

    // Only accept 'admin-token' for admin JWT authentication
    const jwtToken = cookies["admin-token"];
    console.log(
      "[ensureAdmin] admin-token value:",
      jwtToken ? jwtToken.slice(0, 12) + "..." : null
    );
    if (jwtToken) {
      try {
        const { verifyToken } = await import("@/lib/auth");
        const payload = verifyToken(jwtToken);
        console.log("[ensureAdmin] Decoded JWT payload:", payload);
        if (payload && payload.userId && payload.role === "admin") {
          const user = await User.findById(payload.userId);
          console.log("[ensureAdmin] User from JWT:", user);
          if (user && user.role === "admin" && user.is_active) {
            return {
              isAdmin: true,
              user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
              },
            };
          }
        }
      } catch (err) {
        console.warn("[ensureAdmin] JWT auth error:", err);
      }
    }

    console.warn(
      "[ensureAdmin] Admin check failed. No valid admin session or JWT."
    );
    return { isAdmin: false };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return { isAdmin: false };
  }
}
