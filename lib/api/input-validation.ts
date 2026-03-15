/**
 * Input validation utilities for secure data handling
 */

// Email validation with comprehensive checks
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Email cannot be empty" };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: "Email is too long" };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Check for common typos in domains
  const commonDomains = ["gmail", "yahoo", "outlook", "hotmail"];
  const domain = trimmed.split("@")[1]?.toLowerCase();
  const typoCheck = commonDomains.some(
    (valid) =>
      domain?.includes(valid) &&
      (domain.includes("gmail.") || domain.includes("yahoo."))
  );

  if (typoCheck) {
    return {
      valid: false,
      error: "Email domain appears to have a typo",
    };
  }

  return { valid: true };
}

// Sanitize string input
export function sanitizeString(
  input: string,
  maxLength: number = 1000
): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Remove potential XSS characters
}

// Validate payment method
export function validatePaymentMethod(method: any): {
  valid: boolean;
  error?: string;
} {
  const validMethods = ["card", "paypal"];

  if (!method || typeof method !== "string") {
    return { valid: false, error: "Payment method is required" };
  }

  if (!validMethods.includes(method)) {
    return {
      valid: false,
      error: "Invalid payment method. Must be 'card' or 'paypal'",
    };
  }

  return { valid: true };
}

// Validate billing period
export function validateBillingPeriod(billing: any): {
  valid: boolean;
  error?: string;
} {
  const validPeriods = ["monthly", "annual"];

  if (!billing || typeof billing !== "string") {
    return { valid: false, error: "Billing period is required" };
  }

  if (!validPeriods.includes(billing)) {
    return {
      valid: false,
      error: "Invalid billing period. Must be 'monthly' or 'annual'",
    };
  }

  return { valid: true };
}

// Validate and sanitize user input for forms
export function validateFormInput(
  input: string,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 1000
): { valid: boolean; value?: string; error?: string } {
  if (!input || typeof input !== "string") {
    return { valid: false, error: `${fieldName} is required` };
  }

  const sanitized = sanitizeString(input, maxLength);

  if (sanitized.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
    };
  }

  return { valid: true, value: sanitized };
}

// Validate URL
export function validateURL(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "Invalid URL protocol" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

// Check for SQL injection patterns (basic)
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|JAVASCRIPT|ONERROR)/i,
    /--|;|\/\*|\*\/|xp_|sp_/,
    /(\s|^)OR(\s|$)/i,
    /1\s*=\s*1/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

// Check for XSS patterns
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

// Comprehensive input validation
export function validateAndSanitize(
  input: string,
  fieldName: string,
  options: {
    minLength?: number;
    maxLength?: number;
    checkSQL?: boolean;
    checkXSS?: boolean;
  } = {}
): { valid: boolean; value?: string; error?: string } {
  const {
    minLength = 1,
    maxLength = 1000,
    checkSQL = true,
    checkXSS = true,
  } = options;

  // Basic validation
  const basicValidation = validateFormInput(
    input,
    fieldName,
    minLength,
    maxLength
  );

  if (!basicValidation.valid) {
    return basicValidation;
  }

  const sanitized = basicValidation.value!;

  // Check for SQL injection
  if (checkSQL && detectSQLInjection(sanitized)) {
    return {
      valid: false,
      error: `${fieldName} contains potentially malicious content`,
    };
  }

  // Check for XSS
  if (checkXSS && detectXSS(sanitized)) {
    return {
      valid: false,
      error: `${fieldName} contains potentially malicious content`,
    };
  }

  return { valid: true, value: sanitized };
}
