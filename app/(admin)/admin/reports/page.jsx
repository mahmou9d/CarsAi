import { getReportsData } from "@/actions/admin";
import { ReportsView } from "./_components/reports-view";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Reports & Financial Analytics | CarsAi Admin",
  description: "Executive dealership reports, financial valuations, and sales conversion metrics",
};

export default async function ReportsPage() {
  const reportsResult = await getReportsData();

  if (!reportsResult.success) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Reports</AlertTitle>
          <AlertDescription>
            {reportsResult.error || "Failed to load dealership reports."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <ReportsView data={reportsResult.data} />
    </div>
  );
}

