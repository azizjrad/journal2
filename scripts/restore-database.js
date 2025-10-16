#!/usr/bin/env node

/**
 * MongoDB Database Restore Script
 * Restores database from backup files
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const BACKUP_DIR = path.join(__dirname, "..", "backups");

/**
 * List available backups
 */
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log("❌ No backups found. Backup directory does not exist.");
    return [];
  }

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter(
      (name) =>
        (name.startsWith("backup_") && name.endsWith(".zip")) ||
        (!name.includes(".") && name.startsWith("backup_"))
    )
    .map((name) => {
      const backupPath = path.join(BACKUP_DIR, name);
      const stats = fs.statSync(backupPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      return {
        name,
        path: backupPath,
        date: stats.mtime.toLocaleString(),
        size: sizeMB + " MB",
        time: stats.mtime.getTime(),
      };
    })
    .sort((a, b) => b.time - a.time);

  return backups;
}

/**
 * Extract backup if it's compressed
 */
async function extractBackup(backupPath) {
  if (backupPath.endsWith(".zip")) {
    console.log("📦 Extracting backup...");
    const extractPath = backupPath.replace(".zip", "");

    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }

    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    const command = `powershell -Command "Expand-Archive -Path '${backupPath}' -DestinationPath '${path.dirname(
      backupPath
    )}' -Force"`;

    await execPromise(command);
    console.log("✅ Backup extracted\n");

    return extractPath;
  }

  return backupPath;
}

/**
 * Restore a single collection
 */
async function restoreCollection(db, collectionName, filePath, options = {}) {
  try {
    console.log(`📥 Restoring collection: ${collectionName}...`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return { collection: collectionName, count: 0, skipped: true };
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (data.length === 0) {
      console.log(`   Empty collection, skipping`);
      return { collection: collectionName, count: 0, skipped: true };
    }

    const collection = db.collection(collectionName);

    // Drop existing collection if requested
    if (options.dropExisting) {
      try {
        await collection.drop();
        console.log(`   Dropped existing ${collectionName}`);
      } catch (error) {
        // Collection might not exist, that's okay
      }
    }

    // Insert documents
    const result = await collection.insertMany(data, { ordered: false });

    console.log(`✅ Restored ${result.insertedCount} documents to ${collectionName}`);
    return {
      collection: collectionName,
      count: result.insertedCount,
      skipped: false,
    };
  } catch (error) {
    if (error.code === 11000) {
      console.log(
        `⚠️  Some documents already exist in ${collectionName} (duplicate key error)`
      );
      return {
        collection: collectionName,
        count: 0,
        error: "Duplicate documents",
      };
    }

    console.error(`❌ Error restoring ${collectionName}:`, error.message);
    return { collection: collectionName, count: 0, error: error.message };
  }
}

/**
 * Prompt user for confirmation
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

/**
 * Main restore function
 */
async function performRestore(backupName = null, options = {}) {
  const startTime = Date.now();
  console.log("🔄 Starting MongoDB restore...\n");
  console.log("=" .repeat(60));

  if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in environment variables");
    process.exit(1);
  }

  // List available backups
  const backups = listBackups();

  if (backups.length === 0) {
    console.log("❌ No backups available to restore");
    process.exit(1);
  }

  // Select backup
  let selectedBackup;

  if (backupName) {
    selectedBackup = backups.find((b) => b.name === backupName);
    if (!selectedBackup) {
      console.log(`❌ Backup not found: ${backupName}`);
      process.exit(1);
    }
  } else {
    console.log("📋 Available backups:\n");
    backups.forEach((backup, index) => {
      console.log(
        `${index + 1}. ${backup.name} - ${backup.date} (${backup.size})`
      );
    });

    const answer = await askQuestion(
      "\n🔢 Enter backup number to restore (or 'q' to quit): "
    );

    if (answer.toLowerCase() === "q") {
      console.log("Restore cancelled");
      process.exit(0);
    }

    const index = parseInt(answer) - 1;
    if (isNaN(index) || index < 0 || index >= backups.length) {
      console.log("❌ Invalid selection");
      process.exit(1);
    }

    selectedBackup = backups[index];
  }

  console.log(`\n📁 Selected backup: ${selectedBackup.name}`);
  console.log(`📅 Date: ${selectedBackup.date}`);
  console.log(`💾 Size: ${selectedBackup.size}\n`);

  // Warning
  if (!options.skipConfirmation) {
    console.log("⚠️  WARNING: This will restore data to your database!");
    console.log(
      "   Existing documents with the same ID will cause errors unless --drop is used.\n"
    );

    const confirm = await askQuestion(
      "Are you sure you want to continue? (yes/no): "
    );

    if (confirm.toLowerCase() !== "yes") {
      console.log("Restore cancelled");
      process.exit(0);
    }
  }

  let client;

  try {
    // Extract if compressed
    let backupFolder = await extractBackup(selectedBackup.path);

    // If it's still pointing to a zip, get the extracted folder name
    if (backupFolder.endsWith(".zip")) {
      backupFolder = backupFolder.replace(".zip", "");
    }

    // Read metadata
    const metadataPath = path.join(backupFolder, "metadata.json");
    let metadata;

    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      console.log("\n📊 Backup info:");
      console.log(`   Date: ${metadata.date}`);
      console.log(`   Collections: ${metadata.collections.length}`);
      console.log(`   Total documents: ${metadata.totalDocuments}\n`);
    }

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db();

    // Restore each collection
    const stats = [];
    const collections = fs
      .readdirSync(backupFolder)
      .filter((file) => file.endsWith(".json") && file !== "metadata.json");

    for (const file of collections) {
      const collectionName = file.replace(".json", "");
      const filePath = path.join(backupFolder, file);
      const result = await restoreCollection(db, collectionName, filePath, {
        dropExisting: options.drop,
      });
      stats.push(result);
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalRestored = stats.reduce((sum, s) => sum + s.count, 0);

    console.log("\n" + "=".repeat(60));
    console.log("✅ RESTORE COMPLETED!");
    console.log("=".repeat(60));
    console.log(`📊 Collections processed: ${stats.length}`);
    console.log(`📄 Documents restored: ${totalRestored}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log("=".repeat(60) + "\n");

    return { success: true, stats };
  } catch (error) {
    console.error("\n❌ RESTORE FAILED!");
    console.error("Error:", error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Disconnected from MongoDB");
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    backupName: null,
    drop: false,
    skipConfirmation: false,
  };

  args.forEach((arg, index) => {
    if (arg === "--drop") {
      options.drop = true;
    } else if (arg === "--yes" || arg === "-y") {
      options.skipConfirmation = true;
    } else if (arg === "--backup" && args[index + 1]) {
      options.backupName = args[index + 1];
    } else if (arg === "--list") {
      const backups = listBackups();
      console.log("\n📋 Available backups:\n");
      backups.forEach((backup, index) => {
        console.log(
          `${index + 1}. ${backup.name}\n   Date: ${backup.date}\n   Size: ${
            backup.size
          }\n`
        );
      });
      process.exit(0);
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
MongoDB Database Restore Script

Usage:
  node scripts/restore-database.js [options]

Options:
  --list                 List all available backups
  --backup <name>        Restore specific backup by name
  --drop                 Drop existing collections before restore
  --yes, -y             Skip confirmation prompts
  --help, -h            Show this help message

Examples:
  node scripts/restore-database.js --list
  node scripts/restore-database.js
  node scripts/restore-database.js --backup backup_2025-10-16_10-30-00
  node scripts/restore-database.js --drop --yes
      `);
      process.exit(0);
    }
  });

  return options;
}

/**
 * Run restore if called directly
 */
if (require.main === module) {
  const options = parseArgs();

  performRestore(options.backupName, options)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { performRestore, listBackups };
