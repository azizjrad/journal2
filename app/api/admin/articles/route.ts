import { NextRequest, NextResponse } from "next/server";
import { createArticle, getAllArticlesAdmin } from "@/lib/db";
import { ensureAdminOrWriter } from "@/lib/ensure-admin";

export function GET() {
  return (async () => {
    try {
      const articles = await getAllArticlesAdmin();
      return NextResponse.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      return NextResponse.json(
        { error: "Failed to fetch articles" },
        { status: 500 }
      );
    }
  })();
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Starting article creation...");

    // Use ensureAdminOrWriter for authentication
    const authCheck = await ensureAdminOrWriter(request);
    let currentUser = null;
    if (authCheck.isAdmin || authCheck.isWriter) {
      currentUser = authCheck.user;
      console.log(
        authCheck.isAdmin
          ? "👑 Admin user creating article:"
          : "✍️ Writer creating article:",
        currentUser.id
      );
    }

    if (!currentUser) {
      console.log("❌ No authenticated user found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("[ARTICLE CREATE] Request body keys:", Object.keys(body));
    // Accept only image_url for article images
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
      tags = [],
      scheduled_for,
    } = body;

    // Validate required fields
    if (!title_en || !title_ar || !content_en || !content_ar) {
      return NextResponse.json(
        { error: "Title and content are required in both languages" },
        { status: 400 }
      );
    }

    // Validate category_id
    if (!category_id || category_id.trim() === "") {
      return NextResponse.json(
        { error: "Please select a category" },
        { status: 400 }
      );
    }

    // Determine published_at based on scheduling
    let published_at: string = "";
    let actualIsPublished = is_published;

    if (scheduled_for) {
      // If scheduled for future, set as unpublished for now
      const scheduledDate = new Date(scheduled_for);
      if (scheduledDate > new Date()) {
        actualIsPublished = false;
        published_at = ""; // Will be set when scheduled job runs
      } else {
        // If scheduled for past/present, publish immediately
        actualIsPublished = true;
        published_at = new Date().toISOString();
      }
    } else if (is_published) {
      // If publishing immediately
      published_at = new Date().toISOString();
    }

    console.log("✅ Creating article with data:", {
      title_en,
      title_ar,
      category_id,
      author_id: currentUser.id,
      is_published: actualIsPublished,
      scheduled_for,
      published_at,
    });

    const newArticle = await createArticle({
      title_en,
      title_ar,
      content_en,
      content_ar,
      excerpt_en,
      excerpt_ar,
      image_url,
      category_id, // Keep as string for MongoDB ObjectId
      author_id: currentUser.id, // Set the author
      is_published: actualIsPublished,
      is_featured,
      tags,
      published_at,
      scheduled_for,
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

    console.log("🎉 Article created successfully:", newArticle.id);
    return NextResponse.json(newArticle);
  } catch (error: any) {
    console.error("❌ Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article", details: error.message },
      { status: 500 }
    );
  }
}
