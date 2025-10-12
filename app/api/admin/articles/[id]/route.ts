// ...existing code...
// ...existing code...
import { NextRequest, NextResponse } from "next/server";
import { getArticleByIdAdmin, updateArticle, deleteArticle } from "@/lib/db";
import { ensureAdminOrWriter, ensureAdmin } from "@/lib/ensure-admin";
import { verifyToken } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing article id" },
        { status: 400 }
      );
    }
    const article = await getArticleByIdAdmin(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// ...existing code...

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // CSRF protection
  if (!validateCsrf(request)) {
    return NextResponse.json(
      { error: "Invalid security token" },
      { status: 403 }
    );
  }

  try {
    console.log("🔄 Starting article update...");
    let currentUser = null;
    const authToken = request.cookies.get("auth-token")?.value;
    if (authToken) {
      try {
        currentUser = await verifyToken(authToken);
        if (currentUser) {
          console.log("✅ Writer authenticated:", currentUser.userId);
        }
      } catch (error) {
        console.log("❌ Invalid auth token");
      }
    }
    if (!currentUser) {
      try {
        await ensureAdmin(request);
        console.log("✅ Admin authenticated");
      } catch (error) {
        console.log(
          "❌ Admin authentication failed:",
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : error
        );
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }
    const { id } = context.params;
    const body = await request.json();
    const {
      title_en,
      title_ar,
      content_en,
      content_ar,
      excerpt_en,
      excerpt_ar,
      image_url,
      category_id,
      is_published = false,
      is_featured = false,
      scheduled_for,
      meta_description_en,
      meta_description_ar,
      meta_keywords_en,
      meta_keywords_ar,
      published_at,
      tags = [],
    } = body;
    if (!title_en || !title_ar || !content_en || !content_ar) {
      return NextResponse.json(
        { error: "Title and content are required in both languages" },
        { status: 400 }
      );
    }
    if (category_id && category_id.trim() === "") {
      return NextResponse.json(
        { error: "Please select a valid category" },
        { status: 400 }
      );
    }
    const updatedArticle = await updateArticle(id, {
      title_en,
      title_ar,
      content_en,
      content_ar,
      excerpt_en,
      excerpt_ar,
      image_url,
      category_id: category_id ? category_id : undefined,
      is_published,
      is_featured,
      scheduled_for,
      meta_description_en,
      meta_description_ar,
      meta_keywords_en,
      meta_keywords_ar,
      published_at,
      tags,
    });

    // Invalidate Redis cache for featured articles
    try {
      const { getRedis } = await import("@/lib/redis");
      const redis = await getRedis();
      await redis.del("featuredArticles");
      console.log("🧹 Redis cache invalidated: featuredArticles");
    } catch (err) {
      console.error("Redis cache invalidation failed:", err);
    }

    console.log("\u2705 Article updated successfully:", id);
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("❌ Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // CSRF protection
  if (!validateCsrf(request)) {
    return NextResponse.json(
      { error: "Invalid security token" },
      { status: 403 }
    );
  }

  try {
    console.log("🗑️ Starting article deletion...");
    const authCheck = await ensureAdminOrWriter(request);
    if (!authCheck.isAdmin && !authCheck.isWriter) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Invalid article ID" },
        { status: 400 }
      );
    }
    const article = await getArticleByIdAdmin(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    // Only allow if admin or writer owns the article
    if (
      authCheck.isWriter &&
      String(article.author_id) !== String(authCheck.user?.id)
    ) {
      return NextResponse.json(
        { error: "You can only delete your own articles" },
        { status: 403 }
      );
    }
    await deleteArticle(id);

    // Invalidate Redis cache for featured articles
    try {
      const { getRedis } = await import("@/lib/redis");
      const redis = await getRedis();
      await redis.del("featuredArticles");
      console.log("🧹 Redis cache invalidated: featuredArticles");
    } catch (err) {
      console.error("Redis cache invalidation failed:", err);
    }

    console.log("✅ Article deleted successfully:", id);
    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
