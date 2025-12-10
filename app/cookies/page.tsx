import { Metadata } from "next";
import Header from "@/components/header";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Cookie Policy - The Maghreb Orbit",
  description: "Cookie policy for The Maghreb Orbit website",
};

export default function CookiesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cookie Policy" },
  ];

  return (
    <>
      <Header categories={[]} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Cookie Policy
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  What Are Cookies
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and to provide
                  information to website owners.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  How We Use Cookies
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  The Maghreb Orbit uses cookies to enhance your browsing
                  experience, analyze site traffic, personalize content, and
                  remember your preferences. We also use cookies to gather
                  anonymous statistical information about how visitors use our
                  site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Types of Cookies We Use
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Essential Cookies
                    </h3>
                    <p className="text-gray-600">
                      These cookies are necessary for the website to function
                      properly and cannot be disabled in our systems.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-600">
                      These cookies help us understand how visitors interact
                      with our website by collecting and reporting information
                      anonymously.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Functional Cookies
                    </h3>
                    <p className="text-gray-600">
                      These cookies enable enhanced functionality and
                      personalization, such as remembering your preferences and
                      settings.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Third-Party Cookies
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We may use third-party services that place cookies on your
                  device. These services include analytics providers and social
                  media platforms. These third parties have their own privacy
                  policies governing their use of cookies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Managing Cookies
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You can control and manage cookies through your browser
                  settings. Most browsers allow you to block or delete cookies,
                  but please note that this may affect the functionality of our
                  website. You can usually find cookie controls in the
                  'Settings' or 'Preferences' menu of your browser.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Cookie Consent
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  By continuing to use our website, you consent to our use of
                  cookies as described in this policy. If you do not agree to
                  our use of cookies, you should disable them in your browser
                  settings or stop using our website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Updates to This Policy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Cookie Policy from time to time. Any
                  changes will be posted on this page with an updated revision
                  date.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about our use of cookies, please
                  contact us at{" "}
                  <a
                    href="mailto:contact@maghreborbit.com"
                    className="text-red-600 hover:text-red-700"
                  >
                    contact@maghreborbit.com
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
