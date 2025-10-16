import { getNewsletterSubscribers } from "@/lib/db";
import { sendNewsletterEmail } from "@/lib/email-sendgrid";
import { SentNewsletter } from "@/lib/models/SentNewsletter";

// Beautiful newsletter HTML template
function createNewsletterHTML(
  subject: string,
  content: string,
  imageCount: number = 0
): string {
  // Auto-generate image HTML at the bottom if there are attachments
  let autoImages = "";
  if (imageCount > 0) {
    autoImages = '<div style="margin-top: 30px;">';
    for (let i = 1; i <= imageCount; i++) {
      autoImages += `
        <div style="margin: 20px 0; text-align: center;">
          <img src="cid:image${i}" alt="Attachment ${i}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        </div>
      `;
    }
    autoImages += "</div>";
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          line-height: 1.6;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 42px;
          font-weight: bold;
          color: #ffffff;
          margin: 0;
          letter-spacing: -1px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        .tagline {
          color: #ffffff;
          font-size: 14px;
          margin-top: 8px;
          opacity: 0.95;
          letter-spacing: 1px;
        }
        .email-body {
          padding: 40px 30px;
          color: #333333;
        }
        .email-subject {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 25px 0;
          line-height: 1.3;
        }
        .email-content {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .email-content p {
          margin: 15px 0;
        }
        .email-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
        }
        .email-content a {
          color: #dc2626;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid transparent;
          transition: border-color 0.3s ease;
        }
        .email-content a:hover {
          border-bottom-color: #dc2626;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 30px 0;
        }
        .cta-button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          margin: 20px 0;
          box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(220, 38, 38, 0.4);
        }
        .email-footer {
          background-color: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin: 10px 0;
        }
        .footer-links {
          margin: 20px 0;
        }
        .footer-links a {
          color: #dc2626;
          text-decoration: none;
          margin: 0 12px;
          font-size: 14px;
          font-weight: 600;
        }
        .footer-links a:hover {
          text-decoration: underline;
        }
        .social-icons {
          margin: 20px 0;
        }
        .social-icons a {
          display: inline-block;
          margin: 0 8px;
          text-decoration: none;
        }
        .unsubscribe {
          color: #9ca3af;
          font-size: 12px;
          margin-top: 20px;
        }
        .unsubscribe a {
          color: #6b7280;
          text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 8px;
          }
          .email-header {
            padding: 30px 20px;
          }
          .logo {
            font-size: 32px;
          }
          .email-body {
            padding: 30px 20px;
          }
          .email-subject {
            font-size: 22px;
          }
          .email-content {
            font-size: 15px;
          }
          .email-footer {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <h1 class="logo">Akhbarna</h1>
          <p class="tagline">Your Trusted News Source</p>
        </div>
        
        <!-- Body -->
        <div class="email-body">
          <h2 class="email-subject">${subject}</h2>
          <div class="divider"></div>
          <div class="email-content">
            ${content}
            ${autoImages}
          </div>
          <div class="divider"></div>
          <p style="text-align: center;">
            <a href="${
              process.env.APP_BASE_URL || "http://localhost:3000"
            }" class="cta-button">
              Visit Akhbarna
            </a>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
          <p class="footer-text">
            <strong>Akhbarna</strong> - Delivering quality journalism you can trust
          </p>
          <div class="footer-links">
            <a href="${
              process.env.APP_BASE_URL || "http://localhost:3000"
            }/about">About Us</a> |
            <a href="${
              process.env.APP_BASE_URL || "http://localhost:3000"
            }/contact">Contact</a> |
            <a href="${
              process.env.APP_BASE_URL || "http://localhost:3000"
            }/privacy">Privacy Policy</a>
          </div>
          <div class="social-icons">
            <!-- Add your social media icons here -->
          </div>
          <p class="footer-text">
            © ${new Date().getFullYear()} Akhbarna. All rights reserved.
          </p>
          <p class="unsubscribe">
            You're receiving this email because you subscribed to Akhbarna Newsletter.<br>
            <a href="${
              process.env.APP_BASE_URL || "http://localhost:3000"
            }/settings?tab=subscription">Manage your subscription</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendNewsletterToSubscribers(
  subject: string,
  content: string,
  subscriberIds: string[],
  attachments?: File[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get all ACTIVE subscribers only (with emails)
    const allSubscribers = await getNewsletterSubscribers({
      limit: 10000,
      status: "active", // Only get active subscribers with valid payment
    });
    const selected = allSubscribers.filter((s: any) =>
      subscriberIds.includes(s._id)
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
      attachments?.length || 0
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
