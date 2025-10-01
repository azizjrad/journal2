import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Subscription Successful - Akhbarna",
  description: "Your newsletter subscription was successful",
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to Akhbarna Newsletter. You now have full access to our premium content and will receive our newsletters.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              Go to Homepage
            </Button>
          </Link>
          
          <Link href="/newsletter" className="block">
            <Button variant="outline" className="w-full border-gray-300">
              Manage Subscription
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
