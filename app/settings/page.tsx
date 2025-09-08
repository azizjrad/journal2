import { Metadata } from "next";
import { UserProfile } from "@/components/user-profile";

export const metadata: Metadata = {
  title: "Settings - Akhbarna",
  description: "User account settings and profile management",
};

export default function SettingsPage() {
  return <UserProfile />;
}
