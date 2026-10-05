import {
  cancelNewsletterSubscription as cancelNewsletterSubscriptionDb,
  createNewsletterSubscription as createNewsletterSubscriptionDb,
  getNewsletterSubscriptionById as getNewsletterSubscriptionByIdDb,
  getNewsletterSubscriptionByStripeId as getNewsletterSubscriptionByStripeIdDb,
  getNewsletterSubscriptionByUserId as getNewsletterSubscriptionByUserIdDb,
  updateNewsletterSubscription as updateNewsletterSubscriptionDb,
} from "@/lib/db";

export type NewsletterPlan = "monthly" | "annual";
export type NewsletterBillingPeriod = "monthly" | "annual";
export type NewsletterStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "incomplete";

export interface NewsletterSubscriptionPaymentMethod {
  type: string;
  last4?: string;
  brand?: string;
  expires?: {
    month: number;
    year: number;
  };
}

export interface CreateNewsletterSubscriptionInput {
  userId: string;
  subscriptionId: string;
  plan: NewsletterPlan;
  billingPeriod: NewsletterBillingPeriod;
  amount: number;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  paymentMethod?: NewsletterSubscriptionPaymentMethod;
}

export interface UpdateNewsletterSubscriptionInput {
  status?: NewsletterStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd?: boolean;
  paymentMethod?: NewsletterSubscriptionPaymentMethod;
}

export async function createNewsletterSubscription(
  data: CreateNewsletterSubscriptionInput,
): Promise<any> {
  return createNewsletterSubscriptionDb(data);
}

export async function getNewsletterSubscriptionByStripeId(
  stripeSubscriptionId: string,
): Promise<any> {
  return getNewsletterSubscriptionByStripeIdDb(stripeSubscriptionId);
}

export async function getNewsletterSubscriptionByUserId(
  userId: string,
): Promise<any> {
  return getNewsletterSubscriptionByUserIdDb(userId);
}

export async function getNewsletterSubscriptionById(
  subscriptionId: string,
): Promise<any> {
  return getNewsletterSubscriptionByIdDb(subscriptionId);
}

export async function updateNewsletterSubscription(
  subscriptionId: string,
  updates: UpdateNewsletterSubscriptionInput,
): Promise<any> {
  return updateNewsletterSubscriptionDb(subscriptionId, updates);
}

export async function cancelNewsletterSubscription(
  subscriptionId: string,
): Promise<any> {
  return cancelNewsletterSubscriptionDb(subscriptionId);
}
