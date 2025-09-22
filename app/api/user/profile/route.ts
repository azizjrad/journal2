import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  getUserProfile,
  updateUser,
  updateUserProfile,
  logUserActivity,
} from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET user profile
export async function GET(request: NextRequest) {
  try {
    // Always prevent caching of profile responses
    const noStoreHeaders = { "Cache-Control": "no-store" };
    // Get user from token - check auth-token, admin-token, and writer-token
    const authToken = request.cookies.get("auth-token")?.value;
    const adminToken = request.cookies.get("admin-token")?.value;
    const writerToken = request.cookies.get("writer-token")?.value;
    const token = authToken || adminToken || writerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    // Get user and profile
    const [user, profile] = await Promise.all([
      getUserById(tokenPayload.userId),
      getUserProfile(tokenPayload.userId),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: noStoreHeaders }
      );
    }

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    return NextResponse.json(
      {
        success: true,
        user: userResponse,
        profile,
      },
      { headers: noStoreHeaders }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get profile" },
      { status: 500, headers: noStoreHeaders }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get user from token - check both auth-token and admin-token
    const authToken = request.cookies.get("auth-token")?.value;
    const adminToken = request.cookies.get("admin-token")?.value;
    const token = authToken || adminToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      bio,
      avatarUrl,
      displayName,
      website,
      location,
      socialTwitter,
      socialLinkedin,
      socialGithub,
      preferences,
    } = body;

    // Update user basic info
    const userUpdates: any = {};
    if (firstName !== undefined) userUpdates.first_name = firstName;
    if (lastName !== undefined) userUpdates.last_name = lastName;
    if (bio !== undefined) userUpdates.bio = bio;
    if (avatarUrl !== undefined) userUpdates.avatar_url = avatarUrl;

    if (Object.keys(userUpdates).length > 0) {
      await updateUser(tokenPayload.userId, userUpdates);
    }

    // Update user profile
    const profileUpdates: any = {};
    if (displayName !== undefined) profileUpdates.display_name = displayName;
    if (website !== undefined) profileUpdates.website = website;
    if (location !== undefined) profileUpdates.location = location;
    if (socialTwitter !== undefined)
      profileUpdates.social_twitter = socialTwitter;
    if (socialLinkedin !== undefined)
      profileUpdates.social_linkedin = socialLinkedin;
    if (socialGithub !== undefined) profileUpdates.social_github = socialGithub;
    if (preferences !== undefined) profileUpdates.preferences = preferences;

    if (Object.keys(profileUpdates).length > 0) {
      await updateUserProfile(tokenPayload.userId, profileUpdates);
    }

    // Log profile update activity
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;
    await logUserActivity(
      tokenPayload.userId,
      "PROFILE_UPDATED",
      "User profile information updated",
      clientIP,
      userAgent
    );

    // Get updated data
    const [updatedUser, updatedProfile] = await Promise.all([
      getUserById(tokenPayload.userId),
      getUserProfile(tokenPayload.userId),
    ]);

    // Remove password hash from response
    const { password_hash, ...userResponse } = updatedUser!;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
