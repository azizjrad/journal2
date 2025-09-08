"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginTimeoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Optionally redirect after a few seconds
    const timer = setTimeout(() => {
      router.push("/admin"); // or wherever you want to send the user
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Login Timeout</h1>
      <p className="mb-2">Login is taking too long. Please try again later.</p>
      <p className="text-sm text-gray-400">You will be redirected shortly.</p>
    </div>
  );
}
