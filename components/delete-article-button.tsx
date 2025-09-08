"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteArticleButtonProps {
  articleId: string;
  articleTitle: string;
  onDelete?: (articleId: string) => void;
}

export function DeleteArticleButton({
  articleId,
  articleTitle,
  onDelete,
}: DeleteArticleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        if (onDelete) {
          onDelete(articleId);
        } else {
          router.refresh(); // Refresh the page to show updated data
        }
        setOpen(false);
        toast.success("Article deleted successfully!", {
          description: `"${articleTitle}" has been removed.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Failed to delete article", {
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Error deleting article", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {" "}
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-500/50 backdrop-blur-sm transition-all duration-200 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        {/* Glass morphism background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-2xl"></div>

        {/* Content with relative positioning */}
        <div className="relative">
          <AlertDialogHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl backdrop-blur-sm border border-red-400/30">
                <Trash2 className="h-6 w-6 text-red-300" />
              </div>
              <div>
                <AlertDialogTitle className="text-2xl font-bold text-white">
                  Delete Article
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300 mt-2">
                  This action cannot be undone. This will permanently delete the
                  article "{articleTitle}".
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3 pt-6 border-t border-white/10">
            <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Article
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
