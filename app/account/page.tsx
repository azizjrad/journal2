import { Metadata } from "next";
import Header from "@/components/header";
import { Breadcrumb } from "@/components/breadcrumb";
import Link from "next/link";
import { User, Settings, Key, Shield, Edit, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Account - Akhbarna",
  description: "Manage your account settings and preferences",
};

export default function AccountPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Account" }];

  return (
    <>
      <Header categories={[]} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Account Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your account settings, profile information, and security
              preferences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Settings Card */}
            <Link href="/profile">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-red-300 group cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                    <Settings className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Profile Settings
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Update your personal information, bio, social links, and
                  display preferences
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Personal Information</li>
                  <li>• Bio & Display Name</li>
                  <li>• Social Media Links</li>
                  <li>• Contact Information</li>
                </ul>
                <div className="mt-6 text-red-600 font-semibold flex items-center">
                  Manage Profile
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Security Settings Card */}
            <Link href="/profile">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 group cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                    <Key className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Security Settings
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Manage your password, security preferences, and account
                  protection
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Change Password</li>
                  <li>• Account Security</li>
                  <li>• Login Activity</li>
                  <li>• Privacy Controls</li>
                </ul>
                <div className="mt-6 text-blue-600 font-semibold flex items-center">
                  Security Options
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors group"
              >
                <Settings className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-700 group-hover:text-red-700">
                  Edit Profile
                </span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <Key className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700 group-hover:text-blue-700">
                  Change Password
                </span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group"
              >
                <Mail className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700 group-hover:text-green-700">
                  Contact Support
                </span>
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
