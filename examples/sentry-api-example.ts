/**
 * Example: How to add Sentry tracking to an API route
 *
 * This shows best practices for error tracking in your Next.js API
 */

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  trackDatabaseError,
  trackAPIError,
  setUserContext,
  addBreadcrumb,
} from "@/lib/sentry";
import { getUserByEmail, dbConnect } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Add breadcrumb for debugging
    addBreadcrumb("Login attempt started", "auth", {
      endpoint: "/api/auth/login",
    });

    const { email, password } = await request.json();

    // Connect to database
    try {
      await dbConnect();
      addBreadcrumb("Database connected", "database");
    } catch (dbError) {
      // Track database connection errors
      trackDatabaseError(dbError as Error, "connection", "mongodb");
      throw dbError;
    }

    // Get user from database
    let user;
    try {
      user = await getUserByEmail(email);

      if (!user) {
        addBreadcrumb("User not found", "auth", { email });
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      addBreadcrumb("User found", "auth", { userId: user.id });
    } catch (error) {
      // Track database query errors
      trackDatabaseError(error as Error, "query", "users");
      throw error;
    }

    // Verify password (your logic here)
    // const isValid = await verifyPassword(password, user.password_hash);

    // Set user context for future errors
    if (user.id) {
      setUserContext({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }

    addBreadcrumb("Login successful", "auth", { userId: user.id });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    // Catch-all error tracking
    console.error("Login error:", error);

    // Track to Sentry with context
    trackAPIError(error as Error, "/api/auth/login", "POST", 500);

    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
