import { Cog } from "lucide-react";
import { SettingsForm } from "./_components/settings-form";

export const metadata = {
  title: "Settings | CarsAi Admin",
  description: "Manage dealership working hours and admin users",
};

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-x-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
          <Cog className="h-5 w-5 text-red-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage dealership working hours and admin users
          </p>
        </div>
      </div>
      <SettingsForm />
    </div>
  );
}