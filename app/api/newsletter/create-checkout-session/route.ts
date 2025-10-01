import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES, PLAN_DETAILS } from "@/lib/stripe";
import { verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
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

    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
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
    const priceId =
      STRIPE_PRICES[plan as "basic" | "premium"][
        billing as "monthly" | "annual"
      ];

    const planDetails =
      PLAN_DETAILS[plan as "basic" | "premium"][
        billing as "monthly" | "annual"
      ];

    // Create or retrieve Stripe customer
    let customerId: string | undefined;
    
    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        metadata: {
          userId: String(user.id),
        },
      });
      customerId = customer.id;
    }    // Create Stripe Checkout Session
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
      success_url: `${
        process.env.APP_BASE_URL || "http://localhost:3000"
      }/newsletter/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.APP_BASE_URL || "http://localhost:3000"
      }/newsletter?canceled=true`,
      metadata: {
        userId: String(user.id),
        plan,
        billing,
      },
      subscription_data: {
        metadata: {
          userId: String(user.id),
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
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
