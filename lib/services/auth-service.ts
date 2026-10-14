import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Types } from "mongoose";
import { getEnv } from "@/lib/config/env";
import type { UserInterface } from "@/lib/user";
import { getUserByEmail, getUserById, updateLastLogin } from "@/lib/user";
import { dbConnect } from "@/lib/db/connection";
import { UserSession, UserActivityLog } from "@/lib/models/User";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LoginResult {
  success: boolean;
  user?: Omit<UserInterface, "password_hash">;
  token?: string;
  message?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: Omit<UserInterface, "password_hash">;
  message?: string;
}

const JWT_SECRET = getEnv("JWT_SECRET", "development-secret-change-me");
const JWT_EXPIRES_IN = getEnv("JWT_EXPIRES_IN", "7d");
export const SESSION_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export async function createUserSession(
  userId: string,
  sessionToken: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await dbConnect();

  await UserSession.create({
    user_id: new Types.ObjectId(userId),
    session_token: sessionToken,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
}

export async function getUserSession(sessionToken: string): Promise<any> {
  await dbConnect();

  return await UserSession.findOne({
    session_token: sessionToken,
    expires_at: { $gt: new Date() },
  }).lean();
}

export async function deleteUserSession(sessionToken: string): Promise<void> {
  await dbConnect();

  await UserSession.deleteOne({ session_token: sessionToken });
}

export async function logUserActivity(
  userId: string,
  action: string,
  description?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>,
): Promise<void> {
  await dbConnect();

  await UserActivityLog.create({
    user_id: new Types.ObjectId(userId),
    action,
    description,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: metadata || {},
  });
}

export async function authenticateUser(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<LoginResult> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    if (!user.is_active) {
      return { success: false, message: "Account is deactivated" };
    }

    if (!user.password_hash) {
      return { success: false, message: "Account not properly configured" };
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      if (user.id) {
        await logUserActivity(
          user.id,
          "LOGIN_FAILED",
          "Invalid password attempt",
          ipAddress,
          userAgent,
        );
      }
      return { success: false, message: "Invalid email or password" };
    }

    if (user.id) {
      await updateLastLogin(user.id);
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN);

    if (user.id) {
      await createUserSession(
        user.id,
        sessionToken,
        expiresAt,
        ipAddress,
        userAgent,
      );
    }

    const tokenPayload: AuthTokenPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    if (user.id) {
      await logUserActivity(
        user.id,
        "LOGIN_SUCCESS",
        "User logged in successfully",
        ipAddress,
        userAgent,
      );
    }

    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
      token,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, message: "Authentication failed" };
  }
}

export async function verifySession(
  sessionToken: string,
): Promise<UserInterface | null> {
  try {
    const session = await getUserSession(sessionToken);

    if (!session) {
      return null;
    }

    const user = await getUserById(session.user_id.toString());
    return user;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

export async function logoutUser(
  sessionToken: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    await deleteUserSession(sessionToken);

    if (userId) {
      await logUserActivity(
        userId,
        "LOGOUT",
        "User logged out",
        ipAddress,
        userAgent,
      );
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await dbConnect();
    await UserSession.deleteMany({
      expires_at: { $lt: new Date() },
    });
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
