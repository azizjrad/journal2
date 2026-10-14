import { Types } from "mongoose";
import { dbConnect } from "@/lib/db/connection";
import { convertDoc } from "@/lib/db/serialization";
import { EmailVerificationToken, PasswordResetToken } from "@/lib/models/User";

export async function createEmailVerificationToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<any> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  await EmailVerificationToken.updateMany(
    { user_id: new Types.ObjectId(userId), used: false },
    { used: true },
  );

  const result = await EmailVerificationToken.create({
    user_id: new Types.ObjectId(userId),
    token,
    expires_at: expiresAt,
  });

  return convertDoc(result);
}

export async function getEmailVerificationToken(token: string): Promise<any> {
  await dbConnect();

  const result = await EmailVerificationToken.findOne({
    token,
    used: false,
    expires_at: { $gt: new Date() },
  }).lean();

  return convertDoc(result);
}

export async function markEmailVerificationTokenAsUsed(
  id: string,
): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid token ID");
  }

  await EmailVerificationToken.findByIdAndUpdate(id, { used: true });
}

export async function createPasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<any> {
  await dbConnect();

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  await PasswordResetToken.updateMany(
    { user_id: new Types.ObjectId(userId), used: false },
    { used: true },
  );

  const result = await PasswordResetToken.create({
    user_id: new Types.ObjectId(userId),
    token,
    expires_at: expiresAt,
  });

  return convertDoc(result);
}

export async function getPasswordResetToken(token: string): Promise<any> {
  await dbConnect();

  const result = await PasswordResetToken.findOne({
    token,
    used: false,
    expires_at: { $gt: new Date() },
  }).lean();

  return convertDoc(result);
}

export async function markPasswordResetTokenAsUsed(id: string): Promise<void> {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid token ID");
  }

  await PasswordResetToken.findByIdAndUpdate(id, { used: true });
}
