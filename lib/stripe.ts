import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

// Stripe Price IDs - You need to create these in your Stripe Dashboard
// and replace these values with your actual price IDs
export const STRIPE_PRICES = {
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || "price_basic_monthly",
    annual: process.env.STRIPE_BASIC_ANNUAL_PRICE_ID || "price_basic_annual",
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
    annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || "price_premium_annual",
  },
};

export const PLAN_DETAILS = {
  basic: {
    monthly: { amount: 4.99, interval: "month" },
    annual: { amount: 29.99, interval: "year" },
  },
  premium: {
    monthly: { amount: 9.99, interval: "month" },
    annual: { amount: 59.99, interval: "year" },
  },
};
