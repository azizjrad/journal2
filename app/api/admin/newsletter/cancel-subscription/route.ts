import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ensureAdmin } from "@/lib/ensure-admin";
import {
  getNewsletterSubscriptionById,
  updateNewsletterSubscription,
} from "@/lib/db";
import { sendSubscriptionCancellationEmail } from "@/lib/email-sendgrid";
import { getUserById } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

/**
 * POST /api/admin/newsletter/cancel-subscription
 * Admin endpoint to cancel a user's subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure admin authentication
    const adminResult = await ensureAdmin(request);
    if (!adminResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscriptionId, reason } = body;

    // Validate input
    if (!subscriptionId || typeof subscriptionId !== "string") {
      return NextResponse.json(
        { success: false, error: "subscription_id is required" },
        { status: 400 }
      );
    }

    // Get subscription from database
    const subscription = await getNewsletterSubscriptionById(subscriptionId);
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Check if already canceled
    if (subscription.status === "canceled") {
      return NextResponse.json(
        { success: false, error: "Subscription is already canceled" },
        { status: 400 }
      );
    }

    // Get user data for email
    const user = await getUserById(subscription.user_id.toString());
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Cancel in Stripe immediately
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id, {
          // Cancel immediately instead of at period end
          prorate: false,
        });
      } catch (stripeError: any) {
        console.error("Stripe cancellation error:", stripeError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to cancel in Stripe: ${stripeError.message}`,
          },
          { status: 500 }
        );
      }
    }

    // Update subscription in database
    await updateNewsletterSubscription(subscriptionId, {
      status: "canceled",
      canceledAt: new Date(),
      cancelAtPeriodEnd: false,
    });

    // Send cancellation email
    try {
      await sendSubscriptionCancellationEmail({
        email: user.email,
        userName: user.first_name || user.email.split("@")[0],
        plan: subscription.plan === "annual" ? "annual" : "monthly",
        cancelAtPeriodEnd: false,
        periodEndDate: subscription.current_period_end
          ? new Date(subscription.current_period_end)
          : new Date(),
        canceledByAdmin: true,
        reason: reason,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
      // Don't fail the request if email fails
    }

    // Log admin action
    console.log(
      `[ADMIN ACTION] Admin ${
        adminResult.user?.id || "unknown"
      } canceled subscription ${subscriptionId} for user ${
        user.email
      }. Reason: ${reason || "None provided"}`
    );

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
      data: {
        subscriptionId,
        status: "canceled",
        canceledAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel subscription",
      },
      { status: 500 }
    );
  }
}
