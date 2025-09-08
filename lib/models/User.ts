import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password_hash: {
      type: String,
      required: function () {
        // Password is required only if google_id is not provided
        return !this.google_id;
      },
    },
    google_id: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    auth_provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    first_name: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    last_name: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatar_url: {
      type: String,
      maxlength: 255,
    },
    role: {
      type: String,
      enum: ["admin", "writer", "user"],
      default: "user",
    },
    writer_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    last_login: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
// Note: email and username fields already have unique indexes due to unique: true
userSchema.index({ role: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);

// User Profile Schema
const userProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    display_name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    website: {
      type: String,
      maxlength: 255,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    social_twitter: {
      type: String,
      maxlength: 100,
    },
    social_linkedin: {
      type: String,
      maxlength: 255,
    },
    social_github: {
      type: String,
      maxlength: 100,
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);

// User Session Schema
const userSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session_token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    ip_address: {
      type: String,
      maxlength: 45,
    },
    user_agent: {
      type: String,
      maxlength: 500,
    },
    last_accessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Index for session cleanup
userSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const UserSession =
  mongoose.models.UserSession ||
  mongoose.model("UserSession", userSessionSchema);

// Password Reset Token Schema
const passwordResetTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// TTL index for automatic cleanup
passwordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken =
  mongoose.models.PasswordResetToken ||
  mongoose.model("PasswordResetToken", passwordResetTokenSchema);

// Email Verification Token Schema
const emailVerificationTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// TTL index for automatic cleanup
emailVerificationTokenSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
);

export const EmailVerificationToken =
  mongoose.models.EmailVerificationToken ||
  mongoose.model("EmailVerificationToken", emailVerificationTokenSchema);

// User Activity Log Schema
const userActivityLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 255,
    },
    ip_address: {
      type: String,
      maxlength: 45,
    },
    user_agent: {
      type: String,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Index for efficient querying
userActivityLogSchema.index({ user_id: 1, created_at: -1 });

export const UserActivityLog =
  mongoose.models.UserActivityLog ||
  mongoose.model("UserActivityLog", userActivityLogSchema);

// Newsletter Subscription Schema
const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription_id: {
      type: String,
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["basic", "premium"],
    },
    billing_period: {
      type: String,
      required: true,
      enum: ["monthly", "annual"],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "canceled", "past_due", "incomplete"],
      default: "active",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    payment_method: {
      type: {
        type: String,
        enum: ["card", "paypal", "bank_transfer"],
      },
      last4: String,
      brand: String,
      expires: {
        month: Number,
        year: Number,
      },
    },
    current_period_start: {
      type: Date,
      required: true,
    },
    current_period_end: {
      type: Date,
      required: true,
    },
    canceled_at: {
      type: Date,
    },
    cancel_at_period_end: {
      type: Boolean,
      default: false,
    },
    stripe_subscription_id: {
      type: String,
    },
    stripe_customer_id: {
      type: String,
    },
    preferences: {
      daily_digest: {
        type: Boolean,
        default: true,
      },
      weekly_summary: {
        type: Boolean,
        default: true,
      },
      breaking_news: {
        type: Boolean,
        default: true,
      },
      premium_content: {
        type: Boolean,
        default: true,
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for efficient querying
newsletterSubscriptionSchema.index({ user_id: 1 });
// subscription_id already has unique: true which creates an index automatically
newsletterSubscriptionSchema.index({ status: 1 });
newsletterSubscriptionSchema.index({ current_period_end: 1 });

export const NewsletterSubscription =
  mongoose.models.NewsletterSubscription ||
  mongoose.model("NewsletterSubscription", newsletterSubscriptionSchema);
