import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, UserProfile } from "@/lib/models/User";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/api/auth/google/callback`;
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

async function exchangeCodeForToken(code: string) {
  const tokenURL = "https://oauth2.googleapis.com/token";

  const response = await fetch(tokenURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  return response.json();
}

async function getUserInfo(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get user info from Google");
  }

  return response.json();
}

function generateUsername(email: string, name: string) {
  // Create username from email or name
  let baseUsername = email.split("@")[0];

  // If name is available, try to use it
  if (name) {
    baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseUsername}_${randomSuffix}`;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/auth?error=oauth_error`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/auth?error=missing_code`
      );
    }

    // Parse state to get action
    let action = "login";
    try {
      if (state) {
        const parsedState = JSON.parse(state);
        action = parsedState.action || "login";
      }
    } catch (e) {
      console.warn("Failed to parse state:", e);
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    const { access_token } = tokenData;

    // Get user info from Google
    const googleUser = await getUserInfo(access_token);
    const {
      id: google_id,
      email,
      given_name,
      family_name,
      name,
      picture,
    } = googleUser;

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ google_id }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Existing user - update Google ID if not set
      if (!user.google_id && user.email === email.toLowerCase()) {
        await User.findByIdAndUpdate(user._id, {
          google_id,
          auth_provider: "google",
          is_verified: true, // Google emails are pre-verified
          last_login: new Date(),
        });
      } else {
        // Just update last login
        await User.findByIdAndUpdate(user._id, {
          last_login: new Date(),
        });
      }
    } else {
      if (action === "register") {
        // Create new user
        const username = await generateUniqueUsername(email, name);

        user = new User({
          username,
          email: email.toLowerCase(),
          google_id,
          auth_provider: "google",
          first_name: given_name || "",
          last_name: family_name || "",
          is_verified: true, // Google emails are pre-verified
          is_active: true,
          role: "user",
          last_login: new Date(),
        });

        await user.save();

        // Create user profile
        const userProfile = new UserProfile({
          user_id: user._id,
          display_name:
            name || `${given_name || ""} ${family_name || ""}`.trim(),
        });

        await userProfile.save();

        console.log(`✅ New user registered via Google: ${email}`);
      } else {
        // Login attempt but user doesn't exist
        return NextResponse.redirect(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/auth?error=user_not_found`
        );
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response with redirect
    let redirectUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}`;

    if (user.role === "admin") {
      redirectUrl += "/admin";
    } else {
      redirectUrl += "/profile";
    }

    const response = NextResponse.redirect(redirectUrl);

    // Set appropriate cookie based on user role
    if (user.role === "admin") {
      response.cookies.set("admin-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    } else {
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    console.log(`✅ Google OAuth ${action} successful for: ${email}`);
    return response;
  } catch (error: any) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/auth?error=oauth_callback_error`
    );
  }
}

async function generateUniqueUsername(
  email: string,
  name: string
): Promise<string> {
  let baseUsername = generateUsername(email, name);
  let username = baseUsername;
  let counter = 1;

  // Check if username exists and generate unique one
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}
