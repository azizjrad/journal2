import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getNewsletterSubscriptionByUserId } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken(authToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Get subscription from database
    const subscription = await getNewsletterSubscriptionByUserId(
      payload.userId
    );

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    // Get latest subscription details from Stripe
    let stripeSubscription = null;
    try {
      if (subscription.stripe_subscription_id) {
        stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
      }
    } catch (error) {
      console.error("Failed to fetch Stripe subscription:", error);
      // Continue with database data if Stripe fetch fails
    }

    // Combine database and Stripe data
    const subscriptionData = {
      id: subscription.id,
      plan: subscription.plan,
      billing_period: subscription.billing_period,
      amount: subscription.amount,
      status: stripeSubscription?.status || subscription.status,
      current_period_start: stripeSubscription
        ? new Date(stripeSubscription.current_period_start * 1000)
        : subscription.current_period_start,
      current_period_end: stripeSubscription
        ? new Date(stripeSubscription.current_period_end * 1000)
        : subscription.current_period_end,
      cancel_at_period_end:
        stripeSubscription?.cancel_at_period_end ||
        subscription.cancel_at_period_end ||
        false,
      canceled_at: subscription.canceled_at || null,
      trial_end: stripeSubscription?.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      payment_method: subscription.payment_method || null,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_customer_id: subscription.stripe_customer_id,
    };

    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscription",
      },
      { status: 500 }
    );
  }
}
