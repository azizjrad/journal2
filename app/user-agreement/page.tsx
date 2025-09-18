import { Metadata } from "next";
import Header from "@/components/header";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "User Agreement - Akhbarna",
  description: "User agreement for Akhbarna website",
};

export default function UserAgreementPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "User Agreement" },
  ];

  return (
    <>
      <Header categories={[]} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              User Agreement
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using Akhbarna, you agree to be bound by this
                  User Agreement and all applicable laws and regulations. If you
                  do not agree with any of these terms, you are prohibited from
                  using or accessing this site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Use of Service
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to use Akhbarna only for lawful purposes and in a
                  way that does not infringe the rights of, restrict, or inhibit
                  anyone else's use and enjoyment of the site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Account Registration
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You may be required to create an account to access certain
                  features. You are responsible for maintaining the
                  confidentiality of your account information and for all
                  activities that occur under your account.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Intellectual Property
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  All content on Akhbarna, including text, graphics, logos, and
                  images, is the property of Akhbarna or its licensors and is
                  protected by copyright and other intellectual property laws.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Termination
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to suspend or terminate your access to
                  Akhbarna at any time, without notice, for conduct that we
                  believe violates this User Agreement or is harmful to other
                  users of the site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Changes to Agreement
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Akhbarna may revise this User Agreement at any time without
                  notice. By using this site, you agree to be bound by the
                  then-current version of the agreement.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this User Agreement, please
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
