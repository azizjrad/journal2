import mongoose from "mongoose";

const sentNewsletterSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    content: { type: String, required: true },
    recipientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientCount: { type: Number, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "sentAt", updatedAt: false } }
);

export const SentNewsletter =
  mongoose.models.SentNewsletter ||
  mongoose.model("SentNewsletter", sentNewsletterSchema);
