import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  createNewsletterSubscription,
  updateNewsletterSubscription,
  getNewsletterSubscriptionByStripeId,
  getUserById,
} from "@/lib/db";
import Stripe from "stripe";

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = readable.getReader();

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await buffer(request.body!);
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get subscription details
        if (session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan as "basic" | "premium";
          const billing = session.metadata?.billing as "monthly" | "annual";

          if (!userId || !plan || !billing) {
            console.error("Missing metadata in checkout session");
            break;
          }

          // Get payment method details
          let paymentMethod;
          if (subscription.default_payment_method) {
            const pm = await stripe.paymentMethods.retrieve(
              subscription.default_payment_method as string
            );
            paymentMethod = {
              type: pm.type,
              last4: pm.card?.last4,
              brand: pm.card?.brand,
            };
          }

          // Create subscription in database
          await createNewsletterSubscription({
            userId,
            subscriptionId: subscription.id,
            plan,
            billingPeriod: billing,
            amount: subscription.items.data[0].price.unit_amount! / 100,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            paymentMethod,
          });

          console.log(`✅ Created subscription for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        await updateNewsletterSubscription(subscription.id, {
          status: subscription.status === "active" ? "active" : 
                  subscription.status === "past_due" ? "past_due" : 
                  subscription.status === "canceled" ? "canceled" : "incomplete",
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        console.log(`✅ Updated subscription ${subscription.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await updateNewsletterSubscription(subscription.id, {
          status: "canceled",
          canceledAt: new Date(),
        });

        console.log(`✅ Canceled subscription ${subscription.id}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          await updateNewsletterSubscription(subscription.id, {
            status: "active",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });

          console.log(`✅ Payment succeeded for subscription ${subscription.id}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          await updateNewsletterSubscription(invoice.subscription as string, {
            status: "past_due",
          });

          console.log(`⚠️ Payment failed for subscription ${invoice.subscription}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
