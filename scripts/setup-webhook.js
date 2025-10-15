/**
 * Setup script to configure webhook secret automatically
 * Run this after starting stripe listen
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setupWebhook() {
  console.log("\n🔧 Stripe Webhook Setup\n");
  console.log("=".repeat(60));

  console.log("\n📋 Steps to follow:");
  console.log("1. Open a NEW terminal window");
  console.log(
    "2. Run: stripe listen --forward-to localhost:3000/api/newsletter/webhook"
  );
  console.log("3. Copy the webhook signing secret (starts with whsec_)");
  console.log("4. Paste it here\n");

  const webhookSecret = await question(
    "🔑 Enter your webhook secret (whsec_...): "
  );

  if (!webhookSecret || !webhookSecret.startsWith("whsec_")) {
    console.log("\n❌ Invalid webhook secret. Must start with whsec_");
    rl.close();
    return;
  }

  // Read .env.local
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    console.log("\n❌ .env.local file not found");
    rl.close();
    return;
  }

  let envContent = fs.readFileSync(envPath, "utf8");

  // Replace or add STRIPE_WEBHOOK_SECRET
  if (envContent.includes("STRIPE_WEBHOOK_SECRET=")) {
    envContent = envContent.replace(
      /STRIPE_WEBHOOK_SECRET=.*/,
      `STRIPE_WEBHOOK_SECRET=${webhookSecret}`
    );
    console.log("\n✅ Updated STRIPE_WEBHOOK_SECRET in .env.local");
  } else {
    envContent += `\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}\n`;
    console.log("\n✅ Added STRIPE_WEBHOOK_SECRET to .env.local");
  }

  // Write back to file
  fs.writeFileSync(envPath, envContent);

  console.log("\n🎉 Setup complete!");
  console.log("\n📋 Next steps:");
  console.log('1. ✅ Keep the "stripe listen" terminal running');
  console.log("2. 🔄 Restart your Next.js dev server:");
  console.log("   - Stop it (Ctrl+C)");
  console.log("   - Start again: npm run dev");
  console.log("3. 🧪 Test a subscription at http://localhost:3000/payment");
  console.log(
    '\n💡 Tip: Run "npm run webhooks" to start stripe listen automatically\n'
  );

  rl.close();
}

setupWebhook().catch((error) => {
  console.error("\n❌ Error:", error.message);
  rl.close();
});
