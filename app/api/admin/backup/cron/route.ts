import { NextRequest, NextResponse } from "next/server";

/**
 * Cron job endpoint for automated backups
 * Called by Vercel Cron (requires Vercel Pro plan)
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/admin/backup/cron",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron
    const authHeader = request.headers.get("authorization");

    // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕐 Cron backup started:", new Date().toISOString());

    // Call the backup endpoint internally
    const backupUrl = new URL("/api/admin/backup", request.url);
    const backupResponse = await fetch(backupUrl.toString(), {
      method: "POST",
      headers: {
        "x-backup-secret": process.env.BACKUP_SECRET || "",
      },
    });

    if (!backupResponse.ok) {
      throw new Error(`Backup failed: ${backupResponse.statusText}`);
    }

    const backupData = await backupResponse.json();

    console.log("✅ Cron backup completed:", {
      totalDocuments: backupData.metadata?.totalDocuments,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send success notification (email, Slack, etc.)
    // await sendBackupNotification(backupData.metadata);

    return NextResponse.json({
      success: true,
      message: "Backup completed successfully",
      metadata: backupData.metadata,
    });
  } catch (error: any) {
    console.error("❌ Cron backup failed:", error);

    // TODO: Send failure alert
    // await sendBackupFailureAlert(error.message);

    return NextResponse.json(
      { error: "Backup failed", message: error.message },
      { status: 500 }
    );
  }
}
