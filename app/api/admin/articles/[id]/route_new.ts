import { NextRequest, NextResponse } from "next/server";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db";

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      const { id } = await params;
      const articleId = parseInt(id);
      const article = await getArticleById(articleId);

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

export function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    try {
      const { id } = await params;
      const articleId = parseInt(id);

      if (!articleId || isNaN(articleId)) {
        return NextResponse.json(
          { error: "Invalid article ID" },
          { status: 400 }
        );
      }

      // Check if article exists
      const article = await getArticleById(articleId);
      if (!article) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }

      await deleteArticle(articleId);

      return NextResponse.json({
        success: true,
        message: "Article deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      return NextResponse.json(
        { error: "Failed to delete article" },
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
      const { id } = await params;
      const articleId = parseInt(id);
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
        tags = [],
      } = body;

      if (!title_en || !title_ar || !content_en || !content_ar) {
        return NextResponse.json(
          { error: "Title and content are required in both languages" },
          { status: 400 }
        );
      }

      const updatedArticle = await updateArticle(articleId, {
        title_en,
        title_ar,
        content_en,
        content_ar,
        excerpt_en,
        excerpt_ar,
        image_url,
        category_id: category_id ? parseInt(category_id) : undefined,
        is_published,
        is_featured,
        tags,
      });

      return NextResponse.json(updatedArticle);
    } catch (error) {
      console.error("Error updating article:", error);
      return NextResponse.json(
        { error: "Failed to update article" },
        { status: 500 }
      );
    }
  })();
}
