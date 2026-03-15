"use client";

import { AdminSessionGuard } from "@/components/admin/admin-session-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminSessionGuard>{children}</AdminSessionGuard>;
}
