#!/usr/bin/env node

/**
 * Automated Backup Scheduler
 * Runs backups at specified intervals
 * Can be used with Task Scheduler on Windows or cron on Linux
 */

const { performBackup } = require("./backup-database");
const fs = require("fs");
const path = require("path");

// Configuration
const BACKUP_INTERVAL = process.env.BACKUP_INTERVAL || "daily"; // daily, weekly, hourly
const BACKUP_TIME = process.env.BACKUP_TIME || "02:00"; // 2 AM default
const LOG_FILE = path.join(__dirname, "..", "backups", "backup-log.txt");

/**
 * Log message to file and console
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(message);

  // Append to log file
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.appendFileSync(LOG_FILE, logMessage);
}

/**
 * Calculate next backup time
 */
function getNextBackupTime() {
  const now = new Date();
  const [hours, minutes] = BACKUP_TIME.split(":").map(Number);

  let nextBackup = new Date(now);
  nextBackup.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (nextBackup <= now) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }

  return nextBackup;
}

/**
 * Run scheduled backup
 */
async function runScheduledBackup() {
  log("=".repeat(60));
  log("Starting scheduled backup...");

  try {
    const result = await performBackup();

    if (result.success) {
      log(
        `✅ Backup completed successfully: ${result.metadata.totalDocuments} documents`
      );
      log(`📁 Location: ${result.path}`);

      // Send notification (optional - implement email/webhook)
      await sendBackupNotification(result);
    } else {
      log(`❌ Backup failed: ${result.error}`);
      await sendBackupFailureAlert(result.error);
    }
  } catch (error) {
    log(`❌ Fatal error during backup: ${error.message}`);
    await sendBackupFailureAlert(error.message);
  }

  log("=".repeat(60) + "\n");
}

/**
 * Send backup success notification (implement based on your needs)
 */
async function sendBackupNotification(result) {
  // TODO: Implement email notification using SendGrid
  // TODO: Or webhook to monitoring service
  // TODO: Or Slack/Discord notification

  const notification = {
    type: "backup_success",
    timestamp: new Date().toISOString(),
    totalDocuments: result.metadata.totalDocuments,
    collections: result.metadata.collections.length,
    path: result.path,
  };

  // For now, just log it
  log(`📧 Notification sent: ${JSON.stringify(notification)}`);
}

/**
 * Send backup failure alert
 */
async function sendBackupFailureAlert(error) {
  // TODO: Implement critical alert system
  // Should notify admin immediately

  const alert = {
    type: "backup_failure",
    timestamp: new Date().toISOString(),
    error: error,
    severity: "critical",
  };

  log(`🚨 ALERT: ${JSON.stringify(alert)}`);
}

/**
 * Schedule backup based on interval
 */
function scheduleBackup() {
  log("🕐 Backup scheduler started");
  log(`📅 Interval: ${BACKUP_INTERVAL}`);
  log(`⏰ Time: ${BACKUP_TIME}`);

  if (BACKUP_INTERVAL === "hourly") {
    // Run every hour
    const interval = 60 * 60 * 1000; // 1 hour
    log(`⏱️  Running backup every hour`);

    setInterval(runScheduledBackup, interval);
    runScheduledBackup(); // Run immediately
  } else if (BACKUP_INTERVAL === "daily") {
    // Run once per day at specified time
    const checkInterval = 60 * 1000; // Check every minute

    log(`⏱️  Daily backup scheduled for ${BACKUP_TIME}`);

    setInterval(() => {
      const now = new Date();
      const [hours, minutes] = BACKUP_TIME.split(":").map(Number);

      if (now.getHours() === hours && now.getMinutes() === minutes) {
        runScheduledBackup();
      }
    }, checkInterval);
  } else if (BACKUP_INTERVAL === "weekly") {
    // Run once per week on Sunday at specified time
    const checkInterval = 60 * 1000; // Check every minute

    log(`⏱️  Weekly backup scheduled for Sunday at ${BACKUP_TIME}`);

    setInterval(() => {
      const now = new Date();
      const [hours, minutes] = BACKUP_TIME.split(":").map(Number);

      // Sunday = 0
      if (
        now.getDay() === 0 &&
        now.getHours() === hours &&
        now.getMinutes() === minutes
      ) {
        runScheduledBackup();
      }
    }, checkInterval);
  } else {
    log("❌ Invalid BACKUP_INTERVAL. Use: hourly, daily, or weekly");
    process.exit(1);
  }

  // Keep process alive
  process.on("SIGINT", () => {
    log("Backup scheduler stopped");
    process.exit(0);
  });
}

/**
 * Run immediate backup (for testing)
 */
async function runImmediateBackup() {
  log("🚀 Running immediate backup...");
  await runScheduledBackup();
  process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes("--now") || args.includes("-n")) {
  runImmediateBackup();
} else if (args.includes("--help") || args.includes("-h")) {
  console.log(`
MongoDB Automated Backup Scheduler

Usage:
  node scripts/backup-scheduler.js [options]

Options:
  --now, -n             Run backup immediately and exit
  --help, -h           Show this help message

Environment Variables:
  BACKUP_INTERVAL      Backup frequency: hourly, daily (default), weekly
  BACKUP_TIME          Time to run backup (HH:MM format, default: 02:00)

Examples:
  node scripts/backup-scheduler.js --now
  BACKUP_INTERVAL=daily BACKUP_TIME=03:00 node scripts/backup-scheduler.js
  
Windows Task Scheduler:
  Create a task that runs:
  node "C:\\path\\to\\scripts\\backup-scheduler.js" --now
  
Linux Cron:
  0 2 * * * cd /path/to/project && node scripts/backup-scheduler.js --now
  `);
  process.exit(0);
} else {
  scheduleBackup();
}
