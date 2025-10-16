import { Metadata } from "next";
import Header from "@/components/header";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Terms of Service - Akhbarna",
  description: "Terms of service for Akhbarna website",
};

export default function TermsPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Terms of Service" },
  ];

  return (
    <>
      <Header categories={[]} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using Akhbarna, you accept and agree to be
                  bound by the terms and provision of this agreement. If you do
                  not agree to abide by the above, please do not use this
                  service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Use License
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Permission is granted to temporarily download one copy of the
                  materials on Akhbarna for personal, non-commercial transitory
                  viewing only. This is the grant of a license, not a transfer
                  of title.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Disclaimer
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  The materials on Akhbarna are provided on an 'as is' basis.
                  Akhbarna makes no warranties, expressed or implied, and hereby
                  disclaims and negates all other warranties including, without
                  limitation, implied warranties or conditions of
                  merchantability, fitness for a particular purpose, or
                  non-infringement of intellectual property or other violation
                  of rights.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Limitations
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  In no event shall Akhbarna or its suppliers be liable for any
                  damages (including, without limitation, damages for loss of
                  data or profit, or due to business interruption) arising out
                  of the use or inability to use the materials on Akhbarna, even
                  if Akhbarna or an authorized representative has been notified
                  orally or in writing of the possibility of such damage.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Accuracy of Materials
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  The materials appearing on Akhbarna could include technical,
                  typographical, or photographic errors. Akhbarna does not
                  warrant that any of the materials on its website are accurate,
                  complete, or current.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Modifications
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Akhbarna may revise these terms of service at any time without
                  notice. By using this website, you are agreeing to be bound by
                  the then current version of these terms of service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms of Service, please
                  contact us at{" "}
                  <a
                    href="mailto:contact@akhbarna.com"
                    className="text-red-600 hover:text-red-700"
                  >
                    contact@akhbarna.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
