/**
 * Clean up orphaned Stripe subscriptions
 * This will cancel any Stripe subscriptions that are not in your database
 * Usage: node scripts/clean-stripe-subscriptions.js azizjrad9@gmail.com
 */

const Stripe = require("stripe");
const readline = require("readline");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function cleanStripeSubscriptions(email) {
  try {
    console.log("🔍 Searching for Stripe customers with email:", email);

    const customers = await stripe.customers.list({
      email: email,
      limit: 10,
    });

    if (customers.data.length === 0) {
      console.log("✅ No Stripe customers found for this email");
      return;
    }

    console.log(`\nFound ${customers.data.length} customer(s):\n`);

    let totalSubscriptions = 0;
    let activeSubscriptions = [];

    for (const customer of customers.data) {
      console.log(`Customer: ${customer.id}`);
      console.log(`  Email: ${customer.email}`);
      console.log(`  Name: ${customer.name || "N/A"}`);

      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
      });

      totalSubscriptions += subscriptions.data.length;

      for (const sub of subscriptions.data) {
        console.log(`\n  Subscription: ${sub.id}`);
        console.log(`    Status: ${sub.status}`);
        console.log(`    Plan: ${sub.items.data[0]?.price.id}`);
        console.log(
          `    Current Period: ${new Date(
            sub.current_period_start * 1000
          ).toLocaleDateString()} - ${new Date(
            sub.current_period_end * 1000
          ).toLocaleDateString()}`
        );

        if (sub.status === "active" || sub.status === "trialing") {
          activeSubscriptions.push({
            customerId: customer.id,
            subscriptionId: sub.id,
            status: sub.status,
          });
        }
      }
    }

    console.log("\n" + "═".repeat(60));
    console.log(`Total subscriptions: ${totalSubscriptions}`);
    console.log(`Active/Trialing subscriptions: ${activeSubscriptions.length}`);
    console.log("═".repeat(60));

    if (activeSubscriptions.length === 0) {
      console.log("\n✅ No active subscriptions to clean up");
      return;
    }

    console.log("\n⚠️  ACTIVE SUBSCRIPTIONS FOUND:");
    activeSubscriptions.forEach((sub, idx) => {
      console.log(`${idx + 1}. ${sub.subscriptionId} (${sub.status})`);
    });

    let answer = "no";
    if (autoConfirm) {
      console.log("\n✅ Auto-confirm enabled (--confirm flag)");
      answer = "yes";
    } else {
      answer = await question(
        "\n❓ Do you want to CANCEL these subscriptions in Stripe? (yes/no): "
      );
    }

    if (answer.toLowerCase() !== "yes") {
      console.log("\n❌ Canceled by user");
      return;
    }

    console.log("\n🗑️  Canceling subscriptions...\n");

    for (const sub of activeSubscriptions) {
      try {
        const canceled = await stripe.subscriptions.cancel(sub.subscriptionId);
        console.log(`✅ Canceled: ${sub.subscriptionId} (${canceled.status})`);
      } catch (error) {
        console.error(
          `❌ Failed to cancel ${sub.subscriptionId}:`,
          error.message
        );
      }
    }

    console.log(
      "\n✅ Done! You should now be able to create a new subscription."
    );
    console.log(
      "\n💡 TIP: The user can now go to /payment and subscribe normally."
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Get email and confirmation from command line
const email = process.argv[2];
const autoConfirm = process.argv[3] === "--confirm";

if (!email) {
  console.error("❌ Please provide an email address");
  console.log(
    "Usage: node scripts/clean-stripe-subscriptions.js <email> [--confirm]"
  );
  rl.close();
  process.exit(1);
}

async function main() {
  await cleanStripeSubscriptions(email);
}

main();
