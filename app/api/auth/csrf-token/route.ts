import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const response = NextResponse.json({ success: true });
  const csrfToken = generateCsrfToken();
  setCsrfCookie(response, csrfToken);
  return response;
}
