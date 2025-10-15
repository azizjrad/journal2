import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  createNewsletterSubscription,
  updateNewsletterSubscription,
  getNewsletterSubscriptionByStripeId,
  getUserById,
} from "@/lib/db";
import {
  sendSubscriptionConfirmationEmail,
  sendSubscriptionCancellationEmail,
  sendSubscriptionRenewalEmail,
} from "@/lib/email-sendgrid";
import type Stripe from "stripe";
import { User } from "@/lib/models/User";

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
      {
        error: `Webhook Error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("🔍 Checkout session completed:", {
          sessionId: session.id,
          customer: session.customer,
          subscription: session.subscription,
          metadata: session.metadata,
        });

        // Get subscription details
        if (session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          console.log("🔍 Retrieved subscription:", {
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            trial_end: subscription.trial_end,
          });

          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan as "monthly" | "annual"; // Plan is now monthly or annual
          const billing = session.metadata?.billing as "monthly" | "annual";

          if (!userId || !plan || !billing) {
            console.error("❌ Missing metadata in checkout session:", {
              userId,
              plan,
              billing,
            });
            break;
          }

          // Get payment method details
          let paymentMethod: any = undefined;
          if (subscription.default_payment_method) {
            const pm = await stripe.paymentMethods.retrieve(
              subscription.default_payment_method as string
            );

            // Match the schema structure - payment_method has nested fields
            if (pm.card) {
              paymentMethod = {
                type: pm.type, // 'card', 'paypal', etc.
                last4: pm.card.last4,
                brand: pm.card.brand,
                expires: {
                  month: pm.card.exp_month,
                  year: pm.card.exp_year,
                },
              };
            } else {
              paymentMethod = {
                type: pm.type,
              };
            }
          }

          // Handle trial subscriptions where current_period_start/end might be undefined
          const currentPeriodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000)
            : subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : new Date();

          const currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now as fallback

          console.log("🔍 About to create subscription in DB with:", {
            userId,
            subscriptionId: subscription.id,
            plan,
            billingPeriod: billing,
            amount: subscription.items.data[0].price.unit_amount! / 100,
            currentPeriodStart,
            currentPeriodEnd,
          });

          // Create subscription in database
          try {
            await createNewsletterSubscription({
              userId,
              subscriptionId: subscription.id,
              plan,
              billingPeriod: billing,
              amount: subscription.items.data[0].price.unit_amount! / 100,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: session.customer as string,
              currentPeriodStart,
              currentPeriodEnd,
              paymentMethod,
            });

            console.log(`✅ Created subscription for user ${userId}`);

            // If subscription has a trial and user hasn't used trial before, mark it as used
            if (
              subscription.status === "trialing" &&
              subscription.trial_end &&
              session.metadata?.will_use_trial === "true"
            ) {
              await User.findByIdAndUpdate(userId, {
                has_used_trial: true,
                trial_used_at: new Date(),
              });

              console.log(
                `✅ Marked user ${userId} as having used their free trial`
              );
            }
          } catch (dbError) {
            console.error("❌ Database error creating subscription:", dbError);
            throw dbError; // Re-throw to return 500
          }

          // Send confirmation email
          try {
            const user = await getUserById(userId);
            if (user && user.email) {
              const amount =
                subscription.items.data[0].price.unit_amount! / 100;
              const trialEnd = subscription.trial_end;

              await sendSubscriptionConfirmationEmail({
                email: user.email,
                userName: user.first_name || user.username || "there",
                plan: plan,
                amount: amount,
                trialEnd: trialEnd || undefined,
              });

              console.log(`✅ Sent confirmation email to ${user.email}`);
            }
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Don't fail the webhook if email fails
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;

        // Check if subscription was just set to cancel at period end
        const dbSubscription = await getNewsletterSubscriptionByStripeId(
          subscription.id
        );
        const wasCancelScheduled = dbSubscription?.cancel_at_period_end;
        const isCancelScheduled = subscription.cancel_at_period_end;

        await updateNewsletterSubscription(subscription.id, {
          status:
            subscription.status === "active"
              ? "active"
              : subscription.status === "past_due"
              ? "past_due"
              : subscription.status === "canceled"
              ? "canceled"
              : "incomplete",
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        console.log(`✅ Updated subscription ${subscription.id}`);

        // Send cancellation email if cancel was just scheduled
        if (!wasCancelScheduled && isCancelScheduled && dbSubscription) {
          try {
            const user = await getUserById(dbSubscription.user_id.toString());
            if (user && user.email) {
              await sendSubscriptionCancellationEmail({
                email: user.email,
                userName: user.first_name || user.username || "there",
                plan: dbSubscription.plan || "monthly",
                cancelAtPeriodEnd: true,
                periodEndDate: new Date(subscription.current_period_end * 1000),
              });

              console.log(
                `✅ Sent cancellation scheduled email to ${user.email}`
              );
            }
          } catch (emailError) {
            console.error("Failed to send cancellation email:", emailError);
            // Don't fail the webhook if email fails
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const dbSubscription = await getNewsletterSubscriptionByStripeId(
          subscription.id
        );

        await updateNewsletterSubscription(subscription.id, {
          status: "canceled",
          canceledAt: new Date(),
        });

        console.log(`✅ Canceled subscription ${subscription.id}`);

        // Send immediate cancellation email
        if (dbSubscription) {
          try {
            const user = await getUserById(dbSubscription.user_id.toString());
            if (user && user.email) {
              await sendSubscriptionCancellationEmail({
                email: user.email,
                userName: user.first_name || user.username || "there",
                plan: dbSubscription.plan || "monthly",
                cancelAtPeriodEnd: false,
              });

              console.log(`✅ Sent cancellation email to ${user.email}`);
            }
          } catch (emailError) {
            console.error("Failed to send cancellation email:", emailError);
            // Don't fail the webhook if email fails
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        if (invoice.subscription && typeof invoice.subscription === "string") {
          const subscription = (await stripe.subscriptions.retrieve(
            invoice.subscription
          )) as any;

          await updateNewsletterSubscription(subscription.id, {
            status: "active",
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });

          console.log(
            `✅ Payment succeeded for subscription ${subscription.id}`
          );

          // Send renewal email (but not for the first payment)
          // Check if this is a renewal by looking at billing_reason
          if (
            invoice.billing_reason === "subscription_cycle" ||
            invoice.billing_reason === "subscription_update"
          ) {
            try {
              const subscriptionRecord =
                await getNewsletterSubscriptionByStripeId(subscription.id);
              if (subscriptionRecord && subscriptionRecord.user_id) {
                const user = await getUserById(
                  subscriptionRecord.user_id.toString()
                );
                if (user && user.email) {
                  const amount = (invoice.amount_paid || 0) / 100;
                  const plan =
                    subscription.items.data[0]?.price?.recurring?.interval ===
                    "year"
                      ? "annual"
                      : "monthly";

                  await sendSubscriptionRenewalEmail({
                    email: user.email,
                    userName: user.first_name || user.username || "there",
                    plan: plan,
                    amount: amount,
                    nextBillingDate: new Date(
                      subscription.current_period_end * 1000
                    ),
                  });

                  console.log(
                    `✅ Sent renewal email to ${user.email} for subscription ${subscription.id}`
                  );
                }
              }
            } catch (emailError) {
              console.error("Failed to send renewal email:", emailError);
              // Don't fail the webhook if email fails
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;

        if (invoice.subscription && typeof invoice.subscription === "string") {
          await updateNewsletterSubscription(invoice.subscription, {
            status: "past_due",
          });

          console.log(
            `⚠️ Payment failed for subscription ${invoice.subscription}`
          );
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
