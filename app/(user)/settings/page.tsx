"use client";

import { Suspense } from "react";
import { UserProfile } from "@/components/user/user-profile";

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <UserProfile />
    </Suspense>
  );
}
