import { EditArticleForm } from "@/components/edit-article-form";
import { getArticleByIdAdmin, getCategories } from "@/lib/db";
import { notFound } from "next/navigation";

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = params;

  // Check if article exists
  const article = await getArticleByIdAdmin(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <EditArticleForm articleId={id} isWriterMode={true} />
    </div>
  );
}
