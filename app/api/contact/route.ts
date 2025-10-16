import { NextRequest, NextResponse } from "next/server";
import { createContactMessage } from "@/lib/db";
import { rateLimiters, createRateLimitResponse } from "@/lib/rate-limit";
import { sendContactFormNotificationToAdmin } from "@/lib/email-sendgrid";

export async function POST(request: NextRequest) {
  // Apply rate limiting: 3 requests per hour per IP
  const rateLimitResult = rateLimiters.contact.check(request);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(
      rateLimitResult,
      "Too many contact form submissions. Please try again later."
    );
  }

  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be less than 100 characters" },
        { status: 400 }
      );
    }

    if (email.length > 254) {
      return NextResponse.json(
        { error: "Email must be less than 254 characters" },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be less than 200 characters" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message must be less than 2000 characters" },
        { status: 400 }
      );
    }

    // Create contact message
    const contactMessage = await createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    console.log("✅ Contact message created:", contactMessage._id);

    // Send admin notification email
    try {
      await sendContactFormNotificationToAdmin({
        senderName: name.trim(),
        senderEmail: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        messageId: String(contactMessage._id),
      });
      console.log("✅ Admin notification email sent for contact message:", contactMessage._id);
    } catch (emailError) {
      console.error("❌ Failed to send admin notification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message:
        "Your message has been sent successfully. We'll get back to you soon!",
      id: contactMessage._id,
    });
  } catch (error) {
    console.error("❌ Error creating contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
