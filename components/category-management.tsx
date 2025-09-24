"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/use-toast";

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  parent_id?: string;
  subcategories?: Category[];
  created_at: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onCategoriesUpdate: (categories: Category[]) => void;
}

export function CategoryManagement({
  categories,
  onCategoriesUpdate,
}: CategoryManagementProps) {
  const [currentCategories, setCurrentCategories] = useState(categories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    parent_id: "none",
  });

  // Pagination state for categories
  const [categoriesCurrentPage, setCategoriesCurrentPage] = useState(1);
  const categoriesPerPage = 10;

  // Calculate pagination for categories
  const totalCategoryPages = Math.ceil(
    currentCategories.length / categoriesPerPage
  );
  const startCategoryIndex = (categoriesCurrentPage - 1) * categoriesPerPage;
  const endCategoryIndex = startCategoryIndex + categoriesPerPage;
  const paginatedCategories = currentCategories.slice(
    startCategoryIndex,
    endCategoryIndex
  );

  const router = useRouter();

  const resetForm = () => {
    setFormData({ name_en: "", name_ar: "", parent_id: "none" });
  };

  const handleCreate = async () => {
    if (!formData.name_en.trim() || !formData.name_ar.trim()) return;

    console.log("Creating category with data:", formData);
    setLoading(true);
    try {
      // Prepare data for API - convert "none" to empty string for parent_id
      const apiData = {
        ...formData,
        parent_id: formData.parent_id === "none" ? "" : formData.parent_id,
      };

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      console.log("Create response status:", response.status);

      if (response.ok) {
        const newCategory = await response.json();
        console.log("New category created:", newCategory);
        const updatedCategories = [...currentCategories, newCategory];
        setCurrentCategories(updatedCategories);
        onCategoriesUpdate(updatedCategories);
        setIsCreateOpen(false);
        resetForm();
        router.refresh();
        toast.success("Category created successfully!", {
          description: `${formData.name_en} has been added to your categories.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Create category error:", errorData);
        toast.error("Failed to create category", {
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error creating category", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (
      !editingCategory ||
      !formData.name_en.trim() ||
      !formData.name_ar.trim()
    )
      return;

    console.log(
      "Editing category:",
      editingCategory.id,
      "with data:",
      formData
    );
    setLoading(true);
    try {
      // Prepare data for API - convert "none" to empty string for parent_id
      const apiData = {
        ...formData,
        parent_id: formData.parent_id === "none" ? "" : formData.parent_id,
      };

      const response = await fetch(
        `/api/admin/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        }
      );

      console.log("Edit response status:", response.status);

      if (response.ok) {
        const updatedCategory = await response.json();
        console.log("Category updated:", updatedCategory);
        const updatedCategories = currentCategories.map((cat) =>
          cat.id === editingCategory.id ? updatedCategory : cat
        );
        setCurrentCategories(updatedCategories);
        onCategoriesUpdate(updatedCategories);
        setEditingCategory(null);
        resetForm();
        router.refresh();
        toast.success("Category updated successfully!", {
          description: `${formData.name_en} has been updated.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Edit category error:", errorData);
        toast.error("Failed to update category", {
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (categoryId: string) => {
    console.log("Deleting category:", categoryId);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      console.log("Delete response status:", response.status);

      if (response.ok) {
        console.log("Category deleted successfully");
        const updatedCategories = currentCategories.filter(
          (cat) => cat.id !== categoryId
        );
        setCurrentCategories(updatedCategories);
        onCategoriesUpdate(updatedCategories);

        // Handle pagination when deleting the last item on current page
        const newTotalPages = Math.ceil(
          updatedCategories.length / categoriesPerPage
        );
        if (categoriesCurrentPage > newTotalPages && newTotalPages > 0) {
          setCategoriesCurrentPage(newTotalPages);
        } else if (updatedCategories.length === 0) {
          setCategoriesCurrentPage(1);
        }
        router.refresh();
        toast.success("Category deleted successfully!", {
          description: "The category has been removed from your system.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete category error:", errorData);
        toast.error("Failed to delete category", {
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name_en,
      name_ar: category.name_ar,
      parent_id: category.parent_id || "none",
    });
  };
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Category Management</h2>
          <p className="text-gray-300 mt-1">
            Organize your content with custom categories
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
            {/* Glass morphism background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-2xl"></div>

            {/* Content with relative positioning */}
            <div className="relative">
              <DialogHeader className="space-y-4 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-purple-400/30">
                    <Plus className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">
                      Create New Category
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 mt-2">
                      Add a new category for organizing articles.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label
                    htmlFor="name_en"
                    className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></span>
                    English Name
                  </Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name_en: e.target.value,
                      }))
                    }
                    placeholder="Business"
                    className="h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-xl transition-all duration-200 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="name_ar"
                    className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"></span>
                    Arabic Name
                  </Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name_ar: e.target.value,
                      }))
                    }
                    placeholder="أعمال"
                    className="h-12 font-arabic text-right bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-xl transition-all duration-200 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="parent_id"
                    className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"></span>
                    Parent Category (Optional)
                  </Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        parent_id: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Select parent category..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl">
                      <SelectItem
                        value="none"
                        className="text-gray-300 focus:bg-white/10 focus:text-white"
                      >
                        None (Top-level category)
                      </SelectItem>
                      {currentCategories
                        .filter((cat) => !cat.parent_id) // Only show top-level categories
                        .map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="text-gray-300 focus:bg-white/10 focus:text-white"
                          >
                            {category.name_en}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                  className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    loading ||
                    !formData.name_en.trim() ||
                    !formData.name_ar.trim()
                  }
                  className="h-12 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Category
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>{" "}
      {/* Categories List */}
      <div className="space-y-4">
        {currentCategories.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No categories yet
            </h3>
            <p className="text-gray-300 mb-6">
              Create your first category to organize content
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </div>
        ) : (
          <>
            {" "}
            <div className="space-y-4">
              {paginatedCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm">
                          <Tag className="h-5 w-5 text-purple-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {category.name_en}
                          </h3>
                          <p className="text-gray-300 font-arabic mb-4 leading-relaxed">
                            {category.name_ar}
                          </p>

                          <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 backdrop-blur-sm">
                              Category
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-400">
                            Created{" "}
                            {new Date(category.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Edit/Delete Buttons: always visible, wrap on mobile */}
                    <div className="flex flex-row flex-wrap gap-2 ml-0 sm:ml-6 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                      <Dialog
                        open={editingCategory?.id === category.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingCategory(null);
                            resetForm();
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => openEditDialog(category)}
                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                          {/* Glass morphism background overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-2xl"></div>

                          {/* Content with relative positioning */}
                          <div className="relative">
                            <DialogHeader className="space-y-4 pb-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-purple-400/30">
                                  <Edit className="h-6 w-6 text-purple-300" />
                                </div>
                                <div>
                                  <DialogTitle className="text-2xl font-bold text-white">
                                    Edit Category
                                  </DialogTitle>
                                  <DialogDescription className="text-gray-300 mt-2">
                                    Update the category information.
                                  </DialogDescription>
                                </div>
                              </div>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              <div className="space-y-3">
                                <Label
                                  htmlFor="edit_name_en"
                                  className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                                >
                                  <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></span>
                                  English Name
                                </Label>
                                <Input
                                  id="edit_name_en"
                                  value={formData.name_en}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      name_en: e.target.value,
                                    }))
                                  }
                                  placeholder="Business"
                                  className="h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-xl transition-all duration-200 text-lg"
                                />
                              </div>

                              <div className="space-y-3">
                                <Label
                                  htmlFor="edit_name_ar"
                                  className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                                >
                                  <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"></span>
                                  Arabic Name
                                </Label>
                                <Input
                                  id="edit_name_ar"
                                  value={formData.name_ar}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      name_ar: e.target.value,
                                    }))
                                  }
                                  placeholder="أعمال"
                                  className="h-12 font-arabic text-right bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-xl transition-all duration-200 text-lg"
                                />
                              </div>
                            </div>

                            <DialogFooter className="gap-3 pt-6 border-t border-white/10">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(null);
                                  resetForm();
                                }}
                                className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleEdit}
                                disabled={loading}
                                className="h-12 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Updating...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Update Category
                                  </div>
                                )}
                              </Button>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>{" "}
                      <AlertDialog>
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
                                    Delete Category
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-300 mt-2">
                                    This action cannot be undone. This will
                                    permanently delete the category "
                                    {category.name_en}".
                                  </AlertDialogDescription>
                                </div>
                              </div>
                            </AlertDialogHeader>

                            <AlertDialogFooter className="gap-3 pt-6 border-t border-white/10">
                              <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(category.id)}
                                className="h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                              >
                                <div className="flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  Delete Category
                                </div>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>{" "}
                </div>
              ))}
            </div>
            {/* Pagination for categories */}
            <Pagination
              currentPage={categoriesCurrentPage}
              totalPages={totalCategoryPages}
              onPageChange={setCategoriesCurrentPage}
              itemsPerPage={categoriesPerPage}
              totalItems={currentCategories.length}
            />
          </>
        )}
      </div>
    </div>
  );
}
