import { Metadata } from "next";
import Header from "@/components/header";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Advertise with The Maghreb Orbit",
  description:
    "Advertising opportunities with The Maghreb Orbit - reach a targeted Maghreb business readership",
};

export default function AdvertisePage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Advertise with us" },
  ];

  return (
    <>
      <Header categories={[]} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Advertise with The Maghreb Orbit
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Reach a targeted Libya readership
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We offer two attractive ways for advertisers to reach a
                  targeted Libya business readership, both local and
                  international.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Weekly Email Newsletter
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Our free weekly email newsletter offers several advertising
                  opportunities. Containing news headlines, new events and
                  company listings, tenders and our blog posts, the newsletter
                  is sent out every Monday to foreign and local businesspeople,
                  government officials, consultants, researchers and other
                  institutions involved in Libya.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Website Advertising
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  In addition, our website itself also contains a number of
                  locations for advertising banners.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Flexible Advertising Options
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Advertising opportunities are available on a weekly, monthly,
                  or longer-term basis. For more information, please email us on{" "}
                  <a
                    href="mailto:contact@maghreborbit.com"
                    className="text-red-600 hover:text-red-700 underline"
                  >
                    contact@maghreborbit.com
                  </a>
                </p>
              </div>

              {/* Call to Action Section */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-red-800 mb-3">
                  Ready to Advertise?
                </h3>
                <p className="text-red-700 mb-4">
                  Contact us today to discuss your advertising needs and learn
                  more about our competitive rates and packages.
                </p>
                <a
                  href="mailto:contact@maghreborbit.com"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Contact Us
                </a>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Newsletter Reach
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Foreign and local businesspeople</li>
                    <li>• Government officials</li>
                    <li>• Consultants and researchers</li>
                    <li>• International institutions</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Content Includes
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Breaking news headlines</li>
                    <li>• Company listings and profiles</li>
                    <li>• Tender announcements</li>
                    <li>• Industry analysis and insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
