import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "azizjrad9@gmail.com";
const FROM_NAME = process.env.FROM_NAME || "The Maghreb Orbit";
const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";
const BRAND_NAME = "The Maghreb Orbit";
const BRAND_TAGLINE = "Your Trusted News Source";
const ACCENT_COLOR = "#b91c1c";
const TEXT_COLOR = "#111827";
const MUTED_COLOR = "#4b5563";
const BORDER_COLOR = "#e5e7eb";
const BG_COLOR = "#f6f7f9";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const getEmailConfig = () => ({
  from: {
    email: FROM_EMAIL,
    name: FROM_NAME,
  },
  replyTo: process.env.REPLY_TO_EMAIL || FROM_EMAIL,
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
  },
  mailSettings: {
    bypassListManagement: { enable: false },
    footer: { enable: false },
    sandboxMode: { enable: false },
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function renderButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="border-radius:6px;background:${ACCENT_COLOR};">
          <a href="${safeHref}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;line-height:1.2;">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>`;
}

function renderEmailLayout({
  title,
  preheader,
  contentHtml,
  footerNoteHtml,
}: {
  title: string;
  preheader?: string;
  contentHtml: string;
  footerNoteHtml?: string;
}): string {
  const year = new Date().getFullYear();
  const safeTitle = escapeHtml(title);
  const safePreheader = preheader ? escapeHtml(preheader) : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT_COLOR};">
  ${safePreheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safePreheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG_COLOR};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER_COLOR};border-radius:8px;">
          <tr>
            <td style="padding:28px 32px 16px 32px;border-bottom:1px solid ${BORDER_COLOR};">
              <div style="font-size:20px;line-height:1.3;font-weight:700;color:${TEXT_COLOR};">${escapeHtml(BRAND_NAME)}</div>
              <div style="margin-top:6px;font-size:13px;line-height:1.5;color:${MUTED_COLOR};">${escapeHtml(BRAND_TAGLINE)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;font-weight:600;color:${TEXT_COLOR};">${safeTitle}</h1>
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid ${BORDER_COLOR};border-radius:0 0 8px 8px;">
              ${footerNoteHtml ? `<div style="margin:0 0 12px 0;font-size:13px;line-height:1.6;color:${MUTED_COLOR};">${footerNoteHtml}</div>` : ""}
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">&copy; ${year} ${escapeHtml(BRAND_NAME)}. All rights reserved.</p>
              <p style="margin:8px 0 0 0;font-size:12px;line-height:1.6;">
                <a href="${escapeHtml(BASE_URL)}" style="color:${ACCENT_COLOR};text-decoration:none;">Website</a>
                <span style="color:#9ca3af;">&nbsp;|&nbsp;</span>
                <a href="${escapeHtml(BASE_URL)}/contact" style="color:${ACCENT_COLOR};text-decoration:none;">Contact</a>
                <span style="color:#9ca3af;">&nbsp;|&nbsp;</span>
                <a href="${escapeHtml(BASE_URL)}/privacy" style="color:${ACCENT_COLOR};text-decoration:none;">Privacy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
    const resetLink = `${BASE_URL}/auth/reset-password?token=${resetToken}`;
    const name = userName ? escapeHtml(userName) : "there";
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">We received a request to reset the password for your ${escapeHtml(BRAND_NAME)} account. Use the button below to choose a new password.</p>
      ${renderButton(resetLink, "Reset password")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:14px 16px;font-size:14px;line-height:1.7;color:${MUTED_COLOR};">
            <strong style="color:${TEXT_COLOR};">Important</strong><br />
            This link expires in 1 hour.<br />
            If you did not request this, you can safely ignore this email.
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px 0;font-size:13px;line-height:1.7;color:${MUTED_COLOR};">If the button does not work, copy and paste this link into your browser:</p>
      <p style="margin:0;font-size:13px;line-height:1.7;word-break:break-all;"><a href="${escapeHtml(resetLink)}" style="color:${ACCENT_COLOR};text-decoration:none;">${escapeHtml(resetLink)}</a></p>`;
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `Reset your password - ${BRAND_NAME}`,
      html: renderEmailLayout({
        title: "Reset your password",
        preheader: "Reset the password for your account.",
        contentHtml,
        footerNoteHtml: `If you have concerns about your account security, please <a href="${escapeHtml(BASE_URL)}/contact" style="color:${ACCENT_COLOR};text-decoration:none;">contact our support team</a>.`,
      }),
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
    const verificationLink = `${BASE_URL}/auth/verify-email?token=${verificationToken}`;
    const name = userName ? escapeHtml(userName) : "there";
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Welcome to ${escapeHtml(BRAND_NAME)}. Please confirm your email address to finish setting up your account.</p>
      ${renderButton(verificationLink, "Verify email address")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:14px 16px;font-size:14px;line-height:1.7;color:${MUTED_COLOR};">
            This verification link expires in 1 hour.<br />
            If you did not create an account, you can safely ignore this email.
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px 0;font-size:13px;line-height:1.7;color:${MUTED_COLOR};">If the button does not work, copy and paste this link into your browser:</p>
      <p style="margin:0;font-size:13px;line-height:1.7;word-break:break-all;"><a href="${escapeHtml(verificationLink)}" style="color:${ACCENT_COLOR};text-decoration:none;">${escapeHtml(verificationLink)}</a></p>`;
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `Verify your email - ${BRAND_NAME}`,
      html: renderEmailLayout({
        title: "Verify your email",
        preheader: "Confirm your email address to get started.",
        contentHtml,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

export async function sendSubscriptionConfirmationEmail({
  email,
  userName,
  plan,
  amount,
  trialEnd,
}: {
  email: string;
  userName?: string;
  plan: string;
  amount: number;
  trialEnd?: number;
}): Promise<boolean> {
  try {
    const planName = plan === "annual" ? "Annual Digital Access" : "Monthly Digital Access";
    const billingPeriod = plan === "annual" ? "year" : "month";
    const hasTrialPeriod = trialEnd && trialEnd > Date.now() / 1000;
    const trialEndDate = trialEnd
      ? new Date(trialEnd * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
    const name = userName ? escapeHtml(userName) : "there";
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Your subscription to ${escapeHtml(BRAND_NAME)} is confirmed.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
            <div style="font-size:16px;font-weight:600;color:${TEXT_COLOR};margin-bottom:6px;">${escapeHtml(planName)}</div>
            ${hasTrialPeriod && trialEndDate ? `<div style="margin-bottom:6px;"><strong style="color:${TEXT_COLOR};">Free trial ends:</strong> ${escapeHtml(trialEndDate)}</div>` : ""}
            <div><strong style="color:${TEXT_COLOR};">Price:</strong> $${amount}/${escapeHtml(billingPeriod)}</div>
            <div style="margin-top:8px;">
              ${hasTrialPeriod && trialEndDate
                ? `You will not be charged until your trial ends. You can cancel anytime before ${escapeHtml(trialEndDate)}.`
                : `Your subscription renews automatically every ${escapeHtml(billingPeriod)}.`}
            </div>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.7;color:${TEXT_COLOR};font-weight:600;">What is included</p>
      <ul style="margin:0 0 16px 20px;padding:0;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
        <li>Unlimited access to premium articles</li>
        <li>Newsletter delivery to your inbox</li>
        <li>Ad-free reading experience</li>
        <li>Exclusive member-only content</li>
      </ul>
      ${renderButton(`${BASE_URL}/settings?tab=subscription`, "Manage subscription")}
      <p style="margin:0;font-size:14px;line-height:1.7;color:${MUTED_COLOR};">You can also start reading on <a href="${escapeHtml(BASE_URL)}" style="color:${ACCENT_COLOR};text-decoration:none;">our website</a>.</p>`;
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `Subscription confirmed - ${BRAND_NAME}`,
      html: renderEmailLayout({
        title: "Subscription confirmed",
        preheader: "Your subscription is active.",
        contentHtml,
        footerNoteHtml: `Need help? <a href="${escapeHtml(BASE_URL)}/contact" style="color:${ACCENT_COLOR};text-decoration:none;">Contact support</a>.`,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error);
    return false;
  }
}

export async function sendSubscriptionCancellationEmail({
  email,
  userName,
  plan,
  cancelAtPeriodEnd,
  periodEndDate,
  canceledByAdmin = false,
  reason,
}: {
  email: string;
  userName?: string;
  plan: string;
  cancelAtPeriodEnd?: boolean;
  periodEndDate?: Date;
  canceledByAdmin?: boolean;
  reason?: string;
}): Promise<boolean> {
  try {
    const planName = plan === "annual" ? "Annual Digital Access" : "Monthly Digital Access";
    const formattedEndDate = periodEndDate
      ? new Date(periodEndDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
    const name = userName ? escapeHtml(userName) : "there";
    const title = cancelAtPeriodEnd ? "Subscription cancellation scheduled" : "Subscription canceled";
    const subject = cancelAtPeriodEnd
      ? `Subscription cancellation scheduled - ${BRAND_NAME}`
      : `Subscription canceled - ${BRAND_NAME}`;

    let messageHtml = "";
    if (cancelAtPeriodEnd && formattedEndDate) {
      messageHtml = `
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Your subscription will remain active until <strong style="color:${TEXT_COLOR};">${escapeHtml(formattedEndDate)}</strong>. After that date, it will not renew.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
          <tr>
            <td style="padding:14px 16px;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
              <strong style="color:${TEXT_COLOR};">Plan:</strong> ${escapeHtml(planName)}<br />
              <strong style="color:${TEXT_COLOR};">Access until:</strong> ${escapeHtml(formattedEndDate)}
            </td>
          </tr>
        </table>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">If you change your mind, you can reactivate before that date.</p>
        ${renderButton(`${BASE_URL}/settings?tab=subscription`, "Reactivate subscription")}`;
    } else if (canceledByAdmin) {
      messageHtml = `
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Your <strong style="color:${TEXT_COLOR};">${escapeHtml(planName)}</strong> subscription has been canceled by our support team.</p>
        ${reason ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:${MUTED_COLOR};"><strong style="color:${TEXT_COLOR};">Reason:</strong> ${formatMultiline(reason)}</p>` : ""}
        <p style="margin:0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">If you have questions about this cancellation, please contact our support team.</p>`;
    } else {
      messageHtml = `
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Your <strong style="color:${TEXT_COLOR};">${escapeHtml(planName)}</strong> subscription has been canceled and premium access has ended.</p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">You can resubscribe at any time to regain access.</p>
        ${renderButton(`${BASE_URL}/newsletter`, "Resubscribe")}`;
    }

    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
      ${messageHtml}
      <p style="margin:24px 0 0 0;font-size:14px;line-height:1.7;color:${MUTED_COLOR};">If you have feedback or need help, reply to this email or <a href="${escapeHtml(BASE_URL)}/contact" style="color:${ACCENT_COLOR};text-decoration:none;">contact support</a>.</p>`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject,
      html: renderEmailLayout({
        title,
        preheader: subject,
        contentHtml,
        footerNoteHtml: `<a href="${escapeHtml(BASE_URL)}/settings?tab=subscription" style="color:${ACCENT_COLOR};text-decoration:none;">Manage subscription</a>`,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending subscription cancellation email:", error);
    return false;
  }
}

export async function sendNewsletterEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}): Promise<boolean> {
  try {
    const msg: any = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      msg.attachments = attachments;
    }

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending newsletter email:", error);
    return false;
  }
}

export async function sendContactFormNotificationToAdmin({
  senderName,
  senderEmail,
  subject,
  message,
  messageId,
}: {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  messageId: string;
}): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || FROM_EMAIL;
    const adminLink = `${BASE_URL}/admin`;
    const receivedAt = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">A new contact form message has been submitted.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
            <div><strong style="color:${TEXT_COLOR};">From:</strong> ${escapeHtml(senderName)}</div>
            <div><strong style="color:${TEXT_COLOR};">Email:</strong> <a href="mailto:${escapeHtml(senderEmail)}" style="color:${ACCENT_COLOR};text-decoration:none;">${escapeHtml(senderEmail)}</a></div>
            <div><strong style="color:${TEXT_COLOR};">Subject:</strong> ${escapeHtml(subject)}</div>
            <div><strong style="color:${TEXT_COLOR};">Message ID:</strong> ${escapeHtml(messageId)}</div>
            <div><strong style="color:${TEXT_COLOR};">Received:</strong> ${escapeHtml(receivedAt)}</div>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;">
            <div style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:${TEXT_COLOR};text-transform:uppercase;letter-spacing:0.03em;">Message</div>
            <div style="font-size:15px;line-height:1.7;color:${MUTED_COLOR};">${formatMultiline(message)}</div>
          </td>
        </tr>
      </table>
      ${renderButton(adminLink, "Open admin dashboard")}
      <p style="margin:0;font-size:14px;line-height:1.7;color:${MUTED_COLOR};">Quick reply: <a href="mailto:${escapeHtml(senderEmail)}?subject=${encodeURIComponent(`Re: ${subject}`)}" style="color:${ACCENT_COLOR};text-decoration:none;">${escapeHtml(senderEmail)}</a></p>`;

    const msg = {
      to: adminEmail,
      from: FROM_EMAIL,
      subject: `New contact form message: ${subject}`,
      html: renderEmailLayout({
        title: "New contact form message",
        preheader: `From ${senderName}: ${subject}`,
        contentHtml,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending contact form notification to admin:", error);
    return false;
  }
}

export async function sendWriterApplicationNotificationToAdmin({
  applicantEmail,
  applicantName,
  applicantUsername,
  applicantId,
}: {
  applicantEmail: string;
  applicantName?: string;
  applicantUsername: string;
  applicantId: string;
}): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || FROM_EMAIL;
    const verifyLink = `${BASE_URL}/admin`;
    const receivedAt = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">A new writer application is ready for review.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
            <div><strong style="color:${TEXT_COLOR};">Name:</strong> ${escapeHtml(applicantName || "Not provided")}</div>
            <div><strong style="color:${TEXT_COLOR};">Username:</strong> @${escapeHtml(applicantUsername)}</div>
            <div><strong style="color:${TEXT_COLOR};">Email:</strong> <a href="mailto:${escapeHtml(applicantEmail)}" style="color:${ACCENT_COLOR};text-decoration:none;">${escapeHtml(applicantEmail)}</a></div>
            <div><strong style="color:${TEXT_COLOR};">User ID:</strong> ${escapeHtml(applicantId)}</div>
            <div><strong style="color:${TEXT_COLOR};">Received:</strong> ${escapeHtml(receivedAt)}</div>
            <div><strong style="color:${TEXT_COLOR};">Status:</strong> Pending review</div>
          </td>
        </tr>
      </table>
      ${renderButton(verifyLink, "Review application")}`;

    const msg = {
      to: adminEmail,
      from: FROM_EMAIL,
      subject: `New writer application - ${BRAND_NAME}`,
      html: renderEmailLayout({
        title: "New writer application",
        preheader: `Writer application from @${applicantUsername}`,
        contentHtml,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error(
      "Error sending writer application notification to admin:",
      error
    );
    return false;
  }
}

export async function sendSubscriptionRenewalEmail({
  email,
  userName,
  plan,
  amount,
  nextBillingDate,
}: {
  email: string;
  userName?: string;
  plan: string;
  amount: number;
  nextBillingDate?: Date;
}): Promise<boolean> {
  try {
    const planName = plan === "annual" ? "Annual Digital Access" : "Monthly Digital Access";
    const billingPeriod = plan === "annual" ? "year" : "month";
    const formattedNextBilling = nextBillingDate
      ? new Date(nextBillingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
    const name = userName ? escapeHtml(userName) : "there";
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Your <strong style="color:${TEXT_COLOR};">${escapeHtml(planName)}</strong> subscription has been renewed successfully.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
            <div><strong style="color:${TEXT_COLOR};">Amount charged:</strong> $${amount}</div>
            ${formattedNextBilling ? `<div><strong style="color:${TEXT_COLOR};">Next billing date:</strong> ${escapeHtml(formattedNextBilling)}</div>` : ""}
            <div><strong style="color:${TEXT_COLOR};">Billing cycle:</strong> ${escapeHtml(billingPeriod)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:${MUTED_COLOR};">Your subscription will renew automatically every ${escapeHtml(billingPeriod)} unless you cancel.</p>
      ${renderButton(`${BASE_URL}/settings?tab=subscription`, "Manage subscription")}`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `Subscription renewed - ${BRAND_NAME}`,
      html: renderEmailLayout({
        title: "Subscription renewed",
        preheader: "Your subscription has been renewed.",
        contentHtml,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending subscription renewal email:", error);
    return false;
  }
}

// Send account deletion notification email
export async function sendAccountDeletionEmail({
  email,
  firstName,
  lastName,
  reason,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  reason?: string;
}) {
  try {
    const name = firstName
      ? `${firstName} ${lastName || ""}`.trim()
      : email.split("@")[0];
    const safeName = escapeHtml(name);
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${safeName},</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Your ${escapeHtml(BRAND_NAME)} account has been deleted by an administrator.</p>
      ${reason ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:${MUTED_COLOR};"><strong style="color:${TEXT_COLOR};">Reason:</strong> ${formatMultiline(reason)}</p>` : ""}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;">
            <div style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${TEXT_COLOR};">What this means</div>
            <ul style="margin:0 0 0 20px;padding:0;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
              <li>Your account and associated data have been removed.</li>
              <li>You no longer have access to premium content or features.</li>
              <li>Any active subscriptions have been canceled.</li>
            </ul>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">If you believe this was done in error, please contact our support team.</p>
      ${renderButton(`${BASE_URL}/contact`, "Contact support")}
      <p style="margin:0;font-size:13px;line-height:1.7;color:${MUTED_COLOR};">If you wish to use ${escapeHtml(BRAND_NAME)} in the future, you will need to create a new account.</p>`;

    const msg = {
      to: email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `Your account has been deleted - ${BRAND_NAME}`,
      html: renderEmailLayout({
        title: "Account deleted",
        preheader: "Your account has been deleted.",
        contentHtml,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending account deletion email:", error);
    return false;
  }
}

export async function sendWriterApprovalEmail({
  email,
  userName,
  approved,
  reason,
}: {
  email: string;
  userName?: string;
  approved: boolean;
  reason?: string;
}): Promise<boolean> {
  try {
    const name = userName ? escapeHtml(userName) : "there";
    const title = approved ? "Writer application approved" : "Writer application update";
    const contentHtml = approved
      ? `
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Your application to write for ${escapeHtml(BRAND_NAME)} has been approved. You can now create and publish articles from your writer dashboard.</p>
        <ul style="margin:0 0 16px 20px;padding:0;font-size:14px;line-height:1.8;color:${MUTED_COLOR};">
          <li>Write and publish articles</li>
          <li>Manage your published content</li>
          <li>Track article performance</li>
        </ul>
        ${renderButton(`${BASE_URL}/writer`, "Open writer dashboard")}`
      : `
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Thank you for your interest in writing for ${escapeHtml(BRAND_NAME)}. After reviewing your application, we are unable to approve it at this time.</p>
        ${reason ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:${MUTED_COLOR};"><strong style="color:${TEXT_COLOR};">Reason:</strong> ${formatMultiline(reason)}</p>` : ""}
        <p style="margin:0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">You are welcome to reapply in the future. If you have questions, please contact our support team.</p>`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `${title} - ${BRAND_NAME}`,
      html: renderEmailLayout({
        title,
        preheader: title,
        contentHtml,
        footerNoteHtml: `<a href="${escapeHtml(BASE_URL)}/contact" style="color:${ACCENT_COLOR};text-decoration:none;">Contact support</a>`,
      }),
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending writer approval email:", error);
    return false;
  }
}

export async function sendContactReplyEmail({
  recipientEmail,
  recipientName,
  originalSubject,
  originalMessage,
  replyMessage,
  attachments,
}: {
  recipientEmail: string;
  recipientName: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}): Promise<boolean> {
  try {
    const name = recipientName ? escapeHtml(recipientName) : "there";
    const contentHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Hello ${name},</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${MUTED_COLOR};">Thank you for contacting ${escapeHtml(BRAND_NAME)}. Here is our response to your message.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;">
            <div style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:${TEXT_COLOR};text-transform:uppercase;letter-spacing:0.03em;">Our response</div>
            <div style="font-size:15px;line-height:1.7;color:${MUTED_COLOR};">${formatMultiline(replyMessage)}</div>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;background:#f9fafb;border:1px solid ${BORDER_COLOR};border-radius:6px;">
        <tr>
          <td style="padding:16px 18px;">
            <div style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:${TEXT_COLOR};text-transform:uppercase;letter-spacing:0.03em;">Your original message</div>
            <div style="margin:0 0 8px 0;font-size:14px;line-height:1.7;color:${TEXT_COLOR};"><strong>Subject:</strong> ${escapeHtml(originalSubject)}</div>
            <div style="font-size:14px;line-height:1.7;color:${MUTED_COLOR};">${formatMultiline(originalMessage)}</div>
          </td>
        </tr>
      </table>
      ${renderButton(`${BASE_URL}/contact`, "Contact us")}`;

    const msg: any = {
      to: recipientEmail,
      from: FROM_EMAIL,
      subject: `Re: ${originalSubject}`,
      html: renderEmailLayout({
        title: "Response to your message",
        preheader: `Response regarding: ${originalSubject}`,
        contentHtml,
        footerNoteHtml: `If you need further assistance, reply to this email or use our <a href="${escapeHtml(BASE_URL)}/contact" style="color:${ACCENT_COLOR};text-decoration:none;">contact page</a>.`,
      }),
    };

    if (attachments && attachments.length > 0) {
      msg.attachments = attachments;
    }

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending contact reply email:", error);
    return false;
  }
}
