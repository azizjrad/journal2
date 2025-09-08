import { NextRequest, NextResponse } from "next/server";
import { getArticleByIdAdmin, updateArticle, deleteArticle } from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";
import { verifyToken } from "@/lib/auth";

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      const { id } = await params;
      const article = await getArticleByIdAdmin(id); // Use string ID directly

      if (!article) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      return NextResponse.json(
        { error: "Failed to fetch article" },
        { status: 500 }
      );
    }
  })();
}

export function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      console.log("🔄 Starting article update...");

      // Check authentication - prioritize actual user authentication
      let currentUser = null;

      // First try regular user authentication (for writers)
      const authToken = request.cookies.get("auth-token")?.value;
      if (authToken) {
        try {
          currentUser = await verifyToken(authToken);
          console.log("✅ Writer authenticated:", currentUser.id);
        } catch (error) {
          console.log("❌ Invalid auth token");
        }
      }

      // If no user token, try admin authentication
      if (!currentUser) {
        try {
          await ensureAdmin();
          console.log("✅ Admin authenticated");
        } catch (error) {
          console.log("❌ Admin authentication failed:", error.message);
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }
      }

      const { id } = await params;
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

      // Validate required fields
      if (!title_en || !title_ar || !content_en || !content_ar) {
        return NextResponse.json(
          { error: "Title and content are required in both languages" },
          { status: 400 }
        );
      }

      // Validate category if provided
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

      console.log("✅ Article updated successfully:", id);
      return NextResponse.json(updatedArticle);
    } catch (error) {
      console.error("❌ Error updating article:", error);
      return NextResponse.json(
        { error: "Failed to update article" },
        { status: 500 }
      );
    }
  })();
}

export function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      console.log("🗑️ Starting article deletion...");

      // Check authentication - prioritize actual user authentication
      let currentUser = null;

      // First try regular user authentication (for writers)
      const authToken = request.cookies.get("auth-token")?.value;
      if (authToken) {
        try {
          currentUser = await verifyToken(authToken);
          console.log("✅ Writer authenticated:", currentUser.id);
        } catch (error) {
          console.log("❌ Invalid auth token");
        }
      }

      // If no user token, try admin authentication
      if (!currentUser) {
        try {
          await ensureAdmin();
          console.log("✅ Admin authenticated");
        } catch (error) {
          console.log("❌ Admin authentication failed:", error.message);
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }
      }

      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          { error: "Invalid article ID" },
          { status: 400 }
        );
      }

      // Check if article exists
      const article = await getArticleByIdAdmin(id); // Use string ID directly
      if (!article) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }

      await deleteArticle(id); // Use string ID directly

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
  })();
}
