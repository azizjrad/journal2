import { getNewsletterSubscribers } from "@/lib/db";
import { sendNewsletterEmail } from "@/lib/email-sendgrid";
import { SentNewsletter } from "@/lib/models/SentNewsletter";

export async function sendNewsletterToSubscribers(
  subject: string,
  content: string,
  subscriberIds: string[]
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
    // Send email to each selected subscriber
    for (const sub of selected) {
      await sendNewsletterEmail({
        to: sub.email,
        subject,
        html: content,
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
    return { success: false, error: (err as Error).message };
  }
}
