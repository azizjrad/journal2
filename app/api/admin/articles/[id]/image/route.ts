import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Article } from "@/lib/models/Article";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  try {
    const article = await Article.findById(id)
      .select("image_data image_content_type")
      .lean();
    // Defensive: ensure not array
    if (!article || Array.isArray(article) || !article.image_data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return new NextResponse(Buffer.from(article.image_data), {
      status: 200,
      headers: {
        "Content-Type": article.image_content_type || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
