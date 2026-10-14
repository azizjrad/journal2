export {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateSecureToken,
  generateSessionToken,
  createUserSession,
  getUserSession,
  deleteUserSession,
  logUserActivity,
  authenticateUser,
  verifySession,
  logoutUser,
  cleanupExpiredSessions,
  isValidEmail,
  isValidPassword,
  validatePasswordStrength,
} from "@/lib/services/auth-service";
export {
  createEmailVerificationToken,
  createPasswordResetToken,
  getEmailVerificationToken,
  getPasswordResetToken,
  markEmailVerificationTokenAsUsed,
  markPasswordResetTokenAsUsed,
} from "@/lib/services/auth-token-service";

import type { UserInterface } from "@/lib/user";

export type {
  AuthTokenPayload,
  LoginResult,
  RegisterResult,
} from "@/lib/services/auth-service";

/**
 * Role-based authorization helpers
 */

/**
 * Check if user has required role(s)
 */
export function hasRole(
  user: UserInterface,
  requiredRole: string | string[],
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
  contentOwnerId?: string,
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
 * Get email verification expiry date (1 hour from now)
 */
export function getEmailVerificationExpiry(): Date {
  return new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
}

/**
 * Get password reset token expiry date (1 hour from now)
 */
export function getPasswordResetExpiry(): Date {
  return new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
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
  windowMs: number = 15 * 60 * 1000, // 15 minutes
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
