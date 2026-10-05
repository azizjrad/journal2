export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];

  if (value !== undefined && value !== "") {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  return "";
}

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  appBaseUrl: getEnv("APP_BASE_URL", "http://localhost:3000"),
  siteUrl: getEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  nodeEnv: getEnv("NODE_ENV", "development"),
  mongoDbUri: getEnv("MONGODB_URI"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
  stripeSecretKey: getEnv("STRIPE_SECRET_KEY"),
  stripeMonthlyPriceId: getEnv("STRIPE_MONTHLY_PRICE_ID"),
  stripeAnnualPriceId: getEnv("STRIPE_ANNUAL_PRICE_ID"),
};
