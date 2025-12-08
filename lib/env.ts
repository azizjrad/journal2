/**
 * Environment variable validation and type-safe access
 * This ensures all required environment variables are present at runtime
 */

interface EnvConfig {
  // MongoDB
  MONGODB_URI: string;

  // JWT & Auth
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_MONTHLY_PRICE_ID: string;
  STRIPE_ANNUAL_PRICE_ID: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;

  // SendGrid
  SENDGRID_API_KEY: string;
  FROM_EMAIL: string;
  FROM_NAME?: string;
  ADMIN_EMAIL?: string;
  REPLY_TO_EMAIL?: string;

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  // Redis (optional)
  REDIS_URL?: string;

  // App Config
  APP_BASE_URL: string;
  NODE_ENV: "development" | "production" | "test";

  // Optional
  BACKUP_INTERVAL?: string;
  BACKUP_TIME?: string;
}

/**
 * Validates that required environment variables are present
 * @throws Error if required variables are missing
 */
export function validateEnv(): EnvConfig {
  const requiredVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_MONTHLY_PRICE_ID",
    "STRIPE_ANNUAL_PRICE_ID",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "SENDGRID_API_KEY",
    "FROM_EMAIL",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ] as const;

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((v) => `  - ${v}`)
        .join("\n")}\n\nPlease check your .env.local file.`
    );
  }

  return {
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID!,
    STRIPE_ANNUAL_PRICE_ID: process.env.STRIPE_ANNUAL_PRICE_ID!,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
    FROM_EMAIL: process.env.FROM_EMAIL!,
    FROM_NAME: process.env.FROM_NAME || "Akhbarna",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    REPLY_TO_EMAIL: process.env.REPLY_TO_EMAIL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    REDIS_URL: process.env.REDIS_URL,
    APP_BASE_URL:
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_BASE_URL ||
      "http://localhost:3000",
    NODE_ENV: (process.env.NODE_ENV as any) || "development",
    BACKUP_INTERVAL: process.env.BACKUP_INTERVAL,
    BACKUP_TIME: process.env.BACKUP_TIME,
  };
}

/**
 * Get validated environment configuration
 * Caches the result after first validation
 */
let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Type-safe environment variable access
 */
export const env = new Proxy({} as EnvConfig, {
  get(_, prop: string) {
    const config = getEnv();
    return config[prop as keyof EnvConfig];
  },
});
