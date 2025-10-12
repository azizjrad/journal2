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
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly",
  annual: process.env.STRIPE_ANNUAL_PRICE_ID || "price_annual",
};

export const PLAN_DETAILS = {
  monthly: {
    amount: 4.0,
    interval: "month",
    displayPrice: "$4/month",
    description: "Renews automatically for $4/month",
    renewalAmount: 4.0,
  },
  annual: {
    amount: 24.0,
    interval: "year",
    displayPrice: "$2/month",
    description:
      "Charged as $24 for first year (first month FREE). Renews at $48/year.",
    renewalAmount: 48.0,
  },
};
