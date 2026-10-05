import mongoose from "mongoose";
import { requireEnv } from "@/lib/config/env";

export async function dbConnect() {
  const MONGODB_URI = requireEnv("MONGODB_URI");

  if ((global as any).mongoose?.conn) {
    if (mongoose.connection.readyState === 1) {
      return (global as any).mongoose.conn;
    }
    (global as any).mongoose = { conn: null, promise: null };
  }

  if (!(global as any).mongoose) {
    (global as any).mongoose = { conn: null, promise: null };
  }

  if (!(global as any).mongoose.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: process.env.NODE_ENV === "production" ? 5 : 5,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      w: "majority" as const,
      connectTimeoutMS: 10000,
      compressors: ["zlib" as const],
      autoIndex: process.env.NODE_ENV !== "production",
    };

    (global as any).mongoose.promise = mongoose
      .connect(MONGODB_URI, options)
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        (global as any).mongoose.promise = null;
        throw err;
      });
  }

  try {
    (global as any).mongoose.conn = await (global as any).mongoose.promise;
    console.log("✅ Connected to MongoDB Atlas successfully");
    return (global as any).mongoose.conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    (global as any).mongoose = { conn: null, promise: null };
    throw error;
  }
}
