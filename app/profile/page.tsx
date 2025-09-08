import { Metadata } from "next";
import { UserProfile } from "@/components/user-profile";

export const metadata: Metadata = {
  title: "Profile Settings - Akhbarna",
  description:
    "Manage your profile settings, account information, and password",
};

export default function ProfilePage() {
  return <UserProfile />;
}
