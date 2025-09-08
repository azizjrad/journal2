import { NewArticleForm } from "@/components/new-article-form";
import { getCategories } from "@/lib/db";

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <NewArticleForm categories={categories} />
    </div>
  );
}
