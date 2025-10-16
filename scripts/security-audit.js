#!/usr/bin/env node

/**
 * Pre-Production Security & Performance Audit
 * Run this before deploying to production
 */

const fs = require("fs");
const path = require("path");

console.log("🔒 Running Pre-Production Security & Performance Audit...\n");

const checks = {
  passed: [],
  warnings: [],
  failed: [],
};

// 1. Check for console.log statements
console.log("1️⃣ Checking for console.log statements...");
const sourceFiles = [
  "app",
  "components",
  "lib",
].flatMap((dir) => findFiles(path.join(__dirname, "..", dir), /\.(ts|tsx|js|jsx)$/));

let consoleLogCount = 0;
sourceFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (
      line.includes("console.log") &&
      !line.includes("console.error") &&
      !line.includes("console.warn") &&
      !line.trim().startsWith("//")
    ) {
      consoleLogCount++;
      if (consoleLogCount === 1) {
        checks.warnings.push(
          `Found console.log in ${path.basename(file)}:${index + 1}`
        );
      }
    }
  });
});

if (consoleLogCount === 0) {
  checks.passed.push("No console.log statements found");
} else {
  checks.warnings.push(`Found ${consoleLogCount} console.log statements`);
}

// 2. Check environment variables
console.log("2️⃣ Checking environment variables...");
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "SENDGRID_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length === 0) {
  checks.passed.push("All required environment variables are set");
} else {
  checks.failed.push(
    `Missing environment variables: ${missingVars.join(", ")}`
  );
}

// 3. Check for hardcoded secrets
console.log("3️⃣ Checking for hardcoded secrets...");
const secretPatterns = [
  /sk_live_[a-zA-Z0-9]{24,}/g, // Stripe live keys
  /pk_live_[a-zA-Z0-9]{24,}/g, // Stripe publishable live keys
  /mongodb\+srv:\/\/[^:]+:[^@]+@/g, // MongoDB connection strings with passwords
  /redis:\/\/[^:]+:[^@]+@/g, // Redis connection strings with passwords
  /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, // SendGrid API keys
];

let secretsFound = 0;
sourceFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  secretPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      secretsFound++;
      checks.failed.push(`Possible hardcoded secret in ${path.basename(file)}`);
    }
  });
});

if (secretsFound === 0) {
  checks.passed.push("No hardcoded secrets found");
}

// 4. Check package vulnerabilities
console.log("4️⃣ Checking package vulnerabilities...");
try {
  const { execSync } = require("child_process");
  const auditOutput = execSync("npm audit --json", { encoding: "utf8" });
  const audit = JSON.parse(auditOutput);

  if (audit.metadata) {
    const { vulnerabilities } = audit.metadata;
    const critical = vulnerabilities.critical || 0;
    const high = vulnerabilities.high || 0;
    const moderate = vulnerabilities.moderate || 0;

    if (critical > 0 || high > 0) {
      checks.failed.push(
        `Found ${critical} critical and ${high} high severity vulnerabilities`
      );
    } else if (moderate > 0) {
      checks.warnings.push(`Found ${moderate} moderate severity vulnerabilities`);
    } else {
      checks.passed.push("No critical or high severity vulnerabilities");
    }
  }
} catch (error) {
  checks.warnings.push("Could not run npm audit");
}

// 5. Check if sitemap.ts exists
console.log("5️⃣ Checking for sitemap.ts...");
const sitemapPath = path.join(__dirname, "..", "app", "sitemap.ts");
if (fs.existsSync(sitemapPath)) {
  checks.passed.push("Sitemap configuration found");
} else {
  checks.warnings.push("Sitemap configuration not found");
}

// 6. Check if robots.ts exists
console.log("6️⃣ Checking for robots.ts...");
const robotsPath = path.join(__dirname, "..", "app", "robots.ts");
if (fs.existsSync(robotsPath)) {
  checks.passed.push("Robots.txt configuration found");
} else {
  checks.warnings.push("Robots.txt configuration not found");
}

// 7. Check for security headers in next.config.mjs
console.log("7️⃣ Checking security headers...");
const nextConfigPath = path.join(__dirname, "..", "next.config.mjs");
const nextConfig = fs.readFileSync(nextConfigPath, "utf8");
const securityHeaders = [
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
];

const missingHeaders = securityHeaders.filter(
  (header) => !nextConfig.includes(header)
);

if (missingHeaders.length === 0) {
  checks.passed.push("Security headers configured");
} else {
  checks.warnings.push(
    `Missing security headers: ${missingHeaders.join(", ")}`
  );
}

// 8. Check Analytics installation
console.log("8️⃣ Checking Analytics...");
const layoutPath = path.join(__dirname, "..", "app", "layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf8");

if (layoutContent.includes("@vercel/analytics")) {
  checks.passed.push("Vercel Analytics installed");
} else {
  checks.warnings.push("Vercel Analytics not found");
}

if (layoutContent.includes("@vercel/speed-insights")) {
  checks.passed.push("Vercel Speed Insights installed");
} else {
  checks.warnings.push("Vercel Speed Insights not found");
}

// 9. Check rate limiting
console.log("9️⃣ Checking rate limiting...");
const rateLimitPath = path.join(__dirname, "..", "lib", "rate-limit.ts");
if (fs.existsSync(rateLimitPath)) {
  checks.passed.push("Rate limiting module found");

  // Check if it's used in critical endpoints
  const contactRoute = path.join(
    __dirname,
    "..",
    "app",
    "api",
    "contact",
    "route.ts"
  );
  if (fs.existsSync(contactRoute)) {
    const contactContent = fs.readFileSync(contactRoute, "utf8");
    if (contactContent.includes("rate-limit")) {
      checks.passed.push("Rate limiting applied to contact endpoint");
    } else {
      checks.warnings.push("Rate limiting not applied to contact endpoint");
    }
  }
} else {
  checks.failed.push("Rate limiting module not found");
}

// Print results
console.log("\n" + "=".repeat(60));
console.log("📊 AUDIT RESULTS");
console.log("=".repeat(60) + "\n");

console.log(`✅ Passed: ${checks.passed.length}`);
checks.passed.forEach((msg) => console.log(`  ✓ ${msg}`));

console.log(`\n⚠️  Warnings: ${checks.warnings.length}`);
checks.warnings.forEach((msg) => console.log(`  ! ${msg}`));

console.log(`\n❌ Failed: ${checks.failed.length}`);
checks.failed.forEach((msg) => console.log(`  ✗ ${msg}`));

console.log("\n" + "=".repeat(60));

// Exit code
if (checks.failed.length > 0) {
  console.log("\n❌ Audit failed. Fix the issues above before deploying.\n");
  process.exit(1);
} else if (checks.warnings.length > 0) {
  console.log(
    "\n⚠️  Audit passed with warnings. Consider addressing them.\n"
  );
  process.exit(0);
} else {
  console.log("\n✅ All checks passed! Ready for production.\n");
  process.exit(0);
}

// Helper function
function findFiles(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules") {
        results.push(...findFiles(filePath, pattern));
      }
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  return results;
}
