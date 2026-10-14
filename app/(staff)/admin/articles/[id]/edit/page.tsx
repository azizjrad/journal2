import { EditArticleForm } from "@/components/articles/edit-article-form";
import { getArticleByIdAdmin } from "@/lib/content/article-service";
import { getCategories } from "@/lib/services/category-service";
import { notFound } from "next/navigation";

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const resolvedParams = await params;
  const articleId = resolvedParams.id;

  // Check if article exists
  const article = await getArticleByIdAdmin(articleId);

  if (!article) {
    notFound();
  }

  return <EditArticleForm articleId={articleId} />;
}
