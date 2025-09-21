import { AdminDashboard } from "@/components/admin-dashboard";
import {
  getAllArticlesAdmin,
  getCategories,
  getCategoriesCached,
  getAnalyticsData,
} from "@/lib/db";

export default async function AdminPage() {
  let analyticsData;
  try {
    // Fetch real analytics data only - no fallback to mock data
    analyticsData = await getAnalyticsData(30);
  } catch (error) {
    console.error("Analytics data unavailable:", error);
    // Set to undefined to indicate analytics are unavailable
    analyticsData = undefined;
  }

  const [articles, categories] = await Promise.all([
    getAllArticlesAdmin(),
    getCategoriesCached(),
  ]);

  return (
    <AdminDashboard
      articles={articles as any}
      categories={categories as any}
      initialAnalytics={analyticsData}
    />
  );
}
