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
    <>
      {/* White navbar with centered Akhbarna logo */}
      <nav className="w-full bg-white border-b border-gray-200 py-4 flex items-center justify-center">
        <Link href="/" className="block">
          <div className="text-4xl font-black text-red-700 tracking-tight hover:text-red-800 transition-colors duration-300 text-center">
            Akhbarna
          </div>
        </Link>
      </nav>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-10 text-center">
          {/* Success Icon */}
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-green-400 animate-ping opacity-20"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Subscription Successful!
          </h1>

          <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">
            Thank you for subscribing to Akhbarna Newsletter. You now have full
            access to our premium content and will receive our newsletters.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-green-800 font-medium">
              A confirmation email has been sent to your registered email
              address.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-xl transition-all duration-300">
                Go to Homepage
              </Button>
            </Link>

            <Link href="/settings?tab=subscription" className="block">
              <Button
                variant="outline"
                className="w-full py-4 text-lg font-semibold border-2 border-gray-300 hover:border-red-600 hover:text-red-600 rounded-xl transition-all duration-300"
              >
                Manage Subscription
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
