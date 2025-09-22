import { NextRequest, NextResponse } from "next/server";
import { User, RefreshToken } from "@/lib/models/User";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies (try all possible roles)
    const cookies = request.cookies;
    const refreshToken =
      cookies.get("admin-refresh")?.value ||
      cookies.get("writer-refresh")?.value ||
      cookies.get("auth-refresh")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    // Find refresh token in DB
    const dbToken = await RefreshToken.findOne({ token: refreshToken, revoked: false });
    if (!dbToken || dbToken.expires_at < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    // Get user
    const user = await User.findById(dbToken.user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: noStoreHeaders }
      );
    }

    // Rotate refresh token: revoke old, create new
    dbToken.revoked = true;
    const newRefreshTokenValue = crypto.randomBytes(48).toString("hex");
    dbToken.replaced_by = newRefreshTokenValue;
    await dbToken.save();
    const newRefreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await RefreshToken.create({
      user_id: user._id,
      token: newRefreshTokenValue,
      expires_at: newRefreshTokenExpiry,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || undefined,
    });

    // Issue new access token (15 min)
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "15m" });

    // Set cookies
    const isProd = process.env.NODE_ENV === "production";
    const accessCookieOptions = {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: "strict" as const,
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    };
    const refreshCookieOptions = {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: "strict" as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    };
    let accessCookieName = "auth-token";
    let refreshCookieName = "auth-refresh";
    if (user.role === "admin") {
      accessCookieName = "admin-token";
      refreshCookieName = "admin-refresh";
    } else if (user.role === "writer") {
      accessCookieName = "writer-token";
      refreshCookieName = "writer-refresh";
    }

    const response = NextResponse.json(
      { success: true, message: "Token refreshed" },
      { headers: noStoreHeaders }
    );
    response.cookies.set(accessCookieName, accessToken, accessCookieOptions);
    response.cookies.set(refreshCookieName, newRefreshTokenValue, refreshCookieOptions);
    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to refresh token" },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
