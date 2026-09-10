import { Plus } from "lucide-react";
import { AddCarForm } from "./_components/add-car-form";

export const metadata = {
  title: "Add New Car | CarsAi Admin",
  description: "Add a new car to the marketplace",
};

export default function AddCarPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
          <Plus className="h-5 w-5 text-red-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add New Car</h1>
          <p className="text-sm text-slate-500">
            Fill in the details below to add a new car to your marketplace
          </p>
        </div>
      </div>
      <AddCarForm />
    </div>
  );
}