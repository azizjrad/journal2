import { EditArticleForm } from "@/components/edit-article-form";
import { getArticleByIdAdmin, getCategories } from "@/lib/db";
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
