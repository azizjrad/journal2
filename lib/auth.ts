import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  UserInterface,
  getUserByEmail,
  getUserById,
  updateLastLogin,
} from "./db";
import { UserSession, UserActivityLog } from "./models/User";
import { Types } from "mongoose";
import dbConnect from "./dbConnect";

// JWT Configuration
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SESSION_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Generate a secure random token for password reset, email verification, etc.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

// MongoDB session management functions
export async function createUserSession(
  userId: string,
  sessionToken: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string
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
  metadata?: Record<string, any>
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

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  try {
    // Get user by email
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

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Log failed login attempt
      if (user.id) {
        await logUserActivity(
          user.id,
          "LOGIN_FAILED",
          "Invalid password attempt",
          ipAddress,
          userAgent
        );
      }
      return { success: false, message: "Invalid email or password" };
    }

    // Update last login
    if (user.id) {
      await updateLastLogin(user.id);
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN);

    if (user.id) {
      await createUserSession(
        user.id,
        sessionToken,
        expiresAt,
        ipAddress,
        userAgent
      );
    }

    // Generate JWT token
    const tokenPayload: AuthTokenPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    // Log successful login
    if (user.id) {
      await logUserActivity(
        user.id,
        "LOGIN_SUCCESS",
        "User logged in successfully",
        ipAddress,
        userAgent
      );
    }

    // Remove password hash from response
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

/**
 * Verify if a user session is valid
 */
export async function verifySession(
  sessionToken: string
): Promise<UserInterface | null> {
  try {
    const session = await getUserSession(sessionToken);

    if (!session) {
      return null;
    }

    // Get the user
    const user = await getUserById(session.user_id.toString());

    return user;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Logout user (invalidate session)
 */
export async function logoutUser(
  sessionToken: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    // Delete session
    await deleteUserSession(sessionToken);

    // Log logout
    if (userId) {
      await logUserActivity(
        userId,
        "LOGOUT",
        "User logged out",
        ipAddress,
        userAgent
      );
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Role-based authorization helpers
 */

/**
 * Check if user has required role(s)
 */
export function hasRole(
  user: UserInterface,
  requiredRole: string | string[]
): boolean {
  if (!user || !user.role) {
    return false;
  }

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserInterface): boolean {
  return hasRole(user, "admin");
}

/**
 * Check if user can write content (admin or writer)
 */
export function canWrite(user: UserInterface): boolean {
  return hasRole(user, ["admin", "writer"]);
}

/**
 * Check if user can edit specific content
 */
export function canEditContent(
  user: UserInterface,
  contentOwnerId?: string
): boolean {
  // Admins can edit everything
  if (isAdmin(user)) {
    return true;
  }

  // Writers can edit their own content
  if (hasRole(user, "writer") && contentOwnerId && user.id === contentOwnerId) {
    return true;
  }

  return false;
}

/**
 * Middleware helper for role checking
 */
export function requireRole(requiredRole: string | string[]) {
  return (user: UserInterface | null): boolean => {
    if (!user) {
      return false;
    }

    return hasRole(user, requiredRole);
  };
}

/**
 * Clean up expired sessions
 */
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

/**
 * Security helpers
 */

/**
 * Check if email is valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if password meets requirements
 */
export function isValidPassword(password: string): boolean {
  // At least 6 characters, contains letter and number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate password strength with detailed feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!/[A-Za-z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get email verification expiry date (24 hours from now)
 */
export function getEmailVerificationExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent XSS
    .replace(/script/gi, "") // Remove script tags
    .slice(0, 1000); // Limit length
}

/**
 * Rate limiting helper (basic implementation)
 */
const attemptCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const attempts = attemptCounts.get(identifier);

  if (!attempts || now > attempts.resetTime) {
    attemptCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (attempts.count >= maxAttempts) {
    return false;
  }

  attempts.count++;
  return true;
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier: string): void {
  attemptCounts.delete(identifier);
}

/**
 * Clear rate limit for identifier (alias for resetRateLimit)
 */
export function clearRateLimit(identifier: string): void {
  resetRateLimit(identifier);
}
