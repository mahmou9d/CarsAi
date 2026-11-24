import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserTestDrives } from "@/actions/test-drive";
import { getUserTradeIns } from "@/actions/trade-in";
import { getUserServiceBookings } from "@/actions/service-booking";
import { getAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ReservationsList } from "./_components/reservations-list";

export const metadata = {
  title: "My Activity & Requests | CarsAi",
  description: "Manage your test drives, trade-in appraisals, and service bookings",
};

export default async function ReservationsPage({ searchParams }) {
  // Check authentication on server
  const { userId } = await getAuth();
  if (!userId) {
    redirect("/sign-in?redirect=/reservations");
  }

  const resolvedParams = await searchParams;
  const activeTab = resolvedParams?.tab || "test-drives";

  // Fetch all user activity in parallel
  const [testDrivesResult, tradeInsResult, servicesResult] = await Promise.all([
    getUserTestDrives(),
    getUserTradeIns(),
    getUserServiceBookings(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 pt-24 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            My <span className="text-[#E4141B]">Activity & Requests</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Track your test drives, sell/trade-in offers, and certified vehicle care in real-time.
          </p>
        </div>

        <Link href="/track-request">
          <Button variant="outline" className="rounded-full text-xs font-semibold gap-1.5 border-black/15">
            <Search className="h-3.5 w-3.5" />
            Track by Code (كود تتبع)
          </Button>
        </Link>
      </div>

      <ReservationsList
        initialData={testDrivesResult}
        tradeInsData={tradeInsResult?.data || []}
        servicesData={servicesResult?.data || []}
        defaultTab={activeTab}
      />
    </div>
  );
}
