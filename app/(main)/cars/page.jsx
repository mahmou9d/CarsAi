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
    <div className="min-h-screen bg-slate-50 mb-10">
      {/* Header Section */}
      <div className="relative border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/60 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-14">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
            Browse <span className="text-[#E4141B]">Cars</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-xl">
            Find your dream car with precise search filters and a constantly
            updated listing
          </p>
        </div>
      </div>

      {/* Body Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <CarFilters filters={filtersData.data} />
            </div>
          </aside>

          {/* Car Listings */}
          <main className="flex-1 min-w-0">
            <CarListings />
          </main>
        </div>
      </div>
    </div>
  );
}
