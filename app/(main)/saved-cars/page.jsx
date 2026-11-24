import { getSavedCars } from "@/actions/car-listing";
import { SavedCarsList } from "./_components/saved-cars-list";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Saved Cars | CarsAi",
  description: "View your saved cars and favorites",
};

export default async function SavedCarsPage() {
  // Check authentication on server
  const { userId } = await getAuth();
  if (!userId) {
    redirect("/sign-in?redirect=/saved-cars");
  }

  // Fetch saved cars on the server
  const savedCarsResult = await getSavedCars();
  const count = savedCarsResult?.data?.length ?? 0;

  return (
    <div className="px-4 pb-20 pt-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Title panel with the saved count as a big readout */}
        <header className="relative overflow-hidden rounded-[40px] bg-[#161213] px-8 pb-14 pt-12 text-white md:px-14 md:pb-16 md:pt-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <span className="absolute -top-10 bottom-[-40px] right-[6%] w-24 -skew-x-[20deg] bg-white/[0.06] md:w-40" />
            <span className="absolute -top-10 bottom-[-40px] right-[20%] w-10 -skew-x-[20deg] bg-[#E4141B]/20 md:w-16" />
          </div>

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="font-montserrat text-5xl font-[800] leading-[0.95] tracking-tighter md:text-7xl">
                Saved cars
              </h1>
              <p className="mt-5 max-w-md text-white/70 md:text-lg">
                Keep track of the cars you&apos;re interested in.
              </p>
            </div>

            <div className="md:text-right">
              <p className="font-montserrat text-7xl font-[800] leading-none tracking-tighter md:text-8xl">
                {count}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/60">
                {count === 1 ? "car saved" : "cars saved"}
              </p>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-1.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)] md:inset-x-14"
          />
        </header>

        <div className="mt-10">
          <SavedCarsList initialData={savedCarsResult} />
        </div>
      </div>
    </div>
  );
}
