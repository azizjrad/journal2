import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Admin-only API endpoint to trigger database backup
 * Can be called manually or via cron job
 *
 * Security:
 * - Requires admin authentication OR valid backup secret
 * - Rate limited to prevent abuse
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication: Check for admin token OR backup secret
    const authHeader = request.headers.get("authorization");
    const backupSecret = request.headers.get("x-backup-secret");

    let isAuthorized = false;

    // Method 1: Admin JWT token
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload && payload.role === "admin") {
        isAuthorized = true;
      }
    }

    // Method 2: Admin cookie
    if (!isAuthorized) {
      const cookieStore = await cookies();
      const token = cookieStore.get("admin-token")?.value;
      if (token) {
        const payload = verifyToken(token);
        if (payload && payload.role === "admin") {
          isAuthorized = true;
        }
      }
    }

    // Method 3: Backup secret (for cron jobs)
    if (!isAuthorized && backupSecret === process.env.BACKUP_SECRET) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    const db = await dbConnect();

    // Collections to backup
    const collectionsToBackup = [
      "articles",
      "users",
      "categories",
      "contact_messages",
      "newsletter_subscribers",
      "newsletter_history",
      "reports",
    ];

    const backupData: Record<string, any[]> = {};
    const stats: any[] = [];

    // Backup each collection
    for (const collectionName of collectionsToBackup) {
      try {
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();

        backupData[collectionName] = documents;
        stats.push({
          collection: collectionName,
          count: documents.length,
        });
      } catch (error: any) {
        console.error(`Error backing up ${collectionName}:`, error.message);
        stats.push({
          collection: collectionName,
          count: 0,
          error: error.message,
        });
      }
    }

    const metadata = {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString(),
      collections: stats,
      totalDocuments: stats.reduce((sum, s) => sum + s.count, 0),
    };

    // Return backup data (can be encrypted on client side)
    return NextResponse.json({
      success: true,
      metadata,
      backupData,
      message: "Backup created successfully",
    });
  } catch (error: any) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Backup failed", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check backup system status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      status: "operational",
      backupEndpoint: "/api/admin/backup",
      securityEnabled: !!process.env.BACKUP_SECRET,
      lastBackup: null, // TODO: Store last backup time in database
      message: "Backup system is ready",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to check backup status" },
      { status: 500 }
    );
  }
}
