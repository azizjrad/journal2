import mongoose from "mongoose";

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name_en: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    name_ar: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
    },
    meta_description_en: {
      type: String,
      maxlength: 160,
    },
    meta_description_ar: {
      type: String,
      maxlength: 160,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Note: slug field already has unique index due to unique: true

export const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

// Tag Schema
const tagSchema = new mongoose.Schema(
  {
    name_en: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    name_ar: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    description_en: {
      type: String,
      maxlength: 255,
    },
    description_ar: {
      type: String,
      maxlength: 255,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Note: slug field already has unique index due to unique: true

export const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);

// Article Schema
const articleSchema = new mongoose.Schema(
  {
    title_en: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    title_ar: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content_en: {
      type: String,
      required: true,
    },
    content_ar: {
      type: String,
      required: true,
    },
    excerpt_en: {
      type: String,
      required: true,
      maxlength: 500,
    },
    excerpt_ar: {
      type: String,
      required: true,
      maxlength: 500,
    },
    image_url: {
      type: String,
      maxlength: 255,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_published: {
      type: Boolean,
      default: false,
    },
    published_at: {
      type: Date,
    },
    scheduled_for: {
      type: Date,
    },
    view_count: {
      type: Number,
      default: 0,
    },
    engagement_count: {
      type: Number,
      default: 0,
    },
    reading_time_minutes: {
      type: Number,
    },
    word_count: {
      type: Number,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    meta_description_en: {
      type: String,
      maxlength: 160,
    },
    meta_description_ar: {
      type: String,
      maxlength: 160,
    },
    meta_keywords_en: {
      type: String,
      maxlength: 255,
    },
    meta_keywords_ar: {
      type: String,
      maxlength: 255,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for better performance
articleSchema.index({ is_published: 1, published_at: -1 });
articleSchema.index({ category_id: 1, is_published: 1 });
articleSchema.index({ is_featured: 1, is_published: 1 });
// Note: slug field already has unique index due to unique: true
articleSchema.index({
  title_en: "text",
  title_ar: "text",
  content_en: "text",
  content_ar: "text",
  excerpt_en: "text",
  excerpt_ar: "text",
});

export const Article =
  mongoose.models.Article || mongoose.model("Article", articleSchema);

// Scheduled Article Schema
const scheduledArticleSchema = new mongoose.Schema(
  {
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    scheduled_for: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "published", "cancelled"],
      default: "pending",
    },
    published_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

scheduledArticleSchema.index({ scheduled_for: 1, status: 1 });

export const ScheduledArticle =
  mongoose.models.ScheduledArticle ||
  mongoose.model("ScheduledArticle", scheduledArticleSchema);

// Article View Schema for Analytics
const articleViewSchema = new mongoose.Schema(
  {
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    ip_address: {
      type: String,
      required: true,
      maxlength: 45,
    },
    user_agent: {
      type: String,
      maxlength: 500,
    },
    referer: {
      type: String,
      maxlength: 255,
    },
    country: {
      type: String,
      maxlength: 2,
    },
    city: {
      type: String,
      maxlength: 100,
    },
    session_id: {
      type: String,
      maxlength: 100,
    },
    reading_time: {
      type: Number,
      default: 0,
    },
    viewed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

articleViewSchema.index({ article_id: 1, viewed_at: -1 });
articleViewSchema.index({ viewed_at: -1 });

export const ArticleView =
  mongoose.models.ArticleView ||
  mongoose.model("ArticleView", articleViewSchema);

// Article Engagement Schema
const articleEngagementSchema = new mongoose.Schema(
  {
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    engagement_type: {
      type: String,
      required: true,
      enum: ["like", "share", "comment", "bookmark"],
    },
    ip_address: {
      type: String,
      required: true,
      maxlength: 45,
    },
    user_agent: {
      type: String,
      maxlength: 500,
    },
    platform: {
      type: String,
      maxlength: 50,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

articleEngagementSchema.index({ article_id: 1, created_at: -1 });

export const ArticleEngagement =
  mongoose.models.ArticleEngagement ||
  mongoose.model("ArticleEngagement", articleEngagementSchema);

// Settings Schema
const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    value_en: {
      type: String,
      maxlength: 1000,
    },
    value_ar: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Setting =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);

// Sitemap Cache Schema
const sitemapEntrySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },
    last_modified: {
      type: Date,
      required: true,
      default: Date.now,
    },
    change_frequency: {
      type: String,
      enum: [
        "always",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "never",
      ],
      default: "weekly",
    },
    priority: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    page_type: {
      type: String,
      enum: ["home", "article", "category", "static"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const SitemapEntry =
  mongoose.models.SitemapEntry ||
  mongoose.model("SitemapEntry", sitemapEntrySchema);

// Report Schema for Article Reports
const reportSchema = new mongoose.Schema(
  {
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    article_title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    report_type: {
      type: String,
      enum: ["spam", "inappropriate", "copyright", "misinformation", "other"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    reporter_email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    reporter_name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    reporter_ip: {
      type: String,
      maxlength: 45, // IPv6 compatible
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed", "dismissed"],
      default: "pending",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      required: true,
    },
    reviewed_at: {
      type: Date,
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewed_by_name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    admin_notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    resolution_notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    // Tracking fields
    escalated_at: {
      type: Date,
    },
    escalated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    closed_at: {
      type: Date,
    },
    closed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dismissed_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for efficient querying
reportSchema.index({ article_id: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ report_type: 1 });
reportSchema.index({ created_at: -1 });
reportSchema.index({ reviewed_by: 1 });
reportSchema.index({ dismissed_at: 1 }); // For cleanup queries

export const Report =
  mongoose.models.Report || mongoose.model("Report", reportSchema);
