// Send password reset email
export async function sendPasswordResetEmail({ email, resetToken, userName }: { email: string; resetToken: string; userName?: string; }): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://journal.com"}/reset-password?token=${resetToken}`;
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || "no-reply@example.com",
    subject: "Password Reset Request",
    html: `<p>Hello${userName ? ` ${userName}` : ""},</p><p>You requested a password reset. Click <a href='${resetUrl}'>here</a> to reset your password. If you did not request this, please ignore this email.</p>`,
    text: `Hello${userName ? ` ${userName}` : ""},\nYou requested a password reset. Visit: ${resetUrl}`,
  };
  await sgMail.send(msg);
  return true;
}

// Send email verification
export async function sendEmailVerification({ email, verificationToken, userName }: { email: string; verificationToken: string; userName?: string; }): Promise<boolean> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://journal.com"}/verify-email?token=${verificationToken}`;
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || "no-reply@example.com",
    subject: "Verify Your Email Address",
    html: `<p>Hello${userName ? ` ${userName}` : ""},</p><p>Thank you for registering. Please <a href='${verifyUrl}'>verify your email address</a> to activate your account.</p>`,
    text: `Hello${userName ? ` ${userName}` : ""},\nPlease verify your email: ${verifyUrl}`,
  };
  await sgMail.send(msg);
  return true;
}
import sgMail from "@sendgrid/mail";

// You must set SENDGRID_API_KEY in your environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not set in environment variables");
}
sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.SENDGRID_FROM_EMAIL || "no-reply@example.com",
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<void> {
  const msg = {
    to,
    from,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ""),
  };
  await sgMail.send(msg);
}
