import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = "azizjrad9@gmail.com"; // your verified sender
const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendPasswordResetEmail({
  email,
  resetToken,
  userName,
}: {
  email: string;
  resetToken: string;
  userName?: string;
}): Promise<boolean> {
  try {
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Password Reset Request",
      html: `<p>Hello ${userName || ""},</p>
             <p>Click <a href="${BASE_URL}/auth/reset-password?token=${resetToken}">here</a> to reset your password.</p>
             <p>This link will expire in 1 hour.</p>`,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

export async function sendVerificationEmail({
  email,
  verificationToken,
  userName,
}: {
  email: string;
  verificationToken: string;
  userName?: string;
}): Promise<boolean> {
  try {
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Email Verification",
      html: `<p>Hello ${userName || ""},</p>
             <p>Click <a href="${BASE_URL}/auth/verify-email?token=${verificationToken}">here</a> to verify your email address.</p>
             <p>This link will expire in 1 hour.</p>`,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

export async function sendNewsletterEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending newsletter email:", error);
    return false;
  }
}
