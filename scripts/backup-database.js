#!/usr/bin/env node

/**
 * MongoDB Database Backup Script
 * Creates backups of all collections and stores them in JSON format
 * Can be run manually or scheduled via cron/task scheduler
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const BACKUP_DIR = path.join(__dirname, "..", "backups");
const MAX_BACKUPS = 30; // Keep last 30 backups
const COLLECTIONS_TO_BACKUP = [
  "articles",
  "users",
  "categories",
  "contact_messages",
  "newsletter_subscribers",
  "newsletter_history",
  "reports",
];

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Format date for backup filename
 */
function getBackupTimestamp() {
  const now = new Date();
  return now
    .toISOString()
    .replace(/T/, "_")
    .replace(/\..+/, "")
    .replace(/:/g, "-");
}

/**
 * Get backup folder path
 */
function getBackupFolder() {
  const timestamp = getBackupTimestamp();
  const folderName = `backup_${timestamp}`;
  const folderPath = path.join(BACKUP_DIR, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return folderPath;
}

/**
 * Backup a single collection to JSON
 */
async function backupCollection(db, collectionName, backupFolder) {
  try {
    console.log(`📦 Backing up collection: ${collectionName}...`);

    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    const filePath = path.join(backupFolder, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

    console.log(
      `✅ Backed up ${documents.length} documents from ${collectionName}`
    );
    return { collection: collectionName, count: documents.length };
  } catch (error) {
    console.error(`❌ Error backing up ${collectionName}:`, error.message);
    return { collection: collectionName, count: 0, error: error.message };
  }
}

/**
 * Create metadata file for the backup
 */
function createMetadata(backupFolder, stats) {
  const metadata = {
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleString(),
    collections: stats,
    totalDocuments: stats.reduce((sum, s) => sum + s.count, 0),
    mongodbUri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"), // Hide credentials
  };

  const metadataPath = path.join(backupFolder, "metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  return metadata;
}

/**
 * Clean old backups (keep only MAX_BACKUPS)
 */
function cleanOldBackups() {
  try {
    const backups = fs
      .readdirSync(BACKUP_DIR)
      .filter((name) => name.startsWith("backup_"))
      .map((name) => ({
        name,
        path: path.join(BACKUP_DIR, name),
        time: fs.statSync(path.join(BACKUP_DIR, name)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (backups.length > MAX_BACKUPS) {
      console.log(`\n🧹 Cleaning old backups (keeping last ${MAX_BACKUPS})...`);
      backups.slice(MAX_BACKUPS).forEach((backup) => {
        console.log(`   Deleting: ${backup.name}`);
        fs.rmSync(backup.path, { recursive: true, force: true });
      });
    }
  } catch (error) {
    console.error("Error cleaning old backups:", error.message);
  }
}

/**
 * Use mongodump for binary backup (recommended for production)
 * Requires MongoDB tools to be installed
 */
async function createBinaryBackup(backupFolder) {
  try {
    console.log("\n📦 Creating binary backup with mongodump...");

    // Parse MongoDB URI
    const uri = new URL(MONGODB_URI);
    const dbName = uri.pathname.slice(1).split("?")[0];

    const dumpPath = path.join(backupFolder, "mongodump");
    const command = `mongodump --uri="${MONGODB_URI}" --out="${dumpPath}"`;

    await execPromise(command);
    console.log("✅ Binary backup created successfully");
    return true;
  } catch (error) {
    console.log("⚠️  mongodump not available (install MongoDB Database Tools)");
    console.log("   Falling back to JSON backup only");
    return false;
  }
}

/**
 * Compress backup folder to .tar.gz or .zip
 */
async function compressBackup(backupFolder) {
  try {
    const folderName = path.basename(backupFolder);
    const archivePath = `${backupFolder}.zip`;

    console.log("\n📦 Compressing backup...");

    // Use PowerShell's Compress-Archive on Windows
    const command = `powershell -Command "Compress-Archive -Path '${backupFolder}' -DestinationPath '${archivePath}' -Force"`;

    await execPromise(command);

    // Remove uncompressed folder
    fs.rmSync(backupFolder, { recursive: true, force: true });

    const stats = fs.statSync(archivePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup compressed: ${folderName}.zip (${sizeMB} MB)`);
    return archivePath;
  } catch (error) {
    console.log("⚠️  Could not compress backup:", error.message);
    return backupFolder;
  }
}

/**
 * Main backup function
 */
async function performBackup() {
  const startTime = Date.now();
  console.log("🚀 Starting MongoDB backup...\n");
  console.log("=".repeat(60));

  if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in environment variables");
    process.exit(1);
  }

  let client;

  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db();
    const backupFolder = getBackupFolder();

    console.log(`📁 Backup location: ${backupFolder}\n`);

    // Backup each collection
    const stats = [];
    for (const collectionName of COLLECTIONS_TO_BACKUP) {
      const result = await backupCollection(db, collectionName, backupFolder);
      stats.push(result);
    }

    // Create metadata
    console.log("\n📝 Creating backup metadata...");
    const metadata = createMetadata(backupFolder, stats);

    // Try binary backup (if mongodump is available)
    await createBinaryBackup(backupFolder);

    // Compress backup
    const finalPath = await compressBackup(backupFolder);

    // Clean old backups
    cleanOldBackups();

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n" + "=".repeat(60));
    console.log("✅ BACKUP COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`📊 Total collections: ${stats.length}`);
    console.log(`📄 Total documents: ${metadata.totalDocuments}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📁 Location: ${finalPath}`);
    console.log("=".repeat(60) + "\n");

    return { success: true, metadata, path: finalPath };
  } catch (error) {
    console.error("\n❌ BACKUP FAILED!");
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
 * Run backup if called directly
 */
if (require.main === module) {
  performBackup()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { performBackup };
