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
    const planName =
      plan === "annual" ? "Annual Digital Access" : "Monthly Digital Access";
    const billingPeriod = plan === "annual" ? "year" : "month";
    const hasTrialPeriod = trialEnd && trialEnd > Date.now() / 1000;
    const trialEndDate = trialEnd
      ? new Date(trialEnd * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Welcome to Akhbarna Newsletter - Subscription Confirmed! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .success-icon { width: 80px; height: 80px; margin: 0 auto 20px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .checkmark { color: white; font-size: 48px; font-weight: bold; }
            .plan-box { background: #f9fafb; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .plan-name { color: #dc2626; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .price { font-size: 32px; font-weight: bold; color: #1f2937; }
            .trial-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
            .benefits { list-style: none; padding: 0; margin: 20px 0; }
            .benefits li { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .benefits li:before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">Akhbarna</h1>
            </div>
            <div class="content">
              <div class="success-icon">
                <div class="checkmark">✓</div>
              </div>
              <h2 style="text-align: center; color: #1f2937;">Subscription Confirmed!</h2>
              <p style="text-align: center; font-size: 18px; color: #6b7280;">
                Welcome to Akhbarna Premium, ${userName || ""}! 🎉
              </p>
              
              <div class="plan-box">
                <div class="plan-name">${planName}</div>
                ${
                  hasTrialPeriod
                    ? `
                  <div class="trial-badge">🎁 FREE 30-Day Trial</div>
                  <p style="color: #6b7280; margin: 10px 0;">Your free trial ends on <strong>${trialEndDate}</strong></p>
                `
                    : ""
                }
                <div class="price">$${amount}<span style="font-size: 18px; color: #6b7280;">/${billingPeriod}</span></div>
                ${
                  hasTrialPeriod
                    ? `
                  <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                    You won't be charged until your trial ends. Cancel anytime before ${trialEndDate} to avoid charges.
                  </p>
                `
                    : `
                  <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                    Your subscription renews automatically every ${billingPeriod}.
                  </p>
                `
                }
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">What You Get:</h3>
              <ul class="benefits">
                <li>Unlimited access to all premium articles</li>
                <li>Daily newsletter delivered to your inbox</li>
                <li>Ad-free reading experience</li>
                <li>Exclusive member-only content</li>
                <li>Early access to breaking news</li>
                <li>Support independent journalism</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}" class="button">Start Reading Now →</a>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1f2937;">Manage Your Subscription</h4>
                <p style="color: #6b7280; font-size: 14px;">
                  You can manage your subscription, update payment methods, or cancel anytime from your 
                  <a href="${BASE_URL}/settings?tab=subscription" style="color: #dc2626; font-weight: bold;">account settings</a>.
                </p>
              </div>

              <p style="color: #6b7280; margin-top: 30px;">
                Thank you for supporting Akhbarna! If you have any questions, feel free to reply to this email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Akhbarna. All rights reserved.</p>
              <p>
                <a href="${BASE_URL}/settings?tab=subscription" style="color: #dc2626;">Manage Subscription</a> | 
                <a href="${BASE_URL}/contact" style="color: #dc2626;">Contact Support</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
}: {
  email: string;
  userName?: string;
  plan: string;
  cancelAtPeriodEnd?: boolean;
  periodEndDate?: Date;
}): Promise<boolean> {
  try {
    const planName =
      plan === "annual" ? "Annual Digital Access" : "Monthly Digital Access";
    const formattedEndDate = periodEndDate
      ? new Date(periodEndDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: cancelAtPeriodEnd
        ? "Subscription Cancellation Scheduled - Akhbarna"
        : "Subscription Canceled - Akhbarna",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .warning-icon { width: 80px; height: 80px; margin: 0 auto 20px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .icon-text { color: white; font-size: 48px; font-weight: bold; }
            .info-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-box h3 { color: #92400e; margin-top: 0; }
            .info-box p { color: #78350f; margin: 10px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .highlight { background: #fef3c7; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">Akhbarna</h1>
            </div>
            <div class="content">
              <div class="warning-icon">
                <div class="icon-text">${cancelAtPeriodEnd ? "⏸" : "❌"}</div>
              </div>
              <h2 style="text-align: center; color: #1f2937;">
                ${
                  cancelAtPeriodEnd
                    ? "Subscription Cancellation Scheduled"
                    : "Subscription Canceled"
                }
              </h2>
              <p style="text-align: center; font-size: 18px; color: #6b7280;">
                Hello ${userName || ""}
              </p>
              
              ${
                cancelAtPeriodEnd && formattedEndDate
                  ? `
              <div class="info-box">
                <h3>Your subscription will remain active until ${formattedEndDate}</h3>
                <p>
                  You'll continue to have full access to all premium features until your current billing period ends.
                  After that date, your subscription will not renew and you'll lose access to premium content.
                </p>
                <p style="margin-top: 15px;">
                  <strong>Plan:</strong> ${planName}<br>
                  <strong>Access until:</strong> ${formattedEndDate}
                </p>
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">Changed your mind?</h3>
              <p style="color: #6b7280;">
                You can reactivate your subscription anytime before ${formattedEndDate} to continue enjoying premium access without interruption.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}/settings?tab=subscription" class="button">Reactivate Subscription</a>
              </div>
              `
                  : `
              <div class="info-box">
                <h3>Your subscription has been canceled</h3>
                <p>
                  Your <strong>${planName}</strong> subscription has been canceled and you no longer have access to premium features.
                </p>
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">Miss the premium experience?</h3>
              <p style="color: #6b7280;">
                You can resubscribe anytime to regain access to all premium features and exclusive content.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}/newsletter" class="button">Resubscribe Now</a>
              </div>
              `
              }

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1f2937;">What You'll Miss:</h4>
                <ul style="color: #6b7280; padding-left: 20px;">
                  <li>Unlimited access to all premium articles</li>
                  <li>Daily newsletter delivered to your inbox</li>
                  <li>Ad-free reading experience</li>
                  <li>Exclusive member-only content</li>
                </ul>
              </div>

              <p style="color: #6b7280; margin-top: 30px;">
                We're sorry to see you go! If you have any feedback about your experience, we'd love to hear from you.
                Simply reply to this email to let us know how we can improve.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Akhbarna. All rights reserved.</p>
              <p>
                <a href="${BASE_URL}/settings?tab=subscription" style="color: #dc2626;">Manage Subscription</a> | 
                <a href="${BASE_URL}/contact" style="color: #dc2626;">Contact Support</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
