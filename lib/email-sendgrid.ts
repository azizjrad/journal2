import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "azizjrad9@gmail.com"; // Use custom domain email for better deliverability
const FROM_NAME = process.env.FROM_NAME || "The Maghreb Orbit";
const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Email configuration for better deliverability
const getEmailConfig = () => ({
  from: {
    email: FROM_EMAIL,
    name: FROM_NAME,
  },
  replyTo: process.env.REPLY_TO_EMAIL || FROM_EMAIL,
  // Track opens and clicks for engagement metrics
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
  },
  // Mail settings for better deliverability
  mailSettings: {
    bypassListManagement: { enable: false },
    footer: { enable: false },
    sandboxMode: { enable: false },
  },
});

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

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Reset Your Password - The Maghreb Orbit",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
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
            .email-body {
              padding: 40px 30px;
              color: #333333;
            }
            .icon-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .lock-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto;
              background: #fef3c7;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
            }
            .email-title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin: 20px 0;
              text-align: center;
            }
            .email-content {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .warning-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-box p {
              margin: 5px 0;
              color: #92400e;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              padding: 16px 40px;
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 18px;
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
              text-align: center;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .alternative-link {
              font-size: 12px;
              color: #6b7280;
              margin-top: 20px;
              word-break: break-all;
              background: #f3f4f6;
              padding: 10px;
              border-radius: 4px;
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
              .email-title {
                font-size: 22px;
              }
              .cta-button {
                padding: 14px 30px;
                font-size: 16px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1 class="logo">The Maghreb Orbit</h1>
            </div>
            
            <div class="email-body">
              <div class="icon-container">
                <div class="lock-icon">🔒</div>
              </div>
              
              <h2 class="email-title">Reset Your Password</h2>
              
              <p class="email-content">
                Hello <strong>${userName || "there"}</strong>,
              </p>
              
              <p class="email-content">
                We received a request to reset the password for your The Maghreb Orbit account. 
                Click the button below to create a new password:
              </p>
              
              <div class="button-container">
                <a href="${resetLink}" class="cta-button">
                  Reset Password
                </a>
              </div>
              
              <div class="warning-box">
                <p><strong>⏱️ Important:</strong></p>
                <p>• This link will expire in <strong>1 hour</strong></p>
                <p>• If you didn't request this, you can safely ignore this email</p>
                <p>• Your password won't change until you create a new one</p>
              </div>
              
              <p class="email-content">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              
              <div class="alternative-link">
                ${resetLink}
              </div>
              
              <p class="email-content" style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                If you didn't request a password reset, please ignore this email or 
                <a href="${BASE_URL}/contact" style="color: #dc2626;">contact our support team</a> 
                if you have concerns about your account security.
              </p>
            </div>
            
            <div class="email-footer">
              <p class="footer-text">
                <strong>The Maghreb Orbit</strong> - Your Trusted News Source
              </p>
              <p class="footer-text">
                © ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.
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

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Verify Your Email - Welcome to The Maghreb Orbit!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
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
              color: #fecaca;
              font-size: 14px;
              margin: 10px 0 0 0;
              font-weight: 300;
            }
            .email-body {
              padding: 40px 30px;
              color: #333333;
            }
            .icon-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .welcome-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto;
              background: #dbeafe;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
            }
            .email-title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin: 20px 0;
              text-align: center;
            }
            .email-content {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.8;
              margin-bottom: 20px;
            }
            .welcome-box {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border-left: 4px solid #3b82f6;
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
            }
            .welcome-box h3 {
              margin: 0 0 10px 0;
              color: #1e40af;
              font-size: 18px;
            }
            .welcome-box ul {
              margin: 10px 0;
              padding-left: 20px;
              color: #1e3a8a;
            }
            .welcome-box li {
              margin: 8px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 16px 40px;
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 18px;
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
              text-align: center;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .info-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box p {
              margin: 5px 0;
              color: #92400e;
              font-size: 14px;
            }
            .alternative-link {
              font-size: 12px;
              color: #6b7280;
              margin-top: 20px;
              word-break: break-all;
              background: #f3f4f6;
              padding: 10px;
              border-radius: 4px;
            }
            .email-footer {
              background-color: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-links {
              margin: 15px 0;
            }
            .footer-links a {
              color: #dc2626;
              text-decoration: none;
              margin: 0 10px;
              font-size: 14px;
            }
            .footer-text {
              color: #6b7280;
              font-size: 14px;
              margin: 10px 0;
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
              .email-title {
                font-size: 22px;
              }
              .cta-button {
                padding: 14px 30px;
                font-size: 16px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1 class="logo">The Maghreb Orbit</h1>
              <p class="tagline">Your Trusted News Source</p>
            </div>
            
            <div class="email-body">
              <div class="icon-container">
                <div class="welcome-icon">✉️</div>
              </div>
              
              <h2 class="email-title">Welcome to The Maghreb Orbit!</h2>
              
              <p class="email-content">
                Hello <strong>${userName || "there"}</strong>,
              </p>
              
              <p class="email-content">
                Thank you for joining The Maghreb Orbit! We're excited to have you as part of our community. 
                To get started, please verify your email address by clicking the button below:
              </p>
              
              <div class="button-container">
                <a href="${verificationLink}" class="cta-button">
                  Verify My Email
                </a>
              </div>
              
              <div class="welcome-box">
                <h3>🎉 What's Next?</h3>
                <ul>
                  <li><strong>Stay Informed:</strong> Get the latest news from trusted sources</li>
                  <li><strong>Personalize:</strong> Follow topics and categories you care about</li>
                  <li><strong>Engage:</strong> Share articles and join the conversation</li>
                  <li><strong>Go Premium:</strong> Unlock exclusive content and features</li>
                </ul>
              </div>
              
              <div class="info-box">
                <p><strong>⏱️ Quick Reminder:</strong></p>
                <p>• This verification link will expire in <strong>1 hour</strong></p>
                <p>• Verifying your email helps keep your account secure</p>
              </div>
              
              <p class="email-content">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              
              <div class="alternative-link">
                ${verificationLink}
              </div>
              
              <p class="email-content" style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                If you didn't create an account with The Maghreb Orbit, you can safely ignore this email.
              </p>
            </div>
            
            <div class="email-footer">
              <div class="footer-links">
                <a href="${BASE_URL}/about">About Us</a> •
                <a href="${BASE_URL}/contact">Contact</a> •
                <a href="${BASE_URL}/privacy">Privacy Policy</a>
              </div>
              <p class="footer-text">
                <strong>The Maghreb Orbit</strong> - Your Trusted News Source
              </p>
              <p class="footer-text">
                © ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.
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
      subject:
        "Welcome to The Maghreb Orbit Newsletter - Subscription Confirmed! 🎉",
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
              <h1 style="margin: 0; font-size: 36px;">The Maghreb Orbit</h1>
            </div>
            <div class="content">
              <div class="success-icon">
                <div class="checkmark">✓</div>
              </div>
              <h2 style="text-align: center; color: #1f2937;">Subscription Confirmed!</h2>
              <p style="text-align: center; font-size: 18px; color: #6b7280;">
                Welcome to The Maghreb Orbit Premium, ${userName || ""}! 🎉
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
                Thank you for supporting The Maghreb Orbit! If you have any questions, feel free to reply to this email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.</p>
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
        ? "Subscription Cancellation Scheduled - The Maghreb Orbit"
        : "Subscription Canceled - The Maghreb Orbit",
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
              <h1 style="margin: 0; font-size: 36px;">The Maghreb Orbit</h1>
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
                  : canceledByAdmin
                  ? `
              <div class="info-box">
                <h3>Your subscription was canceled by our support team</h3>
                <p>
                  Your <strong>${planName}</strong> subscription has been canceled by our support team and you no longer have access to premium features.
                </p>
                ${
                  reason
                    ? `<p style="margin-top: 15px;">
                    <strong>Reason:</strong> ${reason}
                  </p>`
                    : ""
                }
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">Have questions?</h3>
              <p style="color: #6b7280;">
                If you have any questions about this cancellation or would like to discuss your subscription, please contact our support team. We're here to help.
              </p>
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
              <p>© ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.</p>
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

    // Add attachments if provided
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
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: approved
        ? "Writer Application Approved - The Maghreb Orbit"
        : "Writer Application Update - The Maghreb Orbit",
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
            .warning-icon { width: 80px; height: 80px; margin: 0 auto 20px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .icon-text { color: white; font-size: 48px; font-weight: bold; }
            .info-box { background: ${
              approved ? "#d1fae5" : "#fef3c7"
            }; border: 2px solid ${
        approved ? "#10b981" : "#f59e0b"
      }; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-box h3 { color: ${
              approved ? "#065f46" : "#92400e"
            }; margin-top: 0; }
            .info-box p { color: ${
              approved ? "#047857" : "#78350f"
            }; margin: 10px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .feature-list { list-style: none; padding: 0; }
            .feature-list li { padding: 10px 0; padding-left: 30px; position: relative; }
            .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">The Maghreb Orbit</h1>
            </div>
            <div class="content">
              <div class="${approved ? "success-icon" : "warning-icon"}">
                <div class="icon-text">${approved ? "✓" : "!"}</div>
              </div>
              <h2 style="text-align: center; color: #1f2937;">
                ${
                  approved
                    ? "Welcome to the The Maghreb Orbit Writing Team!"
                    : "Writer Application Update"
                }
              </h2>
              <p style="text-align: center; font-size: 18px; color: #6b7280;">
                Hello ${userName || ""}
              </p>
              
              ${
                approved
                  ? `
              <div class="info-box">
                <h3>Congratulations! Your writer application has been approved</h3>
                <p>
                  You now have writer privileges on The Maghreb Orbit. You can start creating and publishing articles right away.
                </p>
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">What you can do now:</h3>
              <ul class="feature-list">
                <li>Write and publish articles</li>
                <li>Access the writer dashboard</li>
                <li>Manage your published content</li>
                <li>Track article views and engagement</li>
                <li>Edit and update your articles</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}/writer" class="button" style="color: #ffffff !important; text-decoration: none;">Go to Writer Dashboard</a>
              </div>

              <p style="color: #6b7280; margin-top: 20px;">
                We're excited to have you as part of our writing community. If you have any questions or need assistance, 
                feel free to reach out to our support team.
              </p>
              `
                  : `
              <div class="info-box">
                <h3>Writer Application Status Update</h3>
                <p>
                  Thank you for your interest in becoming a writer for The Maghreb Orbit. After reviewing your application, 
                  we are unable to approve it at this time.
                </p>
                ${
                  reason
                    ? `<p style="margin-top: 15px;">
                    <strong>Reason:</strong> ${reason}
                  </p>`
                    : ""
                }
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">What's next?</h3>
              <p style="color: #6b7280;">
                You can reapply for writer status in the future. In the meantime, we encourage you to:
              </p>
              <ul class="feature-list">
                <li>Continue engaging with our content</li>
                <li>Build your writing portfolio</li>
                <li>Stay active in our community</li>
              </ul>

              <p style="color: #6b7280; margin-top: 20px;">
                If you have questions about this decision, please contact our support team.
              </p>
              `
              }

            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.</p>
              <p>
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
    const msg: any = {
      to: recipientEmail,
      from: FROM_EMAIL,
      subject: `Re: ${originalSubject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 36px;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
              letter-spacing: -1px;
            }
            .tagline {
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              margin-top: 8px;
              letter-spacing: 1px;
            }
            .content { 
              background: #ffffff; 
              padding: 40px 30px; 
            }
            .greeting {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .reply-box {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-left: 4px solid #0ea5e9;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
              box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1);
            }
            .reply-box h3 {
              color: #0369a1;
              margin-top: 0;
              font-size: 18px;
              display: flex;
              align-items: center;
            }
            .reply-box h3:before {
              content: "💬";
              margin-right: 10px;
              font-size: 20px;
            }
            .reply-content {
              color: #374151;
              line-height: 1.8;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .original-message-box {
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .original-message-box h4 {
              color: #6b7280;
              margin-top: 0;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: flex;
              align-items: center;
            }
            .original-message-box h4:before {
              content: "📝";
              margin-right: 8px;
            }
            .original-subject {
              color: #1f2937;
              font-weight: bold;
              margin: 10px 0;
            }
            .original-content {
              background: white;
              padding: 15px;
              border-radius: 6px;
              color: #6b7280;
              border-left: 3px solid #e5e7eb;
              white-space: pre-wrap;
              word-wrap: break-word;
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
              transition: transform 0.2s;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e5e7eb, transparent);
              margin: 30px 0;
            }
            .footer {
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
              margin: 15px 0;
            }
            .footer-links a {
              color: #dc2626;
              text-decoration: none;
              margin: 0 10px;
              font-size: 14px;
              font-weight: 600;
            }
            .footer-links a:hover {
              text-decoration: underline;
            }
            @media only screen and (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 8px;
              }
              .header {
                padding: 30px 20px;
              }
              .header h1 {
                font-size: 28px;
              }
              .content {
                padding: 30px 20px;
              }
              .greeting {
                font-size: 16px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>The Maghreb Orbit</h1>
              <p class="tagline">Your Trusted News Source</p>
            </div>
            
            <div class="content">
              <p class="greeting">
                Hello <strong>${recipientName}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                Thank you for reaching out to The Maghreb Orbit. We've received your message and wanted to respond to your inquiry.
              </p>

              <div class="reply-box">
                <h3>Our Response</h3>
                <div class="reply-content">${replyMessage}</div>
              </div>

              <div class="divider"></div>

              <div class="original-message-box">
                <h4>Your Original Message</h4>
                <p class="original-subject">Subject: ${originalSubject}</p>
                <div class="original-content">${originalMessage}</div>
              </div>

              <p style="color: #6b7280; margin-top: 30px;">
                If you have any additional questions or need further assistance, please don't hesitate to reach out to us again. We're here to help!
              </p>

              <div class="button-container">
                <a href="${BASE_URL}/contact" class="cta-button" style="color: #ffffff !important; text-decoration: none;">
                  Contact Us Again
                </a>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-links">
                <a href="${BASE_URL}/about">About Us</a> •
                <a href="${BASE_URL}/contact">Contact</a> •
                <a href="${BASE_URL}/privacy">Privacy Policy</a>
              </div>
              <p class="footer-text">
                <strong>The Maghreb Orbit</strong> - Your Trusted News Source
              </p>
              <p class="footer-text">
                © ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Add attachments if provided
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

    const msg = {
      to: adminEmail,
      from: FROM_EMAIL,
      subject: `📬 New Contact Form Message - ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 36px;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            }
            .badge {
              display: inline-block;
              background: rgba(255, 255, 255, 0.2);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .content { 
              background: #ffffff; 
              padding: 40px 30px; 
            }
            .notification-icon { 
              width: 80px; 
              height: 80px; 
              margin: 0 auto 20px; 
              background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%);
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 40px;
              box-shadow: 0 4px 6px rgba(14, 165, 233, 0.2);
            }
            .title {
              text-align: center;
              color: #1f2937;
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0;
            }
            .sender-box { 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 2px solid #0ea5e9;
              border-radius: 12px; 
              padding: 25px; 
              margin: 25px 0;
              box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1);
            }
            .sender-box h3 { 
              color: #0369a1; 
              margin-top: 0;
              font-size: 20px;
              display: flex;
              align-items: center;
            }
            .sender-box h3:before {
              content: "👤";
              margin-right: 10px;
              font-size: 24px;
            }
            .info-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #bae6fd;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: bold;
              color: #0c4a6e;
              width: 120px;
              flex-shrink: 0;
            }
            .info-value {
              color: #4b5563;
              word-break: break-word;
            }
            .message-box {
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .message-box h3 {
              color: #1f2937;
              margin-top: 0;
              font-size: 18px;
              display: flex;
              align-items: center;
            }
            .message-box h3:before {
              content: "💬";
              margin-right: 10px;
              font-size: 20px;
            }
            .message-content {
              background: white;
              padding: 15px;
              border-radius: 6px;
              color: #374151;
              line-height: 1.8;
              border-left: 4px solid #0ea5e9;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
              color: #ffffff !important; 
              padding: 16px 40px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold; 
              font-size: 18px; 
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(14, 165, 233, 0.4);
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .action-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .action-box p {
              margin: 8px 0;
              color: #78350f;
            }
            .action-box strong {
              color: #92400e;
            }
            .footer { 
              background-color: #f9fafb;
              text-align: center; 
              padding: 30px; 
              color: #6b7280; 
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 10px 0;
            }
            .timestamp {
              background: #f3f4f6;
              padding: 10px 15px;
              border-radius: 6px;
              margin: 20px 0;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
            .quick-reply {
              background: #dcfce7;
              border: 2px solid #16a34a;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .quick-reply h4 {
              color: #15803d;
              margin-top: 0;
              font-size: 16px;
              display: flex;
              align-items: center;
            }
            .quick-reply h4:before {
              content: "✉️";
              margin-right: 10px;
              font-size: 18px;
            }
            .quick-reply p {
              margin: 5px 0;
              color: #166534;
              font-size: 14px;
            }
            .reply-to {
              background: white;
              padding: 10px 15px;
              border-radius: 6px;
              margin-top: 10px;
              color: #0ea5e9;
              font-weight: bold;
              word-break: break-all;
            }
            @media only screen and (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 8px;
              }
              .header {
                padding: 30px 20px;
              }
              .content {
                padding: 30px 20px;
              }
              .title {
                font-size: 22px;
              }
              .info-row {
                flex-direction: column;
              }
              .info-label {
                width: 100%;
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>The Maghreb Orbit Admin</h1>
              <div class="badge">📬 New Contact Message</div>
            </div>
            
            <div class="content">
              <div class="notification-icon">💌</div>
              
              <h2 class="title">New Contact Form Submission</h2>
              
              <p style="text-align: center; color: #6b7280; font-size: 16px;">
                You have received a new message through the contact form
              </p>

              <div class="timestamp">
                📅 Received: ${new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              
              <div class="sender-box">
                <h3>Sender Information</h3>
                
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value"><strong>${senderName}</strong></div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">
                    <a href="mailto:${senderEmail}" style="color: #0ea5e9; text-decoration: none; font-weight: bold;">
                      ${senderEmail}
                    </a>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Subject:</div>
                  <div class="info-value"><strong>${subject}</strong></div>
                </div>
              </div>

              <div class="message-box">
                <h3>Message Content</h3>
                <div class="message-content">${message}</div>
              </div>

              <div class="quick-reply">
                <h4>Quick Reply</h4>
                <p>Reply directly to this message by clicking below:</p>
                <div class="reply-to">
                  <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(
        subject
      )}" style="color: #0ea5e9; text-decoration: none;">
                    📧 ${senderEmail}
                  </a>
                </div>
              </div>

              <div class="action-box">
                <p><strong>⚡ Action Options:</strong></p>
                <p>• Reply directly to <strong>${senderEmail}</strong></p>
                <p>• View full message in admin dashboard</p>
                <p>• Mark as read/resolved when handled</p>
              </div>

              <div class="button-container">
                <a href="${adminLink}" class="cta-button" style="color: #ffffff !important; text-decoration: none;">
                  📊 View in Admin Dashboard
                </a>
              </div>

              <p style="color: #6b7280; text-align: center; margin-top: 30px; font-size: 14px;">
                You can manage all contact messages in the <strong>Admin → Contact Messages</strong> section
              </p>
            </div>
            
            <div class="footer">
              <p style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">The Maghreb Orbit Contact System</p>
              <p>© ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.</p>
              <p style="margin-top: 15px;">
                This is an automated notification. You can reply directly to ${senderEmail}
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

    const msg = {
      to: adminEmail,
      from: FROM_EMAIL,
      subject: "🆕 New Writer Application - The Maghreb Orbit",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4; 
              line-height: 1.6; 
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 36px;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            }
            .badge {
              display: inline-block;
              background: rgba(255, 255, 255, 0.2);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .content { 
              background: #ffffff; 
              padding: 40px 30px; 
            }
            .notification-icon { 
              width: 80px; 
              height: 80px; 
              margin: 0 auto 20px; 
              background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 40px;
              box-shadow: 0 4px 6px rgba(124, 58, 237, 0.2);
            }
            .title {
              text-align: center;
              color: #1f2937;
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0;
            }
            .applicant-box { 
              background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
              border: 2px solid #7c3aed;
              border-radius: 12px; 
              padding: 25px; 
              margin: 25px 0;
              box-shadow: 0 2px 4px rgba(124, 58, 237, 0.1);
            }
            .applicant-box h3 { 
              color: #5b21b6; 
              margin-top: 0;
              font-size: 20px;
              display: flex;
              align-items: center;
            }
            .applicant-box h3:before {
              content: "👤";
              margin-right: 10px;
              font-size: 24px;
            }
            .info-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #e9d5ff;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: bold;
              color: #6b21a8;
              width: 120px;
              flex-shrink: 0;
            }
            .info-value {
              color: #4b5563;
              word-break: break-word;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
              color: #ffffff !important; 
              padding: 16px 40px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold; 
              font-size: 18px; 
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(124, 58, 237, 0.4);
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .action-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .action-box p {
              margin: 8px 0;
              color: #78350f;
            }
            .action-box strong {
              color: #92400e;
            }
            .footer { 
              background-color: #f9fafb;
              text-align: center; 
              padding: 30px; 
              color: #6b7280; 
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 10px 0;
            }
            .timestamp {
              background: #f3f4f6;
              padding: 10px 15px;
              border-radius: 6px;
              margin: 20px 0;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
            @media only screen and (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 8px;
              }
              .header {
                padding: 30px 20px;
              }
              .content {
                padding: 30px 20px;
              }
              .title {
                font-size: 22px;
              }
              .info-row {
                flex-direction: column;
              }
              .info-label {
                width: 100%;
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>The Maghreb Orbit Admin</h1>
              <div class="badge">🔔 New Writer Application</div>
            </div>
            
            <div class="content">
              <div class="notification-icon">✍️</div>
              
              <h2 class="title">New Writer Application Received!</h2>
              
              <p style="text-align: center; color: #6b7280; font-size: 16px;">
                A new user has applied to become a writer for The Maghreb Orbit
              </p>

              <div class="timestamp">
                📅 Received: ${new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              
              <div class="applicant-box">
                <h3>Applicant Details</h3>
                
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${
                    applicantName || "Not provided"
                  }</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Username:</div>
                  <div class="info-value">@${applicantUsername}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${applicantEmail}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">User ID:</div>
                  <div class="info-value"><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${applicantId}</code></div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Status:</div>
                  <div class="info-value">
                    <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 14px;">
                      ⏳ Pending Review
                    </span>
                  </div>
                </div>
              </div>

              <div class="action-box">
                <p><strong>⚡ Action Required:</strong></p>
                <p>• Review the applicant's profile and information</p>
                <p>• Approve or reject their writer application</p>
                <p>• The applicant will be notified of your decision via email</p>
              </div>

              <div class="button-container">
                <a href="${verifyLink}" class="cta-button" style="color: #ffffff !important; text-decoration: none;">
                  🔍 Verify Writer Application
                </a>
              </div>

              <p style="color: #6b7280; text-align: center; margin-top: 30px; font-size: 14px;">
                Click the button above to access the admin dashboard and review this application.
              </p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #1f2937; font-size: 16px;">📊 Quick Stats</h4>
                <p style="color: #6b7280; margin: 8px 0; font-size: 14px;">
                  View all pending writer applications in the <strong>Admin → Users</strong> section
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">The Maghreb Orbit Admin Panel</p>
              <p>© ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.</p>
              <p style="margin-top: 15px;">
                This is an automated notification. Do not reply to this email.
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
    const planName =
      plan === "annual" ? "Annual Digital Access" : "Monthly Digital Access";
    const billingPeriod = plan === "annual" ? "year" : "month";
    const formattedNextBilling = nextBillingDate
      ? new Date(nextBillingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Subscription Renewed - The Maghreb Orbit Newsletter 🎉",
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
            .icon-text { color: white; font-size: 48px; font-weight: bold; }
            .info-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-box h3 { color: #065f46; margin-top: 0; }
            .info-box p { color: #047857; margin: 10px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .feature-list { list-style: none; padding: 0; }
            .feature-list li { padding: 10px 0; padding-left: 30px; position: relative; }
            .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">The Maghreb Orbit</h1>
            </div>
            <div class="content">
              <div class="success-icon">
                <div class="icon-text">✓</div>
              </div>
              <h2 style="text-align: center; color: #1f2937;">
                Your Subscription Has Been Renewed!
              </h2>
              <p style="text-align: center; font-size: 18px; color: #6b7280;">
                Hello ${userName || ""}
              </p>
              
              <div class="info-box">
                <h3>Payment Successful</h3>
                <p>
                  Your <strong>${planName}</strong> subscription has been automatically renewed. Thank you for continuing your membership with us!
                </p>
                <p style="margin-top: 15px;">
                  <strong>Amount Charged:</strong> $${amount}<br>
                  ${
                    formattedNextBilling
                      ? `<strong>Next Billing Date:</strong> ${formattedNextBilling}<br>`
                      : ""
                  }
                  <strong>Billing Cycle:</strong> ${
                    plan === "annual" ? "Yearly" : "Monthly"
                  }
                </p>
              </div>

              <h3 style="color: #1f2937; margin-top: 30px;">Your Premium Benefits Continue:</h3>
              <ul class="feature-list">
                <li>Unlimited access to all premium articles</li>
                <li>Daily newsletter delivered to your inbox</li>
                <li>Ad-free reading experience</li>
                <li>Exclusive member-only content</li>
                <li>Support independent journalism</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}/settings?tab=subscription" class="button">Manage Subscription</a>
              </div>

              <p style="color: #6b7280; margin-top: 20px;">
                Your subscription will automatically renew every ${billingPeriod} unless you cancel. 
                You can manage or cancel your subscription anytime from your account settings.
              </p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1f2937;">Need Help?</h4>
                <p style="color: #6b7280; margin: 5px 0;">
                  If you have any questions about your subscription or billing, our support team is here to help.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.</p>
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

    const msg = {
      to: email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: "Your Account Has Been Deleted - The Maghreb Orbit",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Deleted</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header with gradient background -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Account Deleted</h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hello ${name},
              </p>

              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                We're writing to inform you that your The Maghreb Orbit account has been deleted by an administrator.
              </p>

              ${
                reason
                  ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>Reason:</strong> ${reason}
                </p>
              </div>
              `
                  : ""
              }

              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                  What This Means:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                  <li style="margin-bottom: 8px;">Your account and all associated data have been permanently removed</li>
                  <li style="margin-bottom: 8px;">You no longer have access to premium content or features</li>
                  <li style="margin-bottom: 8px;">Any active subscriptions have been canceled</li>
                  <li style="margin-bottom: 8px;">You will not receive any further emails from us</li>
                </ul>
              </div>

              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                If you believe this was done in error or have any questions, please contact our support team immediately.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${BASE_URL}/contact" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">
                  Contact Support
                </a>
              </div>

              <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Note:</strong> If you wish to use The Maghreb Orbit in the future, you'll need to create a new account.
                </p>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Thank you for being part of the The Maghreb Orbit community.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280; margin: 0 0 10px 0; text-align: center;">
                © ${new Date().getFullYear()} The Maghreb Orbit. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
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
    console.error("Error sending account deletion email:", error);
    return false;
  }
}
