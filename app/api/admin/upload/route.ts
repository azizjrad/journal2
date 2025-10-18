import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    console.log("[UPLOAD] Uploading to Cloudinary...");
    const result = await uploadToCloudinary(buffer, "articles");
    console.log(`[UPLOAD] Successfully uploaded to Cloudinary:`, result.url);

    // Return the Cloudinary URL for DB storage
    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      originalName: file.name,
      size: file.size,
      contentType: file.type,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error: any) {
    console.error("[UPLOAD] Error uploading file:", error);
    console.error("[UPLOAD] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Check if it's a Cloudinary configuration error
    if (error.message?.includes("Must supply api_key")) {
      return NextResponse.json(
        {
          error:
            "Cloudinary not configured. Please set CLOUDINARY_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    if (error.message?.includes("Must supply cloud_name")) {
      return NextResponse.json(
        {
          error:
            "Cloudinary not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to upload file",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
