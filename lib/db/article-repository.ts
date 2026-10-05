import { Types } from "mongoose";
import { Article, Category } from "../models/Article";
import { dbConnect } from "./connection";
import { convertDoc } from "./serialization";
import type { ArticleInterface } from "@/lib/content/types";

export async function getArticlesByCategory(
  categorySlug: string,
  limit?: number,
): Promise<ArticleInterface[]> {
  await dbConnect();

  const category = await Category.findOne({ slug: categorySlug });
  if (!category) return [];

  const query = Article.find({
    category_id: category._id,
    is_published: true,
  })
    .populate("category_id", "name_en name_ar slug")
    .sort({ published_at: -1 });

  if (limit) {
    query.limit(limit);
  }

  const articles = await query.lean();

  return articles.map((article) => {
    const converted = convertDoc<ArticleInterface>(article);
    return {
      ...converted,
      category_name_en: article.category_id?.name_en,
      category_name_ar: article.category_id?.name_ar,
      category_slug: article.category_id?.slug,
    } as ArticleInterface;
  });
}
