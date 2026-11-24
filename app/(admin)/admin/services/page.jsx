import { getAdmin } from "@/actions/admin";
import { getAdminServiceBookings } from "@/actions/service-booking";
import { redirect } from "next/navigation";
import { ServicesList } from "./_components/services-list";

export const metadata = {
  title: "Service & Maintenance Appointments | CarsAi Admin",
  description: "Manage workshop service appointments, assign certified technicians, and update vehicle maintenance progress",
};

export default async function AdminServicesPage({ searchParams }) {
  const adminCheck = await getAdmin();
  if (!adminCheck.authorized) {
    redirect("/");
  }

  const resolvedParams = await searchParams;
  const initialData = await getAdminServiceBookings({
    status: resolvedParams?.status || "ALL",
    search: resolvedParams?.search || "",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Certified Vehicle Care & Workshop Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage service bays, assign technicians, update multi-point inspection stages, and notify customers when vehicles are ready.
          </p>
        </div>
      </div>

      <ServicesList initialData={initialData?.data || []} />
    </div>
  );
}

