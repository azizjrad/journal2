/**
 * Validate input against common injection patterns
 */
function validateInput(input: string): boolean {
  if (!input) return true; // Allow empty strings

  // Check for SQL injection patterns
  const sqlInjectionPattern =
    /(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)/i;

  // Check for XSS patterns
  const xssPattern =
    /(<script|<img|<iframe|<object|<embed|<link|<meta|javascript:|vbscript:|data:)/i;

  return !sqlInjectionPattern.test(input) && !xssPattern.test(input);
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export interface ArticleValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Validate and sanitize article data for API endpoints
 */
export function validateArticleData(
  body: any,
  isUpdate = false
): ArticleValidationResult {
  const errors: string[] = [];

  // Validate required fields for creation
  if (!isUpdate) {
    if (
      !body.title_en ||
      !body.title_ar ||
      !body.content_en ||
      !body.content_ar
    ) {
      errors.push(
        "Missing required fields: title_en, title_ar, content_en, content_ar"
      );
    }
  }

  // Validate all string inputs
  const stringFields = [
    "title_en",
    "title_ar",
    "content_en",
    "content_ar",
    "excerpt_en",
    "excerpt_ar",
    "image_url",
    "slug",
    "meta_description_en",
    "meta_description_ar",
    "meta_keywords_en",
    "meta_keywords_ar",
  ];

  for (const field of stringFields) {
    if (body[field] && typeof body[field] === "string") {
      if (!validateInput(body[field])) {
        errors.push(`Invalid characters detected in ${field}`);
      }
    }
  }

  // Validate numeric fields
  if (
    body.category_id !== undefined &&
    (!Number.isInteger(body.category_id) || body.category_id <= 0)
  ) {
    errors.push("Invalid category_id");
  }

  // Validate boolean fields
  const booleanFields = ["is_featured", "is_published"];
  for (const field of booleanFields) {
    if (body[field] !== undefined && typeof body[field] !== "boolean") {
      errors.push(`${field} must be a boolean`);
    }
  }

  // Validate tags array
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push("Tags must be an array");
    } else {
      for (const tagId of body.tags) {
        if (!Number.isInteger(tagId) || tagId <= 0) {
          errors.push("All tag IDs must be positive integers");
        }
      }
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize data
  const sanitizedData = {
    title_en: body.title_en ? sanitizeInput(body.title_en) : undefined,
    title_ar: body.title_ar ? sanitizeInput(body.title_ar) : undefined,
    content_en: body.content_en, // Content may contain legitimate formatting
    content_ar: body.content_ar, // Content may contain legitimate formatting
    excerpt_en: body.excerpt_en ? sanitizeInput(body.excerpt_en) : undefined,
    excerpt_ar: body.excerpt_ar ? sanitizeInput(body.excerpt_ar) : undefined,
    image_url: body.image_url,
    category_id: body.category_id,
    is_featured: body.is_featured,
    is_published: body.is_published,
    published_at: body.published_at,
    meta_description_en: body.meta_description_en
      ? sanitizeInput(body.meta_description_en)
      : undefined,
    meta_description_ar: body.meta_description_ar
      ? sanitizeInput(body.meta_description_ar)
      : undefined,
    meta_keywords_en: body.meta_keywords_en
      ? sanitizeInput(body.meta_keywords_en)
      : undefined,
    meta_keywords_ar: body.meta_keywords_ar
      ? sanitizeInput(body.meta_keywords_ar)
      : undefined,
    slug: body.slug ? sanitizeInput(body.slug) : undefined,
    tags: body.tags,
  };

  return { isValid: true, errors: [], sanitizedData };
}

/**
 * Validate and sanitize category data
 */
export function validateCategoryData(
  body: any,
  isUpdate = false
): ArticleValidationResult {
  const errors: string[] = [];

  // Validate required fields for creation
  if (!isUpdate) {
    if (!body.name_en || !body.name_ar) {
      errors.push("Missing required fields: name_en, name_ar");
    }
  }

  // Validate string inputs
  const stringFields = [
    "name_en",
    "name_ar",
    "description_en",
    "description_ar",
    "slug",
  ];

  for (const field of stringFields) {
    if (body[field] && typeof body[field] === "string") {
      if (!validateInput(body[field])) {
        errors.push(`Invalid characters detected in ${field}`);
      }
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize data
  const sanitizedData = {
    name_en: body.name_en ? sanitizeInput(body.name_en) : undefined,
    name_ar: body.name_ar ? sanitizeInput(body.name_ar) : undefined,
    description_en: body.description_en
      ? sanitizeInput(body.description_en)
      : undefined,
    description_ar: body.description_ar
      ? sanitizeInput(body.description_ar)
      : undefined,
    slug: body.slug ? sanitizeInput(body.slug) : undefined,
  };

  return { isValid: true, errors: [], sanitizedData };
}

/**
 * Validate and sanitize tag data
 */
export function validateTagData(
  body: any,
  isUpdate = false
): ArticleValidationResult {
  const errors: string[] = [];

  // Validate required fields for creation
  if (!isUpdate) {
    if (!body.name_en || !body.name_ar || !body.slug) {
      errors.push("Missing required fields: name_en, name_ar, slug");
    }
  }

  // Validate string inputs
  const stringFields = [
    "name_en",
    "name_ar",
    "description_en",
    "description_ar",
    "slug",
  ];

  for (const field of stringFields) {
    if (body[field] && typeof body[field] === "string") {
      if (!validateInput(body[field])) {
        errors.push(`Invalid characters detected in ${field}`);
      }
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize data
  const sanitizedData = {
    name_en: body.name_en ? sanitizeInput(body.name_en) : undefined,
    name_ar: body.name_ar ? sanitizeInput(body.name_ar) : undefined,
    description_en: body.description_en
      ? sanitizeInput(body.description_en)
      : undefined,
    description_ar: body.description_ar
      ? sanitizeInput(body.description_ar)
      : undefined,
    slug: body.slug ? sanitizeInput(body.slug) : undefined,
  };

  return { isValid: true, errors: [], sanitizedData };
}

/**
 * Validate numeric ID parameter
 */
export function validateIdParameter(idParam: string): {
  isValid: boolean;
  id?: number;
  error?: string;
} {
  const id = parseInt(idParam);

  if (isNaN(id) || id <= 0) {
    return { isValid: false, error: "Invalid ID parameter" };
  }

  return { isValid: true, id };
}
