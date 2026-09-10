import { getDashboardData } from "@/actions/admin";
import { Dashboard } from "./_components/dashboard";

export const metadata = {
  title: "Dashboard | CarsAi Admin",
  description: "Admin dashboard for CarsAi car marketplace",
};

export default async function AdminDashboardPage() {
  // Fetch dashboard data
  const dashboardData = await getDashboardData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {dashboardData?.success ? (
        <Dashboard initialData={dashboardData} />
      ) : (
        <p className="text-red-600 text-sm">
          {dashboardData?.error || "Failed to load dashboard data. Please try again."}
        </p>
      )}
    </div>
  );
}