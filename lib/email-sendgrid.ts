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
