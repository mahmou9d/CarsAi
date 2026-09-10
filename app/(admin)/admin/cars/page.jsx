import { Car } from "lucide-react";
import { CarsList } from "./_components/car-list";

export const metadata = {
  title: "Cars | CarsAi Admin",
  description: "Manage cars in your marketplace",
};

export default function CarsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
          <Car className="h-5 w-5 text-red-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cars Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage, add, and edit the cars in your marketplace
          </p>
        </div>
      </div>
      <CarsList />
    </div>
  );
}