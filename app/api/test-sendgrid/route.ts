import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-sendgrid";

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        {
          success: false,
          message: "Test endpoint only available in development",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Test email template
    const testEmailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">🛡️ Akhbarna News</h1>
            <p style="color: #fecaca; margin: 5px 0 0 0;">SendGrid Test Email</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1f2937;">SendGrid Integration Test ✅</h2>
            <p style="color: #4b5563;">Congratulations! Your SendGrid integration is working correctly.</p>
            
            <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #065f46; margin: 0;"><strong>✅ Test successful!</strong></p>
              <p style="color: #065f46; margin: 5px 0 0 0;">Your Akhbarna News application can now send emails through SendGrid.</p>
            </div>
            
            <h3 style="color: #1f2937;">Next Steps:</h3>
            <ul style="color: #4b5563;">
              <li>Set up domain authentication for better deliverability</li>
              <li>Configure your sender reputation</li>
              <li>Monitor email analytics in SendGrid dashboard</li>
              <li>Test password reset and email verification flows</li>
            </ul>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;"><strong>📊 SendGrid Dashboard:</strong></p>
              <p style="color: #92400e; margin: 5px 0 0 0;">Visit <a href="https://app.sendgrid.com" style="color: #dc2626;">app.sendgrid.com</a> to view email analytics and delivery reports.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>&copy; 2025 Akhbarna News • Test Email</p>
            <p>This test email was sent to: <strong>${email}</strong></p>
          </div>
        </body>
      </html>
    `;

    const emailSent = await sendEmail({
      to: email,
      subject: "🧪 SendGrid Test - Akhbarna News",
      html: testEmailHtml,
      text: `SendGrid Integration Test\n\nCongratulations! Your SendGrid integration is working correctly.\n\nThis test email was sent to: ${email}\n\nNext steps:\n- Set up domain authentication\n- Test password reset flow\n- Monitor email analytics`,
    });

    return NextResponse.json({
      success: emailSent,
      message: emailSent
        ? `Test email sent successfully to ${email}`
        : "Failed to send test email. Check your SendGrid configuration.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SendGrid test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "SendGrid test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
