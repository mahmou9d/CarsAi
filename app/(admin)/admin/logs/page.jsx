import { getActivityLogs, getAdmin } from "@/actions/admin";
import { LogsView } from "./_components/logs-view";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Activity Stream & Audit Trail | CarsAi Admin",
  description: "Real-time dealership system logs, status updates, and audit trails",
};

export default async function LogsPage() {
  const adminCheck = await getAdmin();
  if (!adminCheck.authorized) {
    redirect("/");
  }

  const logsResult = await getActivityLogs();

  if (!logsResult.success) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Activity Logs</AlertTitle>
          <AlertDescription>
            {logsResult.error || "Failed to load dealership activity logs."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <LogsView initialEvents={logsResult.data} />
    </div>
  );
}

