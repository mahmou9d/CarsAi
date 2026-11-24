import { getCarByIdAdmin } from "@/actions/cars";
import { EditCarForm } from "./_components/edit-car-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Edit Car | Admin Portal",
  description: "Update vehicle details, pricing, and images",
};

export default async function EditCarPage({ params }) {
  const { id } = await params;
  const result = await getCarByIdAdmin(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/cars">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Car</h1>
          <p className="text-sm text-muted-foreground">
            Update specifications, images, and availability for {result.data.year} {result.data.make} {result.data.model}
          </p>
        </div>
      </div>

      <EditCarForm initialCar={result.data} />
    </div>
  );
}

