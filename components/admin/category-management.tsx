"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2, Tag, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/context/use-toast";

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  parent_id?: string;
  subcategories?: Category[];
  created_at: string;
  order?: number;
}

interface CategoryManagementProps {
  categories: Category[];
  onCategoriesUpdate: (categories: Category[]) => void;
}

interface DragState {
  id: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  left: number;
  top: number;
}

export function CategoryManagement({
  categories,
  onCategoriesUpdate,
}: CategoryManagementProps) {
  const [currentCategories, setCurrentCategories] = useState(categories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    parent_id: "none",
  });

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevRectsRef = useRef<Record<string, DOMRect>>({});
  const dragStartOrderRef = useRef<Category[] | null>(null);
  const orderChangedRef = useRef(false);
  const currentCategoriesRef = useRef<Category[]>(categories);
  const dragStateRef = useRef<DragState | null>(null);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoScrollRafRef = useRef<number | null>(null);
  const floatingCardRef = useRef<HTMLDivElement | null>(null);
  const lastReorderAtRef = useRef(0);

  const router = useRouter();

  useEffect(() => {
    setCurrentCategories(categories);
    currentCategoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    currentCategoriesRef.current = currentCategories;
  }, [currentCategories]);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  // Smoothly animate item position changes (FLIP) when order updates
  useLayoutEffect(() => {
    const prevRects = prevRectsRef.current;
    const nextRects: Record<string, DOMRect> = {};
    currentCategories.forEach((category) => {
      const el = itemRefs.current[category.id];
      if (el) nextRects[category.id] = el.getBoundingClientRect();
    });

    currentCategories.forEach((category) => {
      const el = itemRefs.current[category.id];
      const prev = prevRects[category.id];
      const next = nextRects[category.id];
      if (!el || !prev || !next) return;
      if (dragStateRef.current?.id === category.id) return;

      const deltaY = prev.top - next.top;
      if (Math.abs(deltaY) < 1) return;

      el.style.transition = "none";
      el.style.transform = `translateY(${deltaY}px)`;
      el.style.willChange = "transform";
      requestAnimationFrame(() => {
        if (!itemRefs.current[category.id]) return;
        el.style.transition = "transform 180ms cubic-bezier(0.2, 0, 0, 1)";
        el.style.transform = "";
        const cleanup = () => {
          el.style.transition = "";
          el.style.willChange = "";
          el.removeEventListener("transitionend", cleanup);
        };
        el.addEventListener("transitionend", cleanup);
      });
    });

    prevRectsRef.current = nextRects;
  }, [currentCategories]);

  const stopAutoScroll = () => {
    if (autoScrollRafRef.current != null) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  };

  const updateFloatingPosition = () => {
    const ds = dragStateRef.current;
    const floating = floatingCardRef.current;
    if (!ds || !floating) return;
    const { x, y } = pointerPosRef.current;
    floating.style.transform = `translate3d(${x - ds.offsetX}px, ${y - ds.offsetY}px, 0) scale(1.02)`;
  };

  const startAutoScroll = () => {
    if (autoScrollRafRef.current != null) return;
    const tick = () => {
      if (!dragStateRef.current) {
        autoScrollRafRef.current = null;
        return;
      }
      const { y } = pointerPosRef.current;
      const edge = 110;
      const maxSpeed = 28;
      let delta = 0;
      if (y < edge) {
        const intensity = Math.min(1, (edge - y) / edge);
        delta = -Math.max(4, Math.ceil(intensity * maxSpeed));
      } else if (y > window.innerHeight - edge) {
        const intensity = Math.min(1, (y - (window.innerHeight - edge)) / edge);
        delta = Math.max(4, Math.ceil(intensity * maxSpeed));
      }
      if (delta !== 0) {
        window.scrollBy({ top: delta, left: 0, behavior: "auto" });
        // Pointer position is relative to viewport; keep floating card aligned while page scrolls
        updateFloatingPosition();
      }
      autoScrollRafRef.current = requestAnimationFrame(tick);
    };
    autoScrollRafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => stopAutoScroll();
  }, []);

  const resetForm = () => {
    setFormData({ name_en: "", name_ar: "", parent_id: "none" });
  };

  const persistOrder = async (ordered: Category[], previous: Category[]) => {
    setSavingOrder(true);
    try {
      const response = await fetch("/api/admin/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: ordered.map((c) => c.id) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save category order");
      }

      // Read back from DB (uncached API) to confirm persisted order and sync UI
      let saved: Category[] = ordered;
      try {
        const freshRes = await fetch("/api/admin/categories", { cache: "no-store" });
        if (freshRes.ok) {
          const fresh = await freshRes.json();
          if (Array.isArray(fresh)) {
            saved = fresh.map((c: any) => ({
              id: c.id || c._id,
              name_en: c.name_en,
              name_ar: c.name_ar,
              parent_id: c.parent_id,
              subcategories: c.subcategories,
              created_at: c.created_at,
              order: c.order,
            }));
          }
        }
      } catch {}

      setCurrentCategories(saved);
      currentCategoriesRef.current = saved;
      onCategoriesUpdate(saved);
      router.refresh();
      toast({
        title: "Category order saved",
        description:
          "Order saved. Header, footer, and sidebar will use this order after refresh.",
      });
    } catch (error) {
      console.error("Error saving category order:", error);
      setCurrentCategories(previous);
      currentCategoriesRef.current = previous;
      onCategoriesUpdate(previous);
      toast({
        title: "Failed to save order",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSavingOrder(false);
    }
  };

  const snapshotRects = () => {
    const rects: Record<string, DOMRect> = {};
    currentCategoriesRef.current.forEach((category) => {
      const el = itemRefs.current[category.id];
      if (el) rects[category.id] = el.getBoundingClientRect();
    });
    prevRectsRef.current = rects;
  };

  const reorderToIndex = (fromId: string, toIndex: number) => {
    const prev = currentCategoriesRef.current;
    const fromIndex = prev.findIndex((c) => c.id === fromId);
    if (fromIndex === -1) return prev;
    const clampedTo = Math.max(0, Math.min(toIndex, prev.length - 1));
    if (fromIndex === clampedTo) return prev;

    snapshotRects();
    const next = [...prev];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(clampedTo, 0, moved);
    orderChangedRef.current = true;
    currentCategoriesRef.current = next;
    setCurrentCategories(next);
    return next;
  };

  const getDropIndex = (clientY: number, draggingCategoryId: string) => {
    const ids = currentCategoriesRef.current
      .map((c) => c.id)
      .filter((id) => id !== draggingCategoryId);
    if (ids.length === 0) return 0;

    for (let i = 0; i < ids.length; i++) {
      const el = itemRefs.current[ids[i]];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // Ignore active FLIP transforms for more stable hit-testing during drag
      const computed = window.getComputedStyle(el);
      const matrix = computed.transform;
      let translateY = 0;
      if (matrix && matrix !== "none") {
        try {
          const m = new DOMMatrixReadOnly(matrix);
          translateY = m.m42 || 0;
        } catch {}
      }
      const top = rect.top - translateY;
      const bottom = rect.bottom - translateY;
      const midpoint = top + (bottom - top) / 2;
      if (clientY < midpoint) return i;
    }
    return ids.length;
  };

  const isInteractiveDragTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return !!target.closest(
      'button, a, input, textarea, select, [role="button"], [role="menuitem"], [data-no-drag="true"]',
    );
  };

  const handleCardPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    categoryId: string,
  ) => {
    if (savingOrder || loading) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (isInteractiveDragTarget(e.target)) return;

    const cardEl = itemRefs.current[categoryId];
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();

    dragStartOrderRef.current = [...currentCategoriesRef.current];
    orderChangedRef.current = false;
    lastReorderAtRef.current = 0;
    pointerPosRef.current = { x: e.clientX, y: e.clientY };

    const nextDragState: DragState = {
      id: categoryId,
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    };
    setDragState(nextDragState);
    dragStateRef.current = nextDragState;
    startAutoScroll();

    // Position floating card immediately (ref is set after render; RAF as fallback)
    requestAnimationFrame(() => updateFloatingPosition());

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    e.preventDefault();
    pointerPosRef.current = { x: e.clientX, y: e.clientY };
    updateFloatingPosition();

    const now = performance.now();
    if (now - lastReorderAtRef.current < 32) return; // throttle reorder for smoother movement
    lastReorderAtRef.current = now;

    const toIndex = getDropIndex(e.clientY, ds.id);
    reorderToIndex(ds.id, toIndex);
  };

  const finishDrag = async (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;

    const previous = dragStartOrderRef.current || [];

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    // Commit final drop position (bypasses throttle) so saved order matches where it was released
    const finalIndex = getDropIndex(e.clientY, ds.id);
    const finalOrder = reorderToIndex(ds.id, finalIndex);
    const changed = orderChangedRef.current;

    stopAutoScroll();
    setDragState(null);
    dragStateRef.current = null;
    dragStartOrderRef.current = null;
    orderChangedRef.current = false;
    lastReorderAtRef.current = 0;

    if (changed && previous.length > 0) {
      await persistOrder([...finalOrder], previous);
    }
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
        toast({
          title: "Category created successfully!",
          description: `${formData.name_en} has been added to your categories.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Create category error:", errorData);
        toast({
          title: "Failed to create category",
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error creating category",
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
        toast({
          title: "Category updated successfully!",
          description: `${formData.name_en} has been updated.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Edit category error:", errorData);
        toast({
          title: "Failed to update category",
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error updating category",
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
        router.refresh();
        toast({
          title: "Category deleted successfully!",
          description: "The category has been removed from your system.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete category error:", errorData);
        toast({
          title: "Failed to delete category",
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error deleting category",
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
          <p className="text-gray-400 text-sm mt-2">
            Drag and drop categories to set their order in the header, sidebar, and footer.
            {savingOrder ? " Saving order..." : ""}
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
                  className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-purple-500"
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
            <div className="space-y-4">
              {currentCategories.map((category) => {
                const isDragging = dragState?.id === category.id;
                return (
                <div
                  key={category.id}
                  ref={(el) => {
                    itemRefs.current[category.id] = el;
                  }}
                  onPointerDown={(e) => handleCardPointerDown(e, category.id)}
                  onPointerMove={handleCardPointerMove}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                  className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg select-none touch-none ${
                    isDragging
                      ? "opacity-0"
                      : "hover:bg-white/15 transition-colors duration-200 cursor-grab active:cursor-grabbing"
                  }`}
                  style={{ willChange: dragState ? "transform" : undefined, touchAction: "none" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div
                        aria-hidden="true"
                        className="mt-1 p-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 shrink-0"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm shrink-0">
                        <Tag className="h-5 w-5 text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {category.name_en}
                        </h3>
                        <p className="text-gray-300 font-arabic mb-4 leading-relaxed">
                          {category.name_ar}
                        </p>

                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 backdrop-blur-sm">
                            Category
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Drag card to reorder
                          </span>
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
                    {/* Edit/Delete Buttons: always visible, wrap on mobile */}
                    <div className="flex flex-row flex-wrap gap-2 ml-0 sm:ml-2 mt-1 sm:mt-0 w-auto justify-end shrink-0">
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
                  </div>
                </div>
                );
              })}
              {dragState
                ? (() => {
                    const dragged = currentCategories.find(
                      (c) => c.id === dragState.id,
                    );
                    if (!dragged) return null;
                    return (
                      <div
                        ref={(el) => {
                          floatingCardRef.current = el;
                          if (el) {
                            const x = pointerPosRef.current.x - dragState.offsetX;
                            const y = pointerPosRef.current.y - dragState.offsetY;
                            el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`;
                          }
                        }}
                        className="fixed left-0 top-0 z-[80] pointer-events-none bg-white/15 backdrop-blur-xl border border-purple-400/40 rounded-xl p-6 shadow-2xl ring-2 ring-purple-400/40"
                        style={{
                          width: dragState.width,
                          height: dragState.height,
                          willChange: "transform",
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 h-full">
                          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="mt-1 p-2 rounded-lg border border-white/10 bg-white/10 text-gray-200 shrink-0">
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm shrink-0">
                              <Tag className="h-5 w-5 text-purple-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-white mb-2 truncate">
                                {dragged.name_en}
                              </h3>
                              <p className="text-gray-300 font-arabic mb-4 leading-relaxed line-clamp-2">
                                {dragged.name_ar}
                              </p>
                              <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 backdrop-blur-sm">
                                  Category
                                </Badge>
                                <span className="text-xs text-gray-300">
                                  Reordering...
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
