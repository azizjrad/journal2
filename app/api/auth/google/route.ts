import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "login"; // 'login' or 'register'

    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Google OAuth not configured" },
        { status: 500 }
      );
    }

    // Store the action in a way that can be retrieved in callback
    const state = JSON.stringify({ action });

    const googleAuthURL = new URL("https://accounts.google.com/o/oauth2/auth");
    googleAuthURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    googleAuthURL.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
    googleAuthURL.searchParams.set("response_type", "code");
    googleAuthURL.searchParams.set("scope", "openid email profile");
    googleAuthURL.searchParams.set("state", state);

    return NextResponse.redirect(googleAuthURL.toString());
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}
