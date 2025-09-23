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

    console.log(`[UPLOAD] File received: name=${file.name}, type=${file.type}, size=${file.size}, bufferLength=${buffer.length}`);

    // Instead of saving to disk, return the buffer and contentType for DB storage
    // (The frontend or article creation endpoint should now handle storing this in the Article document)
    return NextResponse.json({
      image_data: buffer.toString("base64"),
      image_content_type: file.type,
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
