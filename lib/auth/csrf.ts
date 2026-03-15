// lib/csrf.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32;

export function generateCsrfToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export function setCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by client JS
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
}

export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Try header first
  const headerToken = request.headers.get(CSRF_HEADER);
  if (headerToken) return headerToken;
  // Fallback to cookie
  return request.cookies.get(CSRF_COOKIE)?.value || null;
}

export function validateCsrf(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}
