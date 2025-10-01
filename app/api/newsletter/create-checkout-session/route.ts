import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe, STRIPE_PRICES, PLAN_DETAILS } from "@/lib/stripe";
import { getUserSession } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session-id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const session = await getUserSession(sessionId);
    if (!session || !session.user_id) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, billing } = body;

    // Validate input
    if (
      !plan ||
      !billing ||
      !["basic", "premium"].includes(plan) ||
      !["monthly", "annual"].includes(billing)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid plan or billing period" },
        { status: 400 }
      );
    }

    // Get price ID from environment or use default
    const priceId = STRIPE_PRICES[plan as "basic" | "premium"][
      billing as "monthly" | "annual"
    ];

    const planDetails =
      PLAN_DETAILS[plan as "basic" | "premium"][billing as "monthly" | "annual"];

    // Create or retrieve Stripe customer
    let customerId: string | undefined;
    
    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: session.user_id, // You'll need to get the actual email
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        metadata: {
          userId: session.user_id,
        },
      });
      customerId = customer.id;
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/newsletter/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/newsletter?canceled=true`,
      metadata: {
        userId: session.user_id,
        plan,
        billing,
      },
      subscription_data: {
        metadata: {
          userId: session.user_id,
          plan,
          billing,
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}
