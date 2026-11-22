import { getNewsletterSubscribers } from "@/lib/services/newsletter-service";
import { sendNewsletterEmail } from "@/lib/email/email-sendgrid";
import { SentNewsletter } from "@/lib/models/SentNewsletter";

const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";
const BRAND_NAME = "The Maghreb Corridor";
const BRAND_TAGLINE = "Your Trusted News Source";
const ACCENT_COLOR = "#b91c1c";
const TEXT_COLOR = "#111827";
const MUTED_COLOR = "#4b5563";
const BORDER_COLOR = "#e5e7eb";
const BG_COLOR = "#f6f7f9";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Beautiful newsletter HTML template
function createNewsletterHTML(
  subject: string,
  content: string,
  imageCount: number = 0,
): string {
  let autoImages = "";
  if (imageCount > 0) {
    autoImages = '<div style="margin-top:24px;">';
    for (let i = 1; i <= imageCount; i++) {
      autoImages += `
        <div style="margin:16px 0;text-align:center;">
          <img src="cid:image${i}" alt="Newsletter image ${i}" style="max-width:100%;height:auto;border-radius:6px;border:1px solid ${BORDER_COLOR};">
        </div>
      `;
    }
    autoImages += "</div>";
  }

  const year = new Date().getFullYear();
  const safeSubject = escapeHtml(subject);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT_COLOR};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG_COLOR};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid ${BORDER_COLOR};border-radius:8px;">
          <tr>
            <td style="padding:28px 32px 16px 32px;border-bottom:1px solid ${BORDER_COLOR};">
              <div style="font-size:20px;line-height:1.3;font-weight:700;color:${TEXT_COLOR};">${escapeHtml(BRAND_NAME)}</div>
              <div style="margin-top:6px;font-size:13px;line-height:1.5;color:${MUTED_COLOR};">${escapeHtml(BRAND_TAGLINE)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.3;font-weight:600;color:${TEXT_COLOR};">${safeSubject}</h1>
              <div style="font-size:15px;line-height:1.8;color:${MUTED_COLOR};">
                ${content}
                ${autoImages}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0 0;">
                <tr>
                  <td align="center" style="border-radius:6px;background:${ACCENT_COLOR};">
                    <a href="${escapeHtml(BASE_URL)}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;line-height:1.2;">
                      Visit ${escapeHtml(BRAND_NAME)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid ${BORDER_COLOR};border-radius:0 0 8px 8px;">
              <p style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:${MUTED_COLOR};">You are receiving this email because you subscribed to the ${escapeHtml(BRAND_NAME)} newsletter.</p>
              <p style="margin:0 0 10px 0;font-size:12px;line-height:1.6;">
                <a href="${escapeHtml(BASE_URL)}/about" style="color:${ACCENT_COLOR};text-decoration:none;">About</a>
                <span style="color:#9ca3af;">&nbsp;|&nbsp;</span>
                <a href="${escapeHtml(BASE_URL)}/contact" style="color:${ACCENT_COLOR};text-decoration:none;">Contact</a>
                <span style="color:#9ca3af;">&nbsp;|&nbsp;</span>
                <a href="${escapeHtml(BASE_URL)}/privacy" style="color:${ACCENT_COLOR};text-decoration:none;">Privacy</a>
                <span style="color:#9ca3af;">&nbsp;|&nbsp;</span>
                <a href="${escapeHtml(BASE_URL)}/settings?tab=subscription" style="color:${ACCENT_COLOR};text-decoration:none;">Manage subscription</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">&copy; ${year} ${escapeHtml(BRAND_NAME)}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendNewsletterToSubscribers(
  subject: string,
  content: string,
  subscriberIds: string[],
  attachments?: File[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get all ACTIVE subscribers only (with emails)
    const allSubscribers = await getNewsletterSubscribers({
      limit: 10000,
      status: "active", // Only get active subscribers with valid payment
    });
    const selected = allSubscribers.filter((s: any) =>
      subscriberIds.includes(s._id),
    );
    if (selected.length === 0) {
      return { success: false, error: "No valid active subscribers selected" };
    }

    // Process attachments as INLINE images if provided
    let emailAttachments: Array<{
      content: string;
      filename: string;
      type: string;
      disposition: string;
      contentId: string;
    }> = [];

    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Content = buffer.toString("base64");

        // Create a unique content ID for each image
        const contentId = `image${i + 1}`;

        emailAttachments.push({
          content: base64Content,
          filename: file.name,
          type: file.type,
          disposition: "inline", // Changed from "attachment" to "inline"
          contentId: contentId, // Add content ID for inline embedding
        });
      }
    }

    // Create beautiful HTML email template with auto-appended images
    const beautifulHTML = createNewsletterHTML(
      subject,
      content,
      attachments?.length || 0,
    );

    // Send email to each selected subscriber
    for (const sub of selected) {
      await sendNewsletterEmail({
        to: sub.email,
        subject,
        html: beautifulHTML,
        attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
      });
    }

    // Store sent newsletter in DB for history
    await SentNewsletter.create({
      subject,
      content,
      recipientIds: selected.map((s: any) => s._id),
      recipientCount: selected.length,
    });

    return { success: true };
  } catch (err) {
    console.error("Newsletter sending error:", err);
    return { success: false, error: (err as Error).message };
  }
}
