import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Require admin or writer authentication
    const { ensureAdminOrWriter } = await import("@/lib/ensure-admin");
    const authCheck = await ensureAdminOrWriter(request);
    if (!authCheck.isAdmin && !authCheck.isWriter) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or writer access required." },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      console.error("[UPLOAD] No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.error(`[UPLOAD] Invalid file type: ${file.type}`);
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error(`[UPLOAD] File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "png";
    const random = Math.random().toString(36).substring(2, 12);
    const filename = `${timestamp}-${random}.${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

    // Save file to local filesystem
    await writeFile(uploadPath, buffer);
    console.log(`[UPLOAD] Saved file to ${uploadPath}`);

    // Return the public URL for DB storage
    const url = `/uploads/${filename}`;
    return NextResponse.json({
      url,
      originalName: file.name,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
