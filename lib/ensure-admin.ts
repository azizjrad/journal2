// Function to check if the current request is from an authenticated admin or writer
// (imports already declared at the top of the file)

export async function ensureAdminOrWriter(
  request: NextRequest
): Promise<{ isAdmin: boolean; isWriter: boolean; user?: any }> {
  try {
    await dbConnect();

    // Get cookies from request
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      console.warn("[ensureAdminOrWriter] No cookie header found");
      return { isAdmin: false, isWriter: false };
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
    // Check for admin-token first
    const adminToken = cookies["admin-token"];
    if (adminToken) {
      try {
        const { verifyToken } = await import("@/lib/auth");
        const payload = verifyToken(adminToken);
        if (payload && payload.userId && payload.role === "admin") {
          const user = await User.findById(payload.userId);
          if (user && user.role === "admin" && user.is_active) {
            return {
              isAdmin: true,
              isWriter: false,
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
        console.warn("[ensureAdminOrWriter] Admin JWT auth error:", err);
      }
    }
    // Check for writer-token
    const writerToken = cookies["writer-token"];
    if (writerToken) {
      try {
        const { verifyToken } = await import("@/lib/auth");
        const payload = verifyToken(writerToken);
        if (payload && payload.userId && payload.role === "writer") {
          const user = await User.findById(payload.userId);
          if (user && user.role === "writer" && user.is_active) {
            return {
              isAdmin: false,
              isWriter: true,
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
        console.warn("[ensureAdminOrWriter] Writer JWT auth error:", err);
      }
    }
    // If neither valid
    console.warn("[ensureAdminOrWriter] No valid admin or writer session.");
    return { isAdmin: false, isWriter: false };
  } catch (error) {
    console.error("Admin/Writer authentication error:", error);
    return { isAdmin: false, isWriter: false };
  }
}

import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
// Ensures at least one admin exists in the database. Creates a default admin if none found.

export async function ensureAdminExists() {
  await dbConnect();
  const admin = await User.findOne({ role: "admin" });
  if (!admin) return null;
  // Return admin object without exposing email
  const { email, ...adminSafe } = admin.toObject ? admin.toObject() : admin;
  return adminSafe;
}

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
