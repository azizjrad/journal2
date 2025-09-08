import { NextRequest, NextResponse } from "next/server";
import { getContactMessages, getContactMessageStats } from "@/lib/db";
import { getUserById } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const adminToken = request.cookies.get("admin-token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      const tokenPayload = jwt.verify(
        adminToken,
        process.env.JWT_SECRET!
      ) as any;
      const adminUser = await getUserById(tokenPayload.userId);

      if (!adminUser || adminUser.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const is_read = url.searchParams.get("is_read");
    const is_replied = url.searchParams.get("is_replied");
    const search = url.searchParams.get("search");

    // Build filters
    const filters: any = {};
    if (is_read !== null && is_read !== "") {
      filters.is_read = is_read === "true";
    }
    if (is_replied !== null && is_replied !== "") {
      filters.is_replied = is_replied === "true";
    }
    if (search) {
      filters.search = search.trim();
    }

    console.log("🔍 Fetching contact messages with filters:", {
      page,
      limit,
      filters,
    });

    // Get messages and stats
    const [messagesData, stats] = await Promise.all([
      getContactMessages(page, limit, filters),
      getContactMessageStats(),
    ]);

    console.log("✅ Contact messages fetched:", {
      count: messagesData.messages.length,
      total: messagesData.totalCount,
    });

    return NextResponse.json({
      messages: messagesData.messages,
      pagination: {
        currentPage: messagesData.currentPage,
        totalPages: messagesData.totalPages,
        totalCount: messagesData.totalCount,
        limit,
      },
      stats,
    });
  } catch (error) {
    console.error("❌ Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}
