import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES, PLAN_DETAILS } from "@/lib/stripe";
import { verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { createRateLimit } from "@/lib/rate-limit";
import {
  validateEmail,
  validatePaymentMethod,
  validateBillingPeriod,
} from "@/lib/input-validation";
import { validateCsrf } from "@/lib/csrf";

// Rate limiter: 5 checkout attempts per 15 minutes per user
const checkoutRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => {
    const authToken = req.cookies.get("auth-token")?.value;
    if (authToken) {
      try {
        const payload = verifyToken(authToken);
        return `checkout:user:${payload?.userId}`;
      } catch {
        // Fall back to IP if token invalid
      }
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    return `checkout:ip:${ip}`;
  },
});

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = checkoutRateLimit.check(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many checkout attempts. Please try again later.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "Retry-After": (rateLimitResult.retryAfter || 60).toString(),
        },
      }
    );
  }

  try {
    // Verify CSRF token first
    if (!validateCsrf(request)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Security verification failed. Please refresh the page and try again.",
          code: "CSRF_ERROR",
        },
        { status: 403 }
      );
    }

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

    // Check if user already has an active subscription
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      const existingCustomer = customers.data[0];

      // Check for active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: existingCustomer.id,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You already have an active subscription. Please manage your subscription from your account settings.",
            code: "ALREADY_SUBSCRIBED",
          },
          { status: 400 }
        );
      }

      // Also check for trialing subscriptions
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: existingCustomer.id,
        status: "trialing",
        limit: 1,
      });

      if (trialingSubscriptions.data.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You already have an active trial subscription. Please manage your subscription from your account settings.",
            code: "ALREADY_SUBSCRIBED",
          },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const { billing, paymentMethod, email } = body;

    // Validate billing period
    const billingValidation = validateBillingPeriod(billing);
    if (!billingValidation.valid) {
      return NextResponse.json(
        { success: false, message: billingValidation.error },
        { status: 400 }
      );
    }

    // Validate payment method
    const paymentValidation = validatePaymentMethod(paymentMethod);
    if (!paymentValidation.valid) {
      return NextResponse.json(
        { success: false, message: paymentValidation.error },
        { status: 400 }
      );
    }

    // Validate email if provided (additional security check)
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return NextResponse.json(
          { success: false, message: emailValidation.error },
          { status: 400 }
        );
      }

      // Verify email matches authenticated user
      if (email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Email does not match authenticated user",
          },
          { status: 403 }
        );
      }
    }

    // Determine payment method types based on user selection
    let payment_method_types: string[] = ["card"];
    if (paymentMethod === "paypal") {
      payment_method_types = ["paypal"];
    } else if (paymentMethod === "card") {
      payment_method_types = ["card"];
    }

    // Get price ID from environment or use default
    const priceId = STRIPE_PRICES[billing as "monthly" | "annual"];
    const planDetails = PLAN_DETAILS[billing as "monthly" | "annual"];

    // Create or retrieve Stripe customer
    let customerId: string | undefined;

    // Reuse the customers list we already fetched above
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        metadata: {
          userId: String(user.id),
        },
      });
      customerId = customer.id;
    }

    // Prepare subscription data
    const subscriptionData: any = {
      metadata: {
        userId: String(user.id),
        plan: billing,
        billing,
      },
    };

    // Only annual plan gets free trial
    if (billing === "annual") {
      // Apply first month free trial (30 days)
      subscriptionData.trial_period_days = 30;
    }
    // Monthly plan: no trial, immediate $4 charge

    // Prepare discounts array for the checkout session (not subscription_data)
    const discounts: any[] = [];
    if (billing === "annual" && process.env.STRIPE_ANNUAL_COUPON_ID) {
      discounts.push({
        coupon: process.env.STRIPE_ANNUAL_COUPON_ID,
      });
    }

    // Create Stripe Checkout Session
    const sessionConfig: any = {
      customer: customerId,
      payment_method_types: payment_method_types,
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
        plan: billing,
        billing,
      },
      subscription_data: subscriptionData,
    };

    // Add discounts if available (for annual plan with coupon)
    if (discounts.length > 0) {
      sessionConfig.discounts = discounts;
    }

    const checkoutSession = await stripe.checkout.sessions.create(
      sessionConfig
    );

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
