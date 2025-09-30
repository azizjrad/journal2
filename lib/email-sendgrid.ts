export async function sendEmailVerification({
  email,
  verificationToken,
  userName,
}: {
  email: string;
  verificationToken: string;
  userName?: string;
}): Promise<boolean> {
  const msg = {
    to: email,
    from: "azizjrad9@gmail.com", // your verified sender
    subject: "Email Verification",
    html: `<p>Hello ${userName || ""},</p>
           <p>Click <a href=\"https://akhbarna.vercel.app/auth/verify-email?token=${verificationToken}\">here</a> to verify your email address.</p>`,
  };
  await sgMail.send(msg);
  return true;
}
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendPasswordResetEmail({
  email,
  resetToken,
  userName,
}: {
  email: string;
  resetToken: string;
  userName?: string;
}): Promise<boolean> {
  const msg = {
    to: email,
    from: "azizjrad9@gmail.com", // must be verified in SendGrid
    subject: "Password Reset Request",
    html: `<p>Hello ${userName || ""},</p>
           <p>Click <a href="https://https://akhbarna.vercel.app/?token=${resetToken}">here</a> to reset your password.</p>`,
  };
  await sgMail.send(msg);
  return true;
}
