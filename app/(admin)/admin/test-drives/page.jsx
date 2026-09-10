import { Car } from "lucide-react";
import { TestDrivesList } from "./_components/test-drive-list";

export const metadata = {
  title: "Test Drives | CarsAi Admin",
  description: "Manage test drive bookings",
};

export default function TestDrivesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-[#e7e5e1] pb-4">
        <div className="p-2.5 rounded-lg bg-[#fdecea]">
          <Car className="w-6 h-6 text-[#E4141B]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            Test Drive Management
          </h1>
          <p className="text-sm text-[#6b6b66]">
            Manage and track all test drive bookings
          </p>
        </div>
      </div>

      <TestDrivesList />
    </div>
  );
}
