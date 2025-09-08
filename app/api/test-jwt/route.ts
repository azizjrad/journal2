import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Get test user data
    const testPayload = {
      userId: "test-user-id",
      email: "test@example.com",
      role: "admin",
    };

    // Generate token
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: "1h" });

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return NextResponse.json({
      success: true,
      message: "JWT tokens are working correctly",
      test_results: {
        secret_configured: !!process.env.JWT_SECRET,
        secret_length: process.env.JWT_SECRET?.length || 0,
        token_generated: !!token,
        token_length: token.length,
        token_verified: !!decoded,
        payload_match:
          JSON.stringify(testPayload) ===
          JSON.stringify({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          }),
        expires_at: new Date(decoded.exp * 1000).toISOString(),
      },
      sample_token: token.substring(0, 50) + "...", // Show first 50 chars only for security
      decoded_payload: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        issued_at: new Date(decoded.iat * 1000).toISOString(),
        expires_at: new Date(decoded.exp * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "JWT token test failed",
        error: error.message,
        debug_info: {
          secret_configured: !!process.env.JWT_SECRET,
          secret_length: process.env.JWT_SECRET?.length || 0,
        },
      },
      { status: 500 }
    );
  }
}
