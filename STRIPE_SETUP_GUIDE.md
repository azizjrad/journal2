# Stripe Newsletter Subscription Setup Guide

## Overview

This guide will help you set up the complete payment and subscription flow for your newsletter using Stripe.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Vercel or other hosting platform for webhooks

## Step 1: Create Stripe Account and Get API Keys

1. Go to https://stripe.com and create an account
2. Navigate to Developers → API keys
3. Copy your **Publishable key** and **Secret key**
4. For testing, use the test mode keys (starts with `pk_test_` and `sk_test_`)

## Step 2: Create Products and Prices in Stripe

1. Go to **Products** in your Stripe Dashboard
2. Click **Add Product**
3. Create the following products:

### Monthly Digital

- Name: `Newsletter Monthly Digital`
- Price: `$4.00`
- Billing period: `Monthly`
- Description: `$4/month - Renews automatically`
- Copy the Price ID (starts with `price_`)

### Annual Digital

- Name: `Newsletter Annual Digital`
- Price: `$48.00` (full price - coupon will discount to $24)
- Billing period: `Yearly`
- Description: `First month FREE + 50% off first year`
- Copy the Price ID

## Step 2.5: Create Coupon for Annual Discount (Optional but Recommended)

1. Go to **Coupons** in your Stripe Dashboard
2. Click **Create coupon**
3. Configure:
   - **Name**: `first_year_free` (or any name)
   - **Type**: Percentage off
   - **Percentage discount**: `50%`
   - **Apply to specific products**: Select "Annual Digital"
   - **Duration**: Multiple months
   - **Number of months**: `12`
   - **Redemption limits**: Leave unchecked (unlimited)
4. Click **Create coupon**
5. Copy the Coupon ID (the code you see in the list)
6. Add to environment variables as `STRIPE_ANNUAL_COUPON_ID`

**Note**: The app automatically applies a 30-day free trial to all subscriptions, and then applies this coupon to annual subscriptions for 50% off the remaining 11 months.

## Step 3: Set Up Environment Variables

Add the following to your `.env.local` (for development) and Vercel Environment Variables (for production):

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # You'll get this in Step 4

# Price IDs from Step 2
STRIPE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx

# Coupon ID for Annual Plan (optional - creates automatic 50% off after trial)
STRIPE_ANNUAL_COUPON_ID=your_coupon_id_here  # Get this from Stripe Dashboard → Coupons

# App Configuration
APP_BASE_URL=http://localhost:3000  # Change to your production URL in production
```

## Step 4: Set Up Stripe Webhooks

### For Local Development (using Stripe CLI):

1. Install Stripe CLI:

   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe CLI:

   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:

   ```bash
   stripe listen --forward-to localhost:3000/api/newsletter/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env.local`

### For Production:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/newsletter/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add to Vercel Environment Variables

## Step 5: Test the Integration

### Test Payment Flow:

1. Start your development server:

   ```bash
   npm run dev
   ```

2. In another terminal, start Stripe webhook forwarding:

   ```bash
   stripe listen --forward-to localhost:3000/api/newsletter/webhook
   ```

3. Navigate to: `http://localhost:3000/newsletter`

4. Click "Get Digital Access" button

5. You'll be redirected to Stripe Checkout

6. Use Stripe test card numbers:

   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Use any future expiry date, any CVC, and any postal code

7. Complete the payment

8. You should be redirected to the success page

9. Check your database - a new `NewsletterSubscription` record should be created with `status: "active"`

### Test Newsletter Sending:

1. Go to your admin dashboard
2. Navigate to Newsletter section
3. Select active subscribers
4. Type subject and content
5. Click Send
6. Only subscribers with `status: "active"` will receive the newsletter

## Step 6: Deploy to Production

1. Push your code to GitHub:

   ```bash
   git add .
   git commit -m "Implement Stripe payment integration for newsletter subscriptions"
   git push origin master
   ```

2. In Vercel Dashboard, add all environment variables from Step 3 (use production values)

3. Set up production webhook endpoint in Stripe Dashboard (Step 4)

4. Test with real payment methods (or test mode if still testing)

## Step 7: Monitor and Maintain

### Stripe Dashboard

- Monitor subscriptions in real-time
- Handle customer disputes and refunds
- View revenue analytics

### Database

- Check `NewsletterSubscription` collection for active subscriptions
- Monitor subscription statuses
- Track cancellations and renewals

### Logs

- Check Vercel logs for webhook events
- Monitor Stripe Dashboard → Developers → Logs for API calls

## Troubleshooting

### Webhook not receiving events:

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Stripe CLI is running (`stripe listen`)
- Verify endpoint URL in Stripe Dashboard
- Check Vercel function logs

### Payment fails:

- Verify all Price IDs are correct
- Check `STRIPE_SECRET_KEY` is set
- Ensure customer has valid payment method

### Subscription not created:

- Check webhook logs
- Verify database connection
- Check for errors in Vercel function logs

## Security Best Practices

1. **Never expose Secret Keys** - Keep them in environment variables only
2. **Verify webhook signatures** - Already implemented in webhook handler
3. **Use HTTPS in production** - Required for webhooks
4. **Regularly rotate API keys** - Update in Stripe Dashboard and environment variables
5. **Monitor for suspicious activity** - Use Stripe Radar

## How the Pricing Works

### Monthly Digital ($4/month)

- **Immediate charge**: $4/month (no trial)
- **Recurring**: $4/month
- **Cancel anytime**

### Annual Digital ($48/year with first-year discount)

- **First month**: FREE (30-day trial)
- **Months 2-12**: 50% off ($24 total for remaining 11 months)
- **Year 2+**: Full price $48/year

**Implementation**: The code automatically applies:

1. 30-day free trial **only for annual subscriptions**
2. 50% off coupon for annual subscriptions (applied after trial)
3. After 12 months, coupon expires and full price applies
4. Monthly subscriptions charge immediately (no trial)

This is all handled automatically by Stripe - no manual intervention needed!

## Additional Features to Consider

1. **Proration** - Handle mid-cycle plan changes
2. **Trial Periods** - Offer free trials
3. **Coupons** - Create discount codes (recommended for year 1 discount)
4. **Invoicing** - Automatic invoice generation
5. **Tax Calculation** - Use Stripe Tax
6. **Customer Portal** - Allow users to manage their own subscriptions

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Your App Issues: Check logs in Vercel Dashboard

---

**Important:** Always test thoroughly in test mode before going live with real payments!
