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
    const resetLink = `${BASE_URL}/auth/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Reset Your Password - Akhbarna",
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
              <h1 class="logo">Akhbarna</h1>
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
                We received a request to reset the password for your Akhbarna account. 
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
                <strong>Akhbarna</strong> - Your Trusted News Source
              </p>
              <p class="footer-text">
                © ${new Date().getFullYear()} Akhbarna. All rights reserved.
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
      subject: "Verify Your Email - Welcome to Akhbarna!",
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
              <h1 class="logo">Akhbarna</h1>
              <p class="tagline">Your Trusted News Source</p>
            </div>
            
            <div class="email-body">
              <div class="icon-container">
                <div class="welcome-icon">✉️</div>
              </div>
              
              <h2 class="email-title">Welcome to Akhbarna!</h2>
              
              <p class="email-content">
                Hello <strong>${userName || "there"}</strong>,
              </p>
              
              <p class="email-content">
                Thank you for joining Akhbarna! We're excited to have you as part of our community. 
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
                If you didn't create an account with Akhbarna, you can safely ignore this email.
              </p>
            </div>
            
            <div class="email-footer">
              <div class="footer-links">
                <a href="${BASE_URL}/about">About Us</a> •
                <a href="${BASE_URL}/contact">Contact</a> •
                <a href="${BASE_URL}/privacy">Privacy Policy</a>
              </div>
              <p class="footer-text">
                <strong>Akhbarna</strong> - Your Trusted News Source
              </p>
              <p class="footer-text">
                © ${new Date().getFullYear()} Akhbarna. All rights reserved.
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
        ? "Writer Application Approved - Akhbarna"
        : "Writer Application Update - Akhbarna",
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
              <h1 style="margin: 0; font-size: 36px;">Akhbarna</h1>
            </div>
            <div class="content">
              <div class="${approved ? "success-icon" : "warning-icon"}">
                <div class="icon-text">${approved ? "✓" : "!"}</div>
              </div>
              <h2 style="text-align: center; color: #1f2937;">
                ${
                  approved
                    ? "Welcome to the Akhbarna Writing Team!"
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
                  You now have writer privileges on Akhbarna. You can start creating and publishing articles right away.
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
                  Thank you for your interest in becoming a writer for Akhbarna. After reviewing your application, 
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
              <p>© ${new Date().getFullYear()} Akhbarna. All rights reserved.</p>
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
      subject: "Subscription Renewed - Akhbarna Newsletter 🎉",
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
              <h1 style="margin: 0; font-size: 36px;">Akhbarna</h1>
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
    console.error("Error sending subscription renewal email:", error);
    return false;
  }
}
