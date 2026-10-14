import { unstable_cache } from "next/cache";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/db/connection";
import { convertDoc, convertDocArray } from "@/lib/db/serialization";
import { sanitizeInput, validateInput } from "@/lib/db/input-validation";
import { Article, Category, Tag } from "@/lib/models/Article";

export interface CategoryInterface {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  slug: string;
  created_at: string;
  meta_description_en?: string;
  meta_description_ar?: string;
}

export interface TagInterface {
  _id?: string;
  id?: string;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  created_at: string;
}

export async function getCategories(): Promise<CategoryInterface[]> {
  await dbConnect();

  const categories = await Category.find({}).sort({ name_en: 1 }).lean();
  return convertDocArray<CategoryInterface>(categories);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryInterface | null> {
  await dbConnect();

  const category = await Category.findOne({ slug }).lean();
  return convertDoc(category);
}

export async function createCategory(
  category: Omit<CategoryInterface, "_id" | "id" | "created_at">,
): Promise<CategoryInterface> {
  await dbConnect();

  if (!category.name_en || !category.name_ar || !category.slug) {
    throw new Error("Name (both languages) and slug are required");
  }

  if (
    !validateInput(category.name_en) ||
    !validateInput(category.name_ar) ||
    !validateInput(category.slug)
  ) {
    throw new Error("Invalid input detected");
  }

  const sanitizedCategory = {
    name_en: sanitizeInput(category.name_en),
    name_ar: sanitizeInput(category.name_ar),
    slug: sanitizeInput(category.slug),
    meta_description_en: category.meta_description_en
      ? sanitizeInput(category.meta_description_en)
      : undefined,
    meta_description_ar: category.meta_description_ar
      ? sanitizeInput(category.meta_description_ar)
      : undefined,
  };

  const result = await Category.create(sanitizedCategory);
  const converted = convertDoc<CategoryInterface>(result);
  if (!converted) throw new Error("Failed to create category");
  return converted;
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryInterface>,
): Promise<CategoryInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  const textFields = [
    updates.name_en,
    updates.name_ar,
    updates.slug,
    updates.meta_description_en,
    updates.meta_description_ar,
  ].filter(Boolean);

  for (const field of textFields) {
    if (field && !validateInput(field)) {
      throw new Error("Invalid input detected");
    }
  }

  const sanitizedUpdates: any = {};
  if (updates.name_en)
    sanitizedUpdates.name_en = sanitizeInput(updates.name_en);
  if (updates.name_ar)
    sanitizedUpdates.name_ar = sanitizeInput(updates.name_ar);
  if (updates.slug) sanitizedUpdates.slug = sanitizeInput(updates.slug);
  if (updates.meta_description_en)
    sanitizedUpdates.meta_description_en = sanitizeInput(
      updates.meta_description_en,
    );
  if (updates.meta_description_ar)
    sanitizedUpdates.meta_description_ar = sanitizeInput(
      updates.meta_description_ar,
    );

  const result = await Category.findByIdAndUpdate(id, sanitizedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new Error("Category not found");
  }

  const converted = convertDoc<CategoryInterface>(result);
  if (!converted) throw new Error("Failed to update category");
  return converted;
}

export async function deleteCategory(id: string): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  await Article.deleteMany({ category_id: new Types.ObjectId(id) });

  const result = await Category.findByIdAndDelete(id);
  if (!result) {
    throw new Error("Category not found");
  }

  return true;
}

export const getCategoriesCached = unstable_cache(
  async () => getCategories(),
  ["categories"],
  {
    revalidate: 300,
    tags: ["categories"],
  },
);

export async function getTags(): Promise<TagInterface[]> {
  await dbConnect();

  const tags = await Tag.find({}).sort({ name_en: 1 }).lean();
  return convertDocArray<TagInterface>(tags);
}
