import { getCars } from "@/actions/cars";
import { getAdmin } from "@/actions/admin";
import { InspectionView } from "./_components/inspection-view";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Multi-Point Inspection Studio | CarsAi Admin",
  description: "Official vehicle multi-point inspection checklist, condition scoring, and certificate generator",
};

export default async function CarInspectionPage({ searchParams }) {
  const adminCheck = await getAdmin();
  if (!adminCheck.authorized) {
    redirect("/");
  }

  const resolvedParams = await searchParams;
  const initialCarId = resolvedParams?.carId || "";

  const carsResponse = await getCars();
  const cars = carsResponse.success ? carsResponse.data : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <InspectionView cars={cars} initialCarId={initialCarId} adminUser={adminCheck.user} />
    </div>
  );
}

