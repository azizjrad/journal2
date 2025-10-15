/**
 * Check and sync subscription status for a specific user
 * Usage: node scripts/check-subscription-sync.js azizjrad9@gmail.com
 */

const mongoose = require("mongoose");
const Stripe = require("stripe");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

// MongoDB Models
const NewsletterSubscriptionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subscription_id: { type: String, unique: true },
    plan: String,
    billing_period: String,
    status: String,
    amount: Number,
    currency: String,
    payment_method: Object,
    current_period_start: Date,
    current_period_end: Date,
    trial_start: Date,
    trial_end: Date,
    canceled_at: Date,
    cancel_at_period_end: Boolean,
    stripe_subscription_id: String,
    stripe_customer_id: String,
    preferences: Object,
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema({
  email: String,
  first_name: String,
  last_name: String,
  role: String,
});

const NewsletterSubscription =
  mongoose.models.NewsletterSubscription ||
  mongoose.model("NewsletterSubscription", NewsletterSubscriptionSchema);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function checkSubscriptionSync(email) {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find user in database
    console.log(`👤 Searching for user: ${email}`);
    const user = await User.findOne({ email }).lean();

    if (!user) {
      console.log("❌ User not found in database");
      return;
    }

    console.log(
      `✅ User found: ${user.first_name} ${user.last_name} (ID: ${user._id})\n`
    );

    // Check database subscriptions
    console.log("📊 Checking database subscriptions...");
    const dbSubscriptions = await NewsletterSubscription.find({
      user_id: user._id,
    }).lean();

    console.log(`Found ${dbSubscriptions.length} subscription(s) in database:`);
    dbSubscriptions.forEach((sub, idx) => {
      console.log(`\n  Subscription ${idx + 1}:`);
      console.log(`  - ID: ${sub.subscription_id}`);
      console.log(`  - Status: ${sub.status}`);
      console.log(`  - Plan: ${sub.plan} (${sub.billing_period})`);
      console.log(`  - Stripe Sub ID: ${sub.stripe_subscription_id}`);
      console.log(`  - Stripe Customer ID: ${sub.stripe_customer_id}`);
      console.log(`  - Created: ${sub.createdAt}`);
      if (sub.canceled_at) {
        console.log(`  - Canceled At: ${sub.canceled_at}`);
      }
    });
    console.log("");

    // Check Stripe subscriptions
    console.log("💳 Checking Stripe subscriptions...");
    const customers = await stripe.customers.list({
      email: email,
      limit: 10,
    });

    console.log(`Found ${customers.data.length} customer(s) in Stripe:`);

    for (const customer of customers.data) {
      console.log(`\n  Customer: ${customer.id}`);
      console.log(`  - Email: ${customer.email}`);
      console.log(`  - Name: ${customer.name || "N/A"}`);
      console.log(
        `  - Created: ${new Date(customer.created * 1000).toISOString()}`
      );

      // Get subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
      });

      console.log(`  - Subscriptions: ${subscriptions.data.length}`);

      subscriptions.data.forEach((sub, idx) => {
        console.log(`\n    Subscription ${idx + 1}:`);
        console.log(`    - ID: ${sub.id}`);
        console.log(`    - Status: ${sub.status}`);
        console.log(
          `    - Current Period: ${new Date(
            sub.current_period_start * 1000
          ).toLocaleDateString()} - ${new Date(
            sub.current_period_end * 1000
          ).toLocaleDateString()}`
        );
        if (sub.trial_start) {
          console.log(
            `    - Trial: ${new Date(
              sub.trial_start * 1000
            ).toLocaleDateString()} - ${new Date(
              sub.trial_end * 1000
            ).toLocaleDateString()}`
          );
        }
        if (sub.canceled_at) {
          console.log(
            `    - Canceled At: ${new Date(
              sub.canceled_at * 1000
            ).toISOString()}`
          );
        }
        console.log(`    - Cancel At Period End: ${sub.cancel_at_period_end}`);

        // Check if this subscription exists in database
        const existsInDb = dbSubscriptions.some(
          (dbSub) => dbSub.stripe_subscription_id === sub.id
        );
        console.log(`    - In Database: ${existsInDb ? "✅ Yes" : "❌ No"}`);
      });
    }

    console.log("\n\n📋 SUMMARY:");
    console.log("═".repeat(50));

    const activeStripeCount = customers.data.reduce((count, customer) => {
      return (
        count +
          customer.subscriptions?.data?.filter(
            (s) => s.status === "active" || s.status === "trialing"
          ).length || 0
      );
    }, 0);

    const activeDbCount = dbSubscriptions.filter(
      (s) => s.status === "active" || s.status === "trialing"
    ).length;

    console.log(`Stripe Active Subscriptions: ${activeStripeCount}`);
    console.log(`Database Active Subscriptions: ${activeDbCount}`);

    if (activeStripeCount > 0 && activeDbCount === 0) {
      console.log(
        "\n⚠️  ISSUE FOUND: Active subscription in Stripe but not in database!"
      );
      console.log("\n🔧 SOLUTIONS:");
      console.log("1. Cancel the subscription in Stripe dashboard");
      console.log(
        "2. Run: node scripts/clean-stripe-subscriptions.js " + email
      );
      console.log("3. Or manually trigger webhook to sync data");
    } else if (activeStripeCount === 0 && activeDbCount > 0) {
      console.log(
        "\n⚠️  ISSUE FOUND: Active subscription in database but not in Stripe!"
      );
      console.log("\n🔧 SOLUTION: Update database status to canceled");
      console.log("Run: node scripts/clean-db-subscriptions.js " + email);
    } else if (activeStripeCount === 0 && activeDbCount === 0) {
      console.log("\n✅ NO ACTIVE SUBSCRIPTIONS - User can subscribe normally");
    } else {
      console.log("\n✅ Subscriptions are in sync");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node scripts/check-subscription-sync.js <email>");
  process.exit(1);
}

checkSubscriptionSync(email);
