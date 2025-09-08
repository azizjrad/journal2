import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface PasswordResetEmailData {
  email: string;
  resetToken: string;
  userName?: string;
}

interface EmailVerificationData {
  email: string;
  verificationToken: string;
  userName?: string;
}

// Send email function using SendGrid
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In development, optionally log instead of sending
    if (
      process.env.NODE_ENV === "development" &&
      process.env.SENDGRID_DEVELOPMENT_MODE === "log"
    ) {
      console.log("📧 SendGrid Email (Development Mode):");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("HTML:", options.html);
      return true;
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.error("❌ SENDGRID_API_KEY is not configured");
      return false;
    }

    const msg = {
      to: options.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "noreply@akhbarna.com",
        name: process.env.SENDGRID_FROM_NAME || "Akhbarna News",
      },
      subject: options.subject,
      html: options.html,
      text: options.text,
      // SendGrid specific options
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false,
        },
        openTracking: {
          enable: true,
        },
      },
      // Add custom arguments for analytics
      customArgs: {
        app: "akhbarna-news",
        environment: process.env.NODE_ENV || "development",
      },
    };

    const result = await sgMail.send(msg);
    console.log("✅ SendGrid email sent successfully:", result[0].statusCode);
    return true;
  } catch (error: any) {
    console.error("❌ SendGrid email failed:", error);

    // Log SendGrid specific error details
    if (error.response?.body) {
      console.error("SendGrid Error Details:", error.response.body);
    }

    return false;
  }
}

// Enhanced password reset email template with SendGrid optimizations
export function getPasswordResetEmailTemplate(
  data: PasswordResetEmailData
): string {
  const resetUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/auth/reset-password?token=${data.resetToken}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Password Reset Request - Akhbarna News</title>
      <style>
        @media screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .content { padding: 20px !important; }
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
        }
        .header { 
          background: linear-gradient(135deg, #dc2626, #b91c1c); 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 12px 12px 0 0;
        }
        .logo { 
          color: white; 
          font-size: 28px; 
          font-weight: bold; 
          margin: 0;
          text-decoration: none;
        }
        .subtitle {
          color: #fecaca;
          font-size: 14px;
          margin: 5px 0 0 0;
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .message {
          color: #4b5563;
          margin-bottom: 15px;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .button { 
          display: inline-block; 
          padding: 16px 32px; 
          background: #dc2626; 
          color: white; 
          text-decoration: none; 
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
          transition: all 0.3s ease;
        }
        .button:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 25px 0;
          color: #92400e;
        }
        .security-note {
          background: #f3f4f6;
          border-left: 4px solid #6b7280;
          padding: 15px;
          margin: 25px 0;
          color: #374151;
          font-size: 14px;
        }
        .footer { 
          padding: 25px; 
          text-align: center; 
          color: #6b7280; 
          font-size: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-top: 20px;
        }
        .footer a {
          color: #dc2626;
          text-decoration: none;
        }
        .backup-link {
          word-break: break-all;
          font-size: 12px;
          color: #6b7280;
          margin-top: 20px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 6px;
        }
        .backup-link a {
          color: #dc2626;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
      <div class="container">
        <div class="header">
          <h1 class="logo">🛡️ Akhbarna News</h1>
          <p class="subtitle">Secure Password Reset</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello${data.userName ? ` ${data.userName}` : ""}! 👋
          </div>
          
          <div class="message">
            We received a request to reset your password for your Akhbarna News account.
          </div>
          
          <div class="message">
            If you made this request, click the button below to create a new password:
          </div>
          
          <div class="button-container">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This reset link will expire in 1 hour for security reasons.
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Notice:</strong><br>
            • If you didn't request this password reset, please ignore this email<br>
            • Never share this email or reset link with anyone<br>
            • Always verify the URL starts with your trusted domain<br>
            • Contact support if you have any concerns
          </div>
          
          <div class="backup-link">
            <strong>Button not working?</strong> Copy and paste this link into your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Akhbarna News</strong> • Trusted News Source</p>
          <p>&copy; 2025 Akhbarna News. All rights reserved.</p>
          <p>This email was sent to <strong>${data.email}</strong></p>
          <p>
            Questions? Contact us at 
            <a href="mailto:support@akhbarna.com">support@akhbarna.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enhanced email verification template
export function getEmailVerificationTemplate(
  data: EmailVerificationData
): string {
  const verifyUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/auth/verify-email?token=${data.verificationToken}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to Akhbarna News - Verify Your Email</title>
      <style>
        @media screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .content { padding: 20px !important; }
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
        }
        .header { 
          background: linear-gradient(135deg, #dc2626, #b91c1c); 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 12px 12px 0 0;
        }
        .logo { 
          color: white; 
          font-size: 28px; 
          font-weight: bold; 
          margin: 0;
        }
        .subtitle {
          color: #fecaca;
          font-size: 14px;
          margin: 5px 0 0 0;
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .welcome {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
          text-align: center;
        }
        .message {
          color: #4b5563;
          margin-bottom: 15px;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .button { 
          display: inline-block; 
          padding: 16px 32px; 
          background: #dc2626; 
          color: white; 
          text-decoration: none; 
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
        }
        .features {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .features h3 {
          color: #0c4a6e;
          margin-top: 0;
        }
        .features ul {
          color: #0c4a6e;
          margin: 0;
          padding-left: 20px;
        }
        .footer { 
          padding: 25px; 
          text-align: center; 
          color: #6b7280; 
          font-size: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-top: 20px;
        }
        .footer a {
          color: #dc2626;
          text-decoration: none;
        }
        .backup-link {
          word-break: break-all;
          font-size: 12px;
          color: #6b7280;
          margin-top: 20px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 6px;
        }
        .backup-link a {
          color: #dc2626;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
      <div class="container">
        <div class="header">
          <h1 class="logo">🛡️ Akhbarna News</h1>
          <p class="subtitle">Email Verification</p>
        </div>
        
        <div class="content">
          <div class="welcome">
            Welcome${data.userName ? `, ${data.userName}` : ""}! 🎉
          </div>
          
          <div class="message">
            Thank you for joining Akhbarna News! We're excited to have you as part of our community.
          </div>
          
          <div class="message">
            To complete your registration and activate your account, please verify your email address:
          </div>
          
          <div class="button-container">
            <a href="${verifyUrl}" class="button">Verify My Email</a>
          </div>
          
          <div class="features">
            <h3>🚀 What's next after verification?</h3>
            <ul>
              <li>Access breaking news and exclusive stories</li>
              <li>Personalize your news preferences</li>
              <li>Comment on articles and join discussions</li>
              <li>Apply to become a contributor writer</li>
              <li>Receive newsletter updates</li>
            </ul>
          </div>
          
          <div class="message" style="text-align: center; color: #f59e0b; font-weight: 600;">
            ⏰ This verification link expires in 24 hours
          </div>
          
          <div class="backup-link">
            <strong>Button not working?</strong> Copy and paste this link into your browser:<br>
            <a href="${verifyUrl}">${verifyUrl}</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Akhbarna News</strong> • Your Trusted News Source</p>
          <p>&copy; 2025 Akhbarna News. All rights reserved.</p>
          <p>This email was sent to <strong>${data.email}</strong></p>
          <p>
            Need help? Contact us at 
            <a href="mailto:support@akhbarna.com">support@akhbarna.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send password reset email using SendGrid
export async function sendPasswordResetEmail(
  data: PasswordResetEmailData
): Promise<boolean> {
  return await sendEmail({
    to: data.email,
    subject: "🔐 Password Reset Request - Akhbarna News",
    html: getPasswordResetEmailTemplate(data),
    text: `Password reset request for Akhbarna News.\n\nReset your password: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${data.resetToken}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
  });
}

// Send email verification using SendGrid
export async function sendEmailVerification(
  data: EmailVerificationData
): Promise<boolean> {
  return await sendEmail({
    to: data.email,
    subject: "✅ Welcome to Akhbarna News - Verify Your Email",
    html: getEmailVerificationTemplate(data),
    text: `Welcome to Akhbarna News!\n\nPlease verify your email address: ${process.env.NEXTAUTH_URL}/auth/verify-email?token=${data.verificationToken}\n\nThis link expires in 24 hours.`,
  });
}

// Send bulk emails (for newsletters, etc.)
export async function sendBulkEmails(
  emails: EmailOptions[]
): Promise<boolean[]> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error("❌ SENDGRID_API_KEY is not configured for bulk emails");
      return emails.map(() => false);
    }

    const messages = emails.map((email) => ({
      to: email.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "noreply@akhbarna.com",
        name: process.env.SENDGRID_FROM_NAME || "Akhbarna News",
      },
      subject: email.subject,
      html: email.html,
      text: email.text,
      customArgs: {
        app: "akhbarna-news",
        type: "bulk",
        environment: process.env.NODE_ENV || "development",
      },
    }));

    const results = await sgMail.send(messages);
    console.log(`✅ SendGrid bulk emails sent: ${results.length} emails`);
    return results.map(() => true);
  } catch (error: any) {
    console.error("❌ SendGrid bulk email failed:", error);
    return emails.map(() => false);
  }
}
