import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    const connectionState = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return NextResponse.json({
      success: true,
      message: "Database connection test",
      connectionState: states[connectionState] || "unknown",
      databaseName: mongoose.connection.name || "Not available",
      host: mongoose.connection.host || "Not available",
    });
  } catch (error: any) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
        code: error.code || "UNKNOWN",
      },
      { status: 500 }
    );
  }
}
