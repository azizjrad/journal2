import { Types } from "mongoose";
import { dbConnect } from "@/lib/db/connection";
import { convertDoc, convertDocArray } from "@/lib/db/serialization";
import { sanitizeInput, validateInput } from "@/lib/db/input-validation";
import { Article, Report } from "@/lib/models/Article";
import {
  EmailVerificationToken,
  NewsletterSubscription,
  PasswordResetToken,
  User,
  UserActivityLog,
  UserProfile,
  UserSession,
} from "@/lib/models/User";
import Contact from "@/lib/models/Contact";

export interface UserInterface {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  role: "admin" | "writer" | "user";
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  writer_status?: "pending" | "approved" | "rejected" | null;
  has_used_trial?: boolean;
}

export interface UserProfileInterface {
  _id?: string;
  id?: string;
  user_id: string;
  display_name?: string;
  website?: string;
  location?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_github?: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export async function createUser(user: {
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role?: "admin" | "writer" | "user";
  writer_status?: "pending" | "approved" | "rejected" | null;
}): Promise<UserInterface> {
  await dbConnect();

  if (!user.username || !user.email || !user.password_hash) {
    throw new Error("Username, email, and password are required");
  }

  if (!validateInput(user.username) || !validateInput(user.email)) {
    throw new Error("Invalid input detected");
  }

  const sanitizedUser = {
    username: sanitizeInput(user.username.toLowerCase()),
    email: sanitizeInput(user.email.toLowerCase()),
    password_hash: user.password_hash,
    first_name: user.first_name ? sanitizeInput(user.first_name) : undefined,
    last_name: user.last_name ? sanitizeInput(user.last_name) : undefined,
    role: user.role || "user",
    writer_status: user.writer_status || null,
  };

  try {
    const result = await User.create(sanitizedUser);
    const convertedResult = convertDoc<UserInterface>(result);
    if (!convertedResult) throw new Error("Failed to create user");
    return convertedResult;
  } catch (error) {
    console.error("❌ User service: Error creating user:", error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<UserInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findById(id).select("-password_hash").lean();
  return convertDoc(user);
}

export async function getUserByEmail(
  email: string,
): Promise<UserInterface | null> {
  await dbConnect();

  if (!email || !validateInput(email)) {
    throw new Error("Invalid email");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  return convertDoc(user);
}

export async function getUserByEmailWithPassword(
  email: string,
): Promise<any | null> {
  await dbConnect();

  if (!email || !validateInput(email)) {
    throw new Error("Invalid email");
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password_hash")
    .lean();

  if (!user) return null;

  const userObj = JSON.parse(JSON.stringify(user));
  if (userObj._id) {
    userObj.id = userObj._id.toString();
    delete userObj._id;
  }
  delete userObj.__v;

  return userObj;
}

export async function getUserByUsername(
  username: string,
): Promise<UserInterface | null> {
  await dbConnect();

  if (!username || !validateInput(username)) {
    throw new Error("Invalid username");
  }

  const user = await User.findOne({ username: username.toLowerCase() })
    .select("-password_hash")
    .lean();

  return convertDoc(user);
}

export async function updateUser(
  id: string,
  updates: Partial<UserInterface>,
): Promise<UserInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  const sanitizedUpdates: any = {};

  if (updates.username) {
    if (!validateInput(updates.username)) throw new Error("Invalid username");
    sanitizedUpdates.username = sanitizeInput(updates.username.toLowerCase());
  }

  if (updates.email) {
    if (!validateInput(updates.email)) throw new Error("Invalid email");
    sanitizedUpdates.email = sanitizeInput(updates.email.toLowerCase());
  }

  if (updates.first_name) {
    if (!validateInput(updates.first_name))
      throw new Error("Invalid first name");
    sanitizedUpdates.first_name = sanitizeInput(updates.first_name);
  }

  if (updates.last_name) {
    if (!validateInput(updates.last_name)) throw new Error("Invalid last name");
    sanitizedUpdates.last_name = sanitizeInput(updates.last_name);
  }

  if (updates.bio) {
    if (!validateInput(updates.bio)) throw new Error("Invalid bio");
    sanitizedUpdates.bio = sanitizeInput(updates.bio);
  }

  if (updates.avatar_url) {
    if (!validateInput(updates.avatar_url))
      throw new Error("Invalid avatar URL");
    sanitizedUpdates.avatar_url = sanitizeInput(updates.avatar_url);
  }

  if (updates.role && ["admin", "writer", "user"].includes(updates.role)) {
    sanitizedUpdates.role = updates.role;
  }

  if (typeof updates.is_active === "boolean") {
    sanitizedUpdates.is_active = updates.is_active;
  }

  if (typeof updates.is_verified === "boolean") {
    sanitizedUpdates.is_verified = updates.is_verified;
  }

  const result = await User.findByIdAndUpdate(id, sanitizedUpdates, {
    new: true,
    runValidators: true,
  }).select("-password_hash");

  if (!result) {
    throw new Error("User not found");
  }

  const converted = convertDoc<UserInterface>(result);
  if (!converted) throw new Error("Failed to update user");
  return converted;
}

export async function updateUserWriterStatus(
  userId: string,
  writerStatus: "pending" | "approved" | "rejected",
  role: "user" | "writer" | "admin",
): Promise<void> {
  await setUserWriterStatus(userId, writerStatus, { role });
}

export async function setUserWriterStatus(
  userId: string,
  writerStatus: "pending" | "approved" | "rejected",
  options: {
    role?: "user" | "writer" | "admin";
    verifyAndActivate?: boolean;
  } = {},
): Promise<UserInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const updates: Record<string, unknown> = {
    writer_status: writerStatus,
    updated_at: new Date(),
  };

  if (options.role) {
    updates.role = options.role;
  }

  if (options.verifyAndActivate && writerStatus === "approved") {
    updates.is_verified = true;
    updates.is_active = true;
  }

  const result = await User.findByIdAndUpdate(userId, updates, {
    new: true,
  }).select("-password_hash");

  if (!result) {
    throw new Error("User not found");
  }

  const converted = convertDoc<UserInterface>(result);
  if (!converted) throw new Error("Failed to update writer status");
  return converted;
}

export async function updateUserPassword(
  id: string,
  passwordHash: string,
): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  const result = await User.findByIdAndUpdate(
    id,
    {
      password_hash: passwordHash,
      updated_at: new Date(),
    },
    { new: true },
  );

  if (!result) {
    throw new Error("User not found or password update failed");
  }
}

export async function updateLastLogin(id: string): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  await User.findByIdAndUpdate(id, { last_login: new Date() });
}

export async function deleteUser(id: string): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  const articlesCount = await Article.countDocuments({
    author_id: new Types.ObjectId(id),
  });

  if (articlesCount > 0) {
    throw new Error(
      "Cannot delete user with published articles. Deactivate instead.",
    );
  }

  try {
    const { sendAccountDeletionEmail } =
      await import("@/lib/email/email-sendgrid");
    await sendAccountDeletionEmail({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      reason: "Your account has been deleted by an administrator.",
    });
    console.log(`✅ Sent account deletion email to: ${user.email}`);
  } catch (emailError) {
    console.error("❌ Failed to send account deletion email:", emailError);
  }

  const userId = new Types.ObjectId(id);

  try {
    const subsDeleted = await NewsletterSubscription.deleteMany({
      user_id: userId,
    });
    console.log(
      `✅ Deleted ${subsDeleted.deletedCount} newsletter subscriptions for user: ${id}`,
    );
  } catch (error) {
    console.error("❌ Error deleting newsletter subscriptions:", error);
  }

  try {
    const profileDeleted = await UserProfile.deleteOne({ user_id: userId });
    console.log(
      `✅ Deleted user profile for user: ${id} (${profileDeleted.deletedCount} records)`,
    );
  } catch (error) {
    console.error("❌ Error deleting user profile:", error);
  }

  try {
    const reportsDeleted = await Report.deleteMany({ reporter_id: userId });
    console.log(
      `✅ Deleted ${reportsDeleted.deletedCount} article reports by user: ${id}`,
    );
  } catch (error) {
    console.error("❌ Error deleting article reports:", error);
  }

  try {
    const contactsDeleted = await Contact.deleteMany({ email: user.email });
    console.log(
      `✅ Deleted ${contactsDeleted.deletedCount} contact messages from user: ${id}`,
    );
  } catch (error) {
    console.error("❌ Error deleting contact messages:", error);
  }

  try {
    const sessionsDeleted = await UserSession.deleteMany({ user_id: userId });
    console.log(
      `✅ Deleted ${sessionsDeleted.deletedCount} user sessions for user: ${id}`,
    );
  } catch (error) {
    console.error("❌ Error deleting user sessions:", error);
  }

  try {
    const resetTokensDeleted = await PasswordResetToken.deleteMany({
      user_id: userId,
    });
    console.log(
      `✅ Deleted ${resetTokensDeleted.deletedCount} password reset tokens for user: ${id}`,
    );
  } catch (error) {
    console.error("❌ Error deleting password reset tokens:", error);
  }

  try {
    const emailTokensDeleted = await EmailVerificationToken.deleteMany({
      user_id: userId,
    });
    console.log(
      `✅ Deleted ${emailTokensDeleted.deletedCount} email verification tokens for user: ${id}`,
    );
  } catch (error) {
    console.error("❌ Error deleting email verification tokens:", error);
  }

  try {
    const activityLogsDeleted = await UserActivityLog.deleteMany({
      user_id: userId,
    });
    console.log(
      `✅ Deleted ${activityLogsDeleted.deletedCount} activity logs for user: ${id}`,
    );
  } catch (error) {
    console.error("❌ Error deleting activity logs:", error);
  }

  await User.findByIdAndDelete(id);
  console.log(`✅ Deleted user: ${id}`);
}

export async function getAllUsers(role?: string): Promise<UserInterface[]> {
  await dbConnect();

  let query: any = {};
  if (role && ["admin", "writer", "user"].includes(role)) {
    query.role = role;
  }

  const users = await User.find(query)
    .select("-password_hash")
    .sort({ created_at: -1 })
    .lean();

  return convertDocArray<UserInterface>(users);
}

export async function createUserProfile(
  userId: string,
  profile: Partial<UserProfileInterface>,
): Promise<UserProfileInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const sanitizedProfile = {
    display_name: profile.display_name || undefined,
    website: profile.website || undefined,
    location: profile.location || undefined,
    social_twitter: profile.social_twitter || undefined,
    social_linkedin: profile.social_linkedin || undefined,
    social_github: profile.social_github || undefined,
    preferences: profile.preferences || {},
  };

  const result = await UserProfile.create({
    user_id: new Types.ObjectId(userId),
    ...sanitizedProfile,
  });

  const converted = convertDoc<UserProfileInterface>(result);
  if (!converted) throw new Error("Failed to create user profile");
  return converted;
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfileInterface | null> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }

  const profile = await UserProfile.findOne({
    user_id: new Types.ObjectId(userId),
  }).lean();

  return convertDoc(profile);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfileInterface>,
): Promise<UserProfileInterface> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const sanitizedUpdates: any = {};

  if (updates.display_name !== undefined) {
    sanitizedUpdates.display_name = updates.display_name;
  }
  if (updates.website !== undefined) {
    sanitizedUpdates.website = updates.website;
  }
  if (updates.location !== undefined) {
    sanitizedUpdates.location = updates.location;
  }
  if (updates.social_twitter !== undefined) {
    sanitizedUpdates.social_twitter = updates.social_twitter;
  }
  if (updates.social_linkedin !== undefined) {
    sanitizedUpdates.social_linkedin = updates.social_linkedin;
  }
  if (updates.social_github !== undefined) {
    sanitizedUpdates.social_github = updates.social_github;
  }
  if (updates.preferences !== undefined) {
    sanitizedUpdates.preferences = updates.preferences;
  }

  let result = await UserProfile.findOneAndUpdate(
    { user_id: new Types.ObjectId(userId) },
    sanitizedUpdates,
    { new: true, runValidators: true },
  );

  if (!result) {
    result = await UserProfile.create({
      user_id: new Types.ObjectId(userId),
      ...sanitizedUpdates,
    });
  }

  const converted = convertDoc<UserProfileInterface>(result);
  if (!converted) throw new Error("Failed to update user profile");
  return converted;
}

export async function logUserActivity(
  userId: string,
  action: string,
  description?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>,
): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔧 Development mode: Skipping user activity logging for:",
        userId,
      );
      return;
    }
    throw new Error("Invalid user ID");
  }

  try {
    await UserActivityLog.create({
      user_id: new Types.ObjectId(userId),
      action,
      description,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}
