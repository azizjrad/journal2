import { Types } from "mongoose";
import { dbConnect } from "@/lib/db/connection";
import { convertDoc, convertDocArray } from "@/lib/db/serialization";
import { sanitizeInput, validateInput } from "@/lib/db/input-validation";
import Contact, { type ContactInterface } from "@/lib/models/Contact";

export async function createContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactInterface> {
  await dbConnect();

  if (
    !validateInput(data.name) ||
    !validateInput(data.email) ||
    !validateInput(data.subject) ||
    !validateInput(data.message)
  ) {
    throw new Error("Invalid input data");
  }

  const sanitizedData = {
    name: sanitizeInput(data.name),
    email: sanitizeInput(data.email.toLowerCase()),
    subject: sanitizeInput(data.subject),
    message: sanitizeInput(data.message),
  };

  const contact = new Contact(sanitizedData);
  const savedContact = await contact.save();

  const converted = convertDoc<ContactInterface>(savedContact);
  if (!converted) throw new Error("Failed to create contact message");
  return converted;
}

export async function getContactMessages(
  page: number = 1,
  limit: number = 20,
  filters?: {
    is_read?: boolean;
    is_replied?: boolean;
    search?: string;
  },
): Promise<{
  messages: ContactInterface[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await dbConnect();

  const query: any = {};

  if (filters?.is_read !== undefined) {
    query.is_read = filters.is_read;
  }

  if (filters?.is_replied !== undefined) {
    query.is_replied = filters.is_replied;
  }

  if (filters?.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { subject: searchRegex },
      { message: searchRegex },
    ];
  }

  const totalCount = await Contact.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;

  const messages = await Contact.find(query)
    .populate("replied_by", "username email first_name last_name")
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    messages: convertDocArray<ContactInterface>(messages),
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export async function getContactMessageById(
  id: string,
): Promise<ContactInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const message = await Contact.findById(id)
    .populate("replied_by", "username email first_name last_name")
    .lean();

  return message ? convertDoc(message) : null;
}

export async function markContactMessageAsRead(id: string): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    console.error("❌ Invalid ObjectId:", id);
    return false;
  }

  try {
    const result = await Contact.findByIdAndUpdate(
      id,
      { is_read: true, updated_at: new Date() },
      { new: true },
    );
    return !!result;
  } catch (error) {
    console.error("❌ Database error in markContactMessageAsRead:", error);
    return false;
  }
}

export async function replyToContactMessage(
  id: string,
  adminReply: string,
  adminUserId: string,
): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(adminUserId)) {
    return false;
  }

  if (!validateInput(adminReply)) {
    throw new Error("Invalid reply content");
  }

  const sanitizedReply = sanitizeInput(adminReply);

  const result = await Contact.findByIdAndUpdate(
    id,
    {
      admin_reply: sanitizedReply,
      is_replied: true,
      is_read: true,
      replied_by: new Types.ObjectId(adminUserId),
      replied_at: new Date(),
      updated_at: new Date(),
    },
    { new: true },
  );

  return !!result;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  const result = await Contact.findByIdAndDelete(id);
  return !!result;
}

export async function getContactMessageStats(): Promise<{
  total: number;
  unread: number;
  unreplied: number;
  todayCount: number;
}> {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, unread, unreplied, todayCount] = await Promise.all([
    Contact.countDocuments({}),
    Contact.countDocuments({ is_read: false }),
    Contact.countDocuments({ is_replied: false }),
    Contact.countDocuments({ created_at: { $gte: today } }),
  ]);

  return {
    total,
    unread,
    unreplied,
    todayCount,
  };
}
