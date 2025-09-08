import { NewArticleForm } from "@/components/new-article-form";
import { getCategories } from "@/lib/db";

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <NewArticleForm categories={categories} isWriterMode={true} />
    </div>
  );
}
