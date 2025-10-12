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
import { CategoryInterface } from "@/lib/db";

interface NewArticleFormProps {
  categories: CategoryInterface[];
  isWriterMode?: boolean;
}

export function NewArticleForm({
  categories: initialCategories,
  isWriterMode = false,
}: NewArticleFormProps) {
  const router = useRouter();
  // DEBUG: Log categories received from backend
  if (typeof window !== "undefined") {
    console.log("[DEBUG] Categories received (prop):", initialCategories);
  }

  // State for categories (for client-side fetch)
  const [categories, setCategories] = useState(initialCategories || []);

  // Fetch categories from API if running on client and categories are empty
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (!initialCategories || initialCategories.length === 0)
    ) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          setCategories(data);
          console.log("[DEBUG] Categories fetched from API:", data);
        })
        .catch((err) => {
          console.error("[DEBUG] Error fetching categories from API:", err);
        });
    }
  }, [initialCategories]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showBackDialog, setShowBackDialog] = useState(false);

  // Helper function to get the correct dashboard path
  const getDashboardPath = () => (isWriterMode ? "/writer" : "/admin");
  const [showPreview, setShowPreview] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return (
      formData.title_en.trim() !== "" ||
      formData.title_ar.trim() !== "" ||
      formData.content_en.trim() !== "" ||
      formData.content_ar.trim() !== "" ||
      formData.excerpt_en.trim() !== "" ||
      formData.excerpt_ar.trim() !== "" ||
      formData.image_url.trim() !== "" ||
      formData.category_id !== "" ||
      formData.is_featured !== false ||
      formData.meta_description_en.trim() !== "" ||
      formData.meta_description_ar.trim() !== "" ||
      formData.meta_keywords_en.trim() !== "" ||
      formData.meta_keywords_ar.trim() !== "" ||
      imageFile !== null
    );
  };

  // Handle tags formatting
  const formatTags = (input: string): string => {
    return input
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
        toast({
          title:
            "Unsupported image type. Only JPEG, PNG, GIF, and WebP are allowed.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image size must be less than 5MB",
          variant: "destructive",
        });
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
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title_en.trim() || !formData.title_ar.trim()) {
        toast({
          title: "Please fill in both English and Arabic titles",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.content_en.trim() || !formData.content_ar.trim()) {
        toast({
          title: "Please fill in both English and Arabic content",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.category_id || formData.category_id.trim() === "") {
        toast({
          title: "Please select a category",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

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

      const articleData = {
        ...formData,
        image_url,
        meta_keywords_en: formatTags(formData.meta_keywords_en),
        meta_keywords_ar: formatTags(formData.meta_keywords_ar),
        published_at: formData.is_published
          ? new Date().toISOString()
          : formData.scheduled_for
          ? new Date(formData.scheduled_for).toISOString()
          : null,
      };

      console.log("Submitting article data:", articleData);

      // Fetch CSRF token
      await fetch("/api/auth/csrf-token", { credentials: "include" });
      const csrfCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf-token="));
      const csrfToken = csrfCookie ? csrfCookie.split("=")[1] : "";

      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(articleData),
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (response.ok) {
        toast({
          title: "Article created successfully!",
          variant: "success",
        });
        router.push(getDashboardPath());
      } else {
        toast({
          title: "Failed to create article",
          description: responseData.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating article:", error);
      toast({
        title: "Error creating article",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (hasUnsavedChanges()) {
      setShowCancelDialog(true);
    } else {
      router.push(getDashboardPath());
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    router.push(getDashboardPath());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Internal Loading Screen */}
      {loading && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading article data...</p>
          </div>
        </div>
      )}
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
              <div className="h-6 w-px bg-slate-600"></div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent hidden sm:block">
                Create New Article
              </h1>
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
                    <DialogTitle className="text-slate-200 text-center">
                      Article Preview
                    </DialogTitle>
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-100 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10">
                      <X className="h-5 w-5 text-red-500 hover:text-red-400 transition-colors duration-200" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
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
                    alt="Preview"
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full h-48 ring-1 ring-slate-600/50"
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
                    Click to upload an image or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">PNG, JPG up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bilingual Content - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* English Content */}
            <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-b border-blue-700/30">
                <CardTitle className="text-blue-200 flex items-center gap-2">
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
                    Title (English) *
                  </Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Enter article title in English"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="excerpt_en"
                    className="text-sm font-medium text-slate-300"
                  >
                    Excerpt (English)
                  </Label>
                  <Textarea
                    id="excerpt_en"
                    value={formData.excerpt_en}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt_en: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Brief summary in English"
                    rows={3}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="content_en"
                    className="text-sm font-medium text-slate-300"
                  >
                    Content (English) *
                  </Label>
                  <Textarea
                    id="content_en"
                    value={formData.content_en}
                    onChange={(e) =>
                      setFormData({ ...formData, content_en: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Write your article content in English"
                    rows={10}
                    required
                  />
                </div>

                {/* English SEO Tags */}
                <div className="border-t border-slate-600/30 pt-6 space-y-4">
                  <h4 className="text-lg font-medium text-blue-300 flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    English SEO
                  </h4>
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
                      className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Brief description for search engines (150-160 characters)"
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
                      className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="technology, news, article (separate with commas)"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Separate tags with commas. Hash symbols (#) will be added
                      automatically.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Arabic Content */}
            <Card className="bg-slate-800/50 border border-slate-700/50 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 border-b border-emerald-700/30">
                <CardTitle className="text-emerald-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Arabic Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label
                    htmlFor="title_ar"
                    className="text-sm font-medium text-slate-300"
                  >
                    Title (Arabic) *
                  </Label>
                  <Input
                    id="title_ar"
                    value={formData.title_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, title_ar: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
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
                    Excerpt (Arabic)
                  </Label>
                  <Textarea
                    id="excerpt_ar"
                    value={formData.excerpt_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt_ar: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="ملخص موجز بالعربية"
                    rows={3}
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="content_ar"
                    className="text-sm font-medium text-slate-300"
                  >
                    Content (Arabic) *
                  </Label>
                  <Textarea
                    id="content_ar"
                    value={formData.content_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, content_ar: e.target.value })
                    }
                    className="mt-1 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="اكتب محتوى المقال بالعربية"
                    rows={10}
                    dir="rtl"
                    required
                  />
                </div>

                {/* Arabic SEO Tags */}
                <div className="border-t border-slate-600/30 pt-6 space-y-4">
                  <h4 className="text-lg font-medium text-emerald-300 flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Arabic SEO
                  </h4>
                  <div>
                    <Label
                      htmlFor="meta_description_ar"
                      className="text-sm font-medium text-slate-300"
                    >
                      Meta Description
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
                            key={category.id || category._id}
                            value={category.id || category._id || ""}
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

                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_featured: checked })
                      }
                      className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-600"
                    />
                    <Label
                      htmlFor="is_featured"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        formData.is_featured
                          ? "text-red-400 hover:text-red-300"
                          : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      Featured Article
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_published: checked })
                      }
                      className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-600"
                    />
                    <Label
                      htmlFor="is_published"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        formData.is_published
                          ? "text-red-400 hover:text-red-300"
                          : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      Publish Immediately
                    </Label>
                  </div>
                </div>

                {/* Scheduling Section */}
                {!formData.is_published && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/30 rounded-xl shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-800/50 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-purple-200">
                          Schedule Publication
                        </h4>
                        <p className="text-sm text-purple-300">
                          Choose when this article should be published
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-purple-300">
                        📅 Custom Date & Time
                      </Label>
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={formData.scheduled_for}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              const selectedDate = new Date(value);
                              const now = new Date();

                              if (selectedDate <= now) {
                                toast({
                                  title: "Scheduled time must be in the future",
                                  description:
                                    "Please select a date and time that hasn't passed yet.",
                                  variant: "destructive",
                                });
                                return;
                              }
                            }
                            setFormData({ ...formData, scheduled_for: value });
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          className="bg-slate-700/50 border-slate-600/50 text-slate-200 focus:border-purple-500 focus:ring-purple-500/20 text-lg p-4 cursor-pointer hover:bg-slate-600/50 transition-all duration-200"
                          placeholder="Click to select date and time"
                          style={{
                            colorScheme: "dark",
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <Clock className="h-5 w-5 text-purple-400" />
                        </div>
                      </div>
                      {formData.scheduled_for && (
                        <div className="bg-purple-800/30 p-3 rounded-lg border border-purple-700/30">
                          <p className="text-sm text-purple-200 font-medium">
                            ⏰ Will publish:{" "}
                            {new Date(formData.scheduled_for).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-8 border-t border-slate-700/50 gap-4 sm:gap-0 w-full">
            <Button
              type="button"
              onClick={handleBackClick}
              variant="outline"
              className="group border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:text-white hover:border-slate-500 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 group-hover:transform group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleCancelClick}
                variant="outline"
                className="border-red-600 bg-red-900/20 text-red-400 hover:bg-red-800/50 hover:text-red-300 hover:border-red-500 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold w-full sm:w-auto"
              >
                {loading ? "Creating..." : "Create Article"}
              </Button>
            </div>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <AlertDialog open={showBackDialog} onOpenChange={setShowBackDialog}>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-200">
                Unsaved Changes
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                You have unsaved changes. Are you sure you want to leave? All
                changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border-slate-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push(getDashboardPath())}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, go back
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-200">
                Cancel Article Creation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Are you sure you want to cancel creating this article? All the
                information you've entered will be lost and cannot be recovered.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border-slate-600">
                Continue Editing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancel}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Cancel & Lose Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
