import mongoose, { Schema, Document } from "mongoose";

export interface ContactInterface extends Document {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  admin_reply?: string;
  replied_by?: string; // Admin user ID who replied
  replied_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const ContactSchema = new Schema<ContactInterface>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    is_replied: {
      type: Boolean,
      default: false,
    },
    admin_reply: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    replied_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    replied_at: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index for efficient queries
ContactSchema.index({ created_at: -1 });
ContactSchema.index({ is_read: 1 });
ContactSchema.index({ is_replied: 1 });
ContactSchema.index({ email: 1 });

const Contact =
  mongoose.models.Contact ||
  mongoose.model<ContactInterface>("Contact", ContactSchema);

export default Contact;
