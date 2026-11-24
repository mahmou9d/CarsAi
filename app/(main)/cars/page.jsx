import { CarFilters } from "./_components/car-filters";
import { getCarFilters } from "@/actions/car-listing";
import { CarListings } from "./_components/cars-listing";

export const metadata = {
  title: "Cars | CarsAi",
  description: "Browse and search for your dream car",
};

export default async function CarsPage() {
  // Fetch filters data on the server
  const filtersData = await getCarFilters();

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Title panel: dark, speed stripes, tail-light strip along the bottom */}
        <header className="relative overflow-hidden rounded-[40px] bg-[#161213] px-8 pb-14 pt-12 text-white md:px-16 md:pb-16 md:pt-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <span className="absolute -top-10 bottom-[-40px] right-[6%] w-24 -skew-x-[20deg] bg-white/[0.06] md:w-40" />
            <span className="absolute -top-10 bottom-[-40px] right-[20%] w-10 -skew-x-[20deg] bg-[#E4141B]/20 md:w-16" />
            <span className="absolute -top-10 bottom-[-40px] right-[28%] w-4 -skew-x-[20deg] bg-white/[0.06] md:w-6" />
          </div>

          <h1 className="relative font-montserrat text-6xl font-[800] leading-[0.95] tracking-tighter md:text-8xl">
            Browse cars
          </h1>
          <p className="relative mt-5 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
            Find your dream car with precise filters and a constantly updated
            listing.
          </p>

          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-1.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)] md:inset-x-16"
          />
        </header>

        {/* Body */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3">
            <CarFilters filters={filtersData?.data || {}} />
          </aside>

          <main className="min-w-0 lg:col-span-8 xl:col-span-9">
            <CarListings />
          </main>
        </div>
      </div>
    </div>
  );
}
