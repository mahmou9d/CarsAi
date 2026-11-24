import { getAdmin } from "@/actions/admin";
import { getAdminTradeIns } from "@/actions/trade-in";
import { redirect } from "next/navigation";
import { TradeInList } from "./_components/trade-in-list";

export const metadata = {
  title: "Sell & Trade-In Appraisals | CarsAi Admin",
  description: "Manage customer trade-in and sell valuation requests, review offers, and update appraisal statuses",
};

export default async function AdminTradeInsPage({ searchParams }) {
  const adminCheck = await getAdmin();
  if (!adminCheck.authorized) {
    redirect("/");
  }

  const resolvedParams = await searchParams;
  const initialData = await getAdminTradeIns({
    status: resolvedParams?.status || "ALL",
    search: resolvedParams?.search || "",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sell & Trade-In Appraisals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming customer vehicle valuations, issue certified cash offers, and finalize purchases.
          </p>
        </div>
      </div>

      <TradeInList initialData={initialData?.data || []} />
    </div>
  );
}

