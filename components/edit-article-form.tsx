"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  Image as ImageIcon,
  Tag as TagIcon,
  ArrowLeft,
  Eye,
  Clock,
  XCircle,
  Save,
} from "lucide-react";
import Image from "next/image";
import { toast } from "@/lib/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
}

interface EditArticleFormProps {
  articleId: string;
  isWriterMode?: boolean;
}

export function EditArticleForm({
  articleId,
  isWriterMode = false,
}: EditArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Helper function to get the correct dashboard path
  const getDashboardPath = () => (isWriterMode ? "/writer" : "/admin");
  const [originalData, setOriginalData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    content_en: "",
    content_ar: "",
    excerpt_en: "",
    excerpt_ar: "",
    image_url: "",
    category_id: "",
    is_featured: false,
    is_published: true,
    scheduled_for: "",
    meta_description_en: "",
    meta_description_ar: "",
    meta_keywords_en: "",
    meta_keywords_ar: "",
  });

  // Load article data and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        // Fetch article data and categories in parallel
        const [articleResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/admin/articles/${articleId}`, {
            credentials: "include",
          }),
          fetch("/api/admin/categories", {
            credentials: "include",
          }),
        ]);

        if (!articleResponse.ok) {
          throw new Error("Failed to fetch article data");
        }

        const [articleData, categoriesData] = await Promise.all([
          articleResponse.json(),
          categoriesResponse.json(),
        ]);

        // Set form data with existing article data

        // Always treat category_id as string
        const formattedData = {
          title_en: articleData.title_en || "",
          title_ar: articleData.title_ar || "",
          content_en: articleData.content_en || "",
          content_ar: articleData.content_ar || "",
          excerpt_en: articleData.excerpt_en || "",
          excerpt_ar: articleData.excerpt_ar || "",
          image_url: articleData.image_url || "",
          category_id: articleData.category_id
            ? String(articleData.category_id)
            : "",
          is_featured: articleData.is_featured || false,
          is_published: articleData.is_published || false,
          scheduled_for: articleData.scheduled_for || "",
          meta_description_en: articleData.meta_description_en || "",
          meta_description_ar: articleData.meta_description_ar || "",
          meta_keywords_en: articleData.meta_keywords_en || "",
          meta_keywords_ar: articleData.meta_keywords_ar || "",
        };

        // Add fallback only if not present by id or name, then deduplicate
        let updatedCategories: Category[] = categoriesData.map(
          (cat: Category) => ({ ...cat, id: String(cat.id) })
        );
        const hasCategoryId = updatedCategories.some(
          (cat: Category) => cat.id === formattedData.category_id
        );
        const hasCategoryName = updatedCategories.some(
          (cat: Category) =>
            cat.name_en === articleData.category_name_en ||
            cat.name_ar === articleData.category_name_ar
        );
        if (formattedData.category_id && !hasCategoryId && !hasCategoryName) {
          updatedCategories = [
            ...updatedCategories,
            {
              id: formattedData.category_id,
              name_en: articleData.category_name_en || "(Deleted Category)",
              name_ar: articleData.category_name_ar || "(تصنيف محذوف)",
            },
          ];
        }
        // Deduplicate by id
        const dedupedCategories: Category[] = Array.from(
          new Map(
            updatedCategories.map((cat: Category) => [cat.id, cat])
          ).values()
        );

        // If a category with the same name but different id exists, use its id for pre-selection
        let preselectCategoryId = formattedData.category_id;
        const realCategory = dedupedCategories.find(
          (cat: Category) =>
            cat.name_en === articleData.category_name_en ||
            cat.name_ar === articleData.category_name_ar
        );
        if (realCategory) {
          preselectCategoryId = realCategory.id;
        }

        setFormData({ ...formattedData, category_id: preselectCategoryId });
        setOriginalData({ ...formattedData, category_id: preselectCategoryId });
        setCategories(dedupedCategories);

        // Set image preview if exists
        if (articleData.image_url) {
          setImagePreview(articleData.image_url);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load article data");
      } finally {
        setLoadingData(false);
      }
    };

    if (articleId) {
      loadData();
    }
  }, [articleId]);

  // Handle browser navigation/refresh when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        setShowBackDialog(true);
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [formData, originalData, imageFile]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalData) return false;

    // Check form data changes
    const formDataChanged = Object.keys(formData).some((key) => {
      const currentValue = formData[key as keyof typeof formData];
      const originalValue = originalData[key as keyof typeof originalData];

      // Handle different data types properly
      if (
        typeof currentValue === "boolean" &&
        typeof originalValue === "boolean"
      ) {
        return currentValue !== originalValue;
      }

      // Special handling for meta_keywords (tags) fields
      if (key === "meta_keywords_en" || key === "meta_keywords_ar") {
        const currentFormatted = formatTags(String(currentValue || ""));
        const originalFormatted = formatTags(String(originalValue || ""));
        return currentFormatted !== originalFormatted;
      }

      // Convert to strings for comparison to handle potential type differences
      return (
        String(currentValue || "").trim() !== String(originalValue || "").trim()
      );
    });

    // Check if new image has been uploaded
    const imageChanged = imageFile !== null;

    return formDataChanged || imageChanged;
  };

  // Get detailed changes for user feedback
  const getChangedFields = () => {
    if (!originalData) return [];

    const changes: string[] = [];

    // Check specific field categories
    const titleChanged =
      formData.title_en !== originalData.title_en ||
      formData.title_ar !== originalData.title_ar;
    const contentChanged =
      formData.content_en !== originalData.content_en ||
      formData.content_ar !== originalData.content_ar;
    const excerptChanged =
      formData.excerpt_en !== originalData.excerpt_en ||
      formData.excerpt_ar !== originalData.excerpt_ar;
    const metaChanged =
      formData.meta_description_en !== originalData.meta_description_en ||
      formData.meta_description_ar !== originalData.meta_description_ar ||
      formData.meta_keywords_en !== originalData.meta_keywords_en ||
      formData.meta_keywords_ar !== originalData.meta_keywords_ar;
    const settingsChanged =
      formData.is_featured !== originalData.is_featured ||
      formData.is_published !== originalData.is_published ||
      formData.category_id !== originalData.category_id ||
      formData.scheduled_for !== originalData.scheduled_for;

    if (titleChanged) changes.push("Article title");
    if (contentChanged) changes.push("Article content");
    if (excerptChanged) changes.push("Article excerpt");
    if (metaChanged) changes.push("SEO metadata");
    if (settingsChanged) changes.push("Publication settings");
    if (imageFile) changes.push("Article image");

    return changes;
  };

  const formatTags = (tagsString: string): string => {
    return tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(", ");
  };

  const handleTagsChange =
    (field: "meta_keywords_en" | "meta_keywords_ar") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData({ ...formData, [field]: value });
    };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Unsupported image type. Only JPEG, PNG, GIF, and WebP are allowed."
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      setFormData({ ...formData, image_url: "" });

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // MVP ONLY: Set to true to use frontend image storage (public/uploads)
  // To disable for production, set MVP_IMAGE_STORAGE = false
  const MVP_IMAGE_STORAGE = true;

  // Upload image and return { image_url } for DB storage
  const uploadImage = async (file: File): Promise<{ image_url?: string }> => {
    if (MVP_IMAGE_STORAGE) {
      // Simulate frontend upload: save to public/uploads and return relative URL
      // In production, this should be replaced with backend/external upload
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Upload failed with status: ${response.status}`
          );
        }
        const data = await response.json();
        if (data.url) {
          // Always use relative URL for MVP
          return { image_url: data.url };
        }
        return {};
      } catch (error) {
        console.error("Image upload error:", error);
        throw error;
      }
    } else {
      // Production: use backend/external upload logic here
      // ...existing code...
      return {};
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      setShowBackDialog(true);
    } else {
      router.push(getDashboardPath());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation for category_id
    if (!formData.category_id) {
      toast({
        title: "Please select a category before submitting.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    try {
      // Check if there are any changes before proceeding
      const hasChanges = hasUnsavedChanges();

      let image_url = formData.image_url;
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile);
          if (uploadResult.image_url) {
            image_url = uploadResult.image_url;
          }
        } catch (error) {
          toast({
            title: "Failed to upload image",
            description: "Please try again or use a different image.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const updateData = {
        ...formData,
        image_url,
        published_at: formData.is_published ? new Date().toISOString() : null,
        meta_keywords_en: formatTags(formData.meta_keywords_en),
        meta_keywords_ar: formatTags(formData.meta_keywords_ar),
      };

      // If no changes were made and no new image was uploaded, just navigate back
      if (!hasChanges && !imageFile) {
        router.push(getDashboardPath());
        return;
      }

      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // Only show success toast if there were actual changes
        if (hasChanges || imageFile) {
          toast({
            title: "Article updated successfully!",
            description: "Your changes have been saved.",
            variant: "success",
          });
        }

        // Update originalData to reflect the new state
        setOriginalData(updateData);
        router.push(getDashboardPath());
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Failed to update article",
          description: errorData.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Error updating article",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading article data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackClick}
                variant="outline"
                className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">
                    Edit Article
                  </h1>
                  {(hasUnsavedChanges() || imageFile) && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30 animate-pulse">
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">
                  Update your article content and settings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700 [&>button]:hidden">
                  <DialogHeader className="relative">
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-100 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10">
                      <X className="h-5 w-5 text-red-500 hover:text-red-400 transition-colors duration-200" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                    <DialogTitle className="text-slate-200 text-center">
                      Article Preview
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-slate-300">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {formData.title_en || "Article Title"}
                      </h2>
                      <p className="text-slate-400">
                        {formData.excerpt_en ||
                          "Article excerpt will appear here..."}
                      </p>
                    </div>
                    {(imagePreview || formData.image_url) && (
                      <div className="relative w-full h-64 bg-slate-700 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview || formData.image_url}
                          alt="Article preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">
                        {formData.content_en ||
                          "Article content will appear here..."}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-600/50">
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-400" />
                Article Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {imagePreview ? (
                <div className="relative w-full max-w-md mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Article preview"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover rounded-lg border border-slate-600/50"
                  />
                  <Button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1 h-8 w-8 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-slate-600/50 bg-slate-700/30 rounded-lg p-8 text-center hover:border-slate-500/50 hover:bg-slate-700/50 transition-all duration-200">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-slate-500 text-sm">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full mt-4 border-slate-600/50 bg-slate-700/30 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                {imagePreview ? "Change Image" : "Select Image"}
              </Button>
            </CardContent>
          </Card>

          {/* Article Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* English Content */}
            <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-b border-slate-600/50">
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  English Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label
                    htmlFor="title_en"
                    className="text-sm font-medium text-slate-300"
                  >
                    Article Title
                  </Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Enter the article title in English"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="excerpt_en"
                    className="text-sm font-medium text-slate-300"
                  >
                    Article Excerpt
                  </Label>
                  <Textarea
                    id="excerpt_en"
                    value={formData.excerpt_en}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt_en: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Brief summary of the article"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="content_en"
                    className="text-sm font-medium text-slate-300"
                  >
                    Article Content
                  </Label>
                  <Textarea
                    id="content_en"
                    value={formData.content_en}
                    onChange={(e) =>
                      setFormData({ ...formData, content_en: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Write the full article content here..."
                    rows={12}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Arabic Content */}
            <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-b border-slate-600/50">
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Arabic Content / المحتوى العربي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label
                    htmlFor="title_ar"
                    className="text-sm font-medium text-slate-300"
                  >
                    Article Title / عنوان المقال
                  </Label>
                  <Input
                    id="title_ar"
                    value={formData.title_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, title_ar: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="أدخل عنوان المقال بالعربية"
                    dir="rtl"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="excerpt_ar"
                    className="text-sm font-medium text-slate-300"
                  >
                    Article Excerpt / مقتطف المقال
                  </Label>
                  <Textarea
                    id="excerpt_ar"
                    value={formData.excerpt_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt_ar: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="ملخص موجز للمقال"
                    rows={3}
                    dir="rtl"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="content_ar"
                    className="text-sm font-medium text-slate-300"
                  >
                    Article Content / محتوى المقال
                  </Label>
                  <Textarea
                    id="content_ar"
                    value={formData.content_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, content_ar: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="اكتب محتوى المقال الكامل هنا..."
                    rows={12}
                    dir="rtl"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SEO and Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* English SEO */}
            <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-cyan-600/20 to-cyan-700/20 border-b border-slate-600/50">
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  SEO & Metadata (English)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="meta_description_en"
                      className="text-sm font-medium text-slate-300"
                    >
                      Meta Description
                    </Label>
                    <Textarea
                      id="meta_description_en"
                      value={formData.meta_description_en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description_en: e.target.value,
                        })
                      }
                      className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200"
                      placeholder="Brief description for search engines (150-160 chars)"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {formData.meta_description_en.length}/160 characters
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="meta_keywords_en"
                      className="text-sm font-medium text-slate-300"
                    >
                      Tags/Keywords
                    </Label>
                    <Input
                      id="meta_keywords_en"
                      value={formData.meta_keywords_en}
                      onChange={handleTagsChange("meta_keywords_en")}
                      onBlur={(e) => {
                        const formatted = formatTags(e.target.value);
                        setFormData({
                          ...formData,
                          meta_keywords_en: formatted,
                        });
                      }}
                      className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200"
                      placeholder="technology, news, article (comma separated)"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Separate tags with commas. Hash symbols (#) will be added
                      automatically.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Arabic SEO */}
            <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 border-b border-slate-600/50">
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  SEO & Metadata (Arabic)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="meta_description_ar"
                      className="text-sm font-medium text-slate-300"
                    >
                      Meta Description / وصف ميتا
                    </Label>
                    <Textarea
                      id="meta_description_ar"
                      value={formData.meta_description_ar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description_ar: e.target.value,
                        })
                      }
                      className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="وصف موجز لمحركات البحث (150-160 حرف)"
                      rows={3}
                      maxLength={160}
                      dir="rtl"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {formData.meta_description_ar.length}/160 characters
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="meta_keywords_ar"
                      className="text-sm font-medium text-slate-300"
                    >
                      Tags/Keywords
                    </Label>
                    <Input
                      id="meta_keywords_ar"
                      value={formData.meta_keywords_ar}
                      onChange={handleTagsChange("meta_keywords_ar")}
                      onBlur={(e) => {
                        const formatted = formatTags(e.target.value);
                        setFormData({
                          ...formData,
                          meta_keywords_ar: formatted,
                        });
                      }}
                      className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="تكنولوجيا، أخبار، مقال (فصل بالفواصل)"
                      dir="rtl"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      فصل العلامات بالفواصل. ستتم إضافة رموز الهاش (#) تلقائياً.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Article Settings */}
          <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-600/50">
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Article Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium text-slate-300"
                    >
                      Category
                    </Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category_id: value })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="text-slate-200 focus:bg-slate-700 focus:text-slate-200 hover:bg-slate-700 hover:text-slate-200"
                          >
                            {category.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="image_url"
                      className="text-sm font-medium text-slate-300"
                    >
                      Image URL (Optional)
                    </Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Leave empty if you uploaded an image above
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex flex-col">
                      <Label
                        htmlFor="is_featured"
                        className="text-sm font-medium text-slate-300 cursor-pointer"
                      >
                        Featured Article
                      </Label>
                      <span className="text-xs text-slate-500 mt-1">
                        Highlight this article on the homepage
                      </span>
                    </div>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_featured: checked })
                      }
                      className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-slate-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex flex-col">
                      <Label
                        htmlFor="is_published"
                        className="text-sm font-medium text-slate-300 cursor-pointer"
                      >
                        Publish Immediately
                      </Label>
                      <span className="text-xs text-slate-500 mt-1">
                        Make this article live immediately
                      </span>
                    </div>
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_published: checked })
                      }
                      className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-slate-600"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowCancelDialog(true)}
                  variant="outline"
                  className={`border-slate-600/50 bg-slate-700/30 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200 sm:w-auto w-full ${
                    hasUnsavedChanges()
                      ? "border-red-500/50 bg-red-900/20 text-red-300 hover:bg-red-800/30"
                      : ""
                  }`}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                  {hasUnsavedChanges() && (
                    <span className="ml-2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 sm:w-auto w-full"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {hasUnsavedChanges() || imageFile
                        ? "Updating Article..."
                        : "Going Back..."}
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {hasUnsavedChanges() || imageFile
                        ? "Update Article"
                        : "Back to Admin"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Back Dialog */}
      <AlertDialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <AlertDialogContent className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-200">
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You have unsaved changes. Are you sure you want to leave without
              saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 hover:border-gray-500 backdrop-blur-sm transition-all duration-200 rounded-xl">
              Stay Here
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(getDashboardPath())}
              className="h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-lg">
          {/* Glass morphism background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-2xl"></div>

          {/* Content with relative positioning */}
          <div className="relative">
            <AlertDialogHeader className="space-y-4 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl backdrop-blur-sm border border-red-400/30">
                  <XCircle className="h-6 w-6 text-red-300" />
                </div>
                <div>
                  <AlertDialogTitle className="text-2xl font-bold text-white">
                    Cancel Editing
                  </AlertDialogTitle>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogDescription className="text-gray-300 space-y-4 py-4">
              {hasUnsavedChanges() ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                    <div className="p-2 rounded-full bg-red-500/20 flex-shrink-0 mt-0.5">
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-red-300 text-base">
                        You have unsaved changes!
                      </div>
                      <div className="text-sm text-red-200/80 mt-1">
                        Your work will be lost if you cancel now.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-slate-300 leading-relaxed">
                      Are you sure you want to cancel editing this article? All
                      your changes will be lost and cannot be recovered.
                    </p>
                    {getChangedFields().length > 0 && (
                      <div
                        className="
                        p-4 
                        bg-gradient-to-br from-amber-500/10 to-orange-500/10 
                        border border-amber-500/20 
                        rounded-lg backdrop-blur-sm
                      "
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="
                            p-1.5 rounded-full 
                            bg-amber-500/20
                          "
                          >
                            <svg
                              className="w-4 h-4 text-amber-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-amber-200 font-semibold">
                            Fields that will be lost:
                          </p>
                        </div>
                        <div className="grid gap-2 max-h-32 overflow-y-auto">
                          {getChangedFields().map((field, index) => (
                            <div
                              key={index}
                              className="
                              flex items-center gap-3 p-2 
                              bg-amber-500/5 border border-amber-500/10 
                              rounded-md
                            "
                            >
                              <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></div>
                              <span className="text-amber-200 text-sm font-medium">
                                {field}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="
                  flex items-center gap-3 p-4 
                  bg-blue-500/10 border border-blue-500/20 
                  rounded-lg backdrop-blur-sm
                "
                >
                  <div
                    className="
                    p-2 rounded-full 
                    bg-blue-500/20 
                    flex-shrink-0
                  "
                  >
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-300 font-medium">
                      No unsaved changes detected
                    </p>
                    <p className="text-blue-200/80 text-sm">
                      You can safely cancel editing without losing any work.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>

            <AlertDialogFooter className="gap-3 pt-6 border-t border-white/10">
              <AlertDialogCancel className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl border-0">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Continue Editing
                </span>
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push(getDashboardPath())}
                className={`h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl border-0 ${
                  hasUnsavedChanges()
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {hasUnsavedChanges()
                    ? "Yes, Discard Changes"
                    : "Yes, Cancel Editing"}
                </span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
