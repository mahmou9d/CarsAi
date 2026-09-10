import { getUserTestDrives } from "@/actions/test-drive";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReservationsList } from "./_components/reservations-list";

export const metadata = {
  title: "My Reservations | CarsAi",
  description: "Manage your test drive reservations",
};

export default async function ReservationsPage() {
  // Check authentication on server
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/reservations");
  }

  // Fetch reservations on the server
  const reservationsResult = await getUserTestDrives();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl md:text-6xl mb-2 text-slate-900 font-extrabold tracking-tighter pr-2 pb-2 ">
        Your <span className="text-[#E4141B]">Reservations</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage your test drive bookings in one place.
      </p>
      <ReservationsList initialData={reservationsResult} />
    </div>
  );
}
