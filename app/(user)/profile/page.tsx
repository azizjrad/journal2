import { Metadata } from "next";
import { Suspense } from "react";
import { UserProfile } from "@/components/user/user-profile";

export const metadata: Metadata = {
  title: "Profile Settings - The Maghreb Orbit",
  description:
    "Manage your profile settings, account information, and password",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <UserProfile />
    </Suspense>
  );
}
