import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the real listing: quick-filter chips, toolbar, then a grid of dark cards.
const CarListingsLoading = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <span className="sr-only">Loading cars…</span>

      {/* Quick filter chips */}
      <div className="flex gap-2 overflow-hidden">
        {[88, 112, 112, 80, 108, 96].map((w, i) => (
          <Skeleton
            key={i}
            className="h-10 shrink-0 rounded-full bg-gray-200/70"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
        <Skeleton className="h-5 w-48 rounded-md bg-gray-200/70" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-full bg-gray-200/70" />
          <Skeleton className="h-10 w-20 rounded-full bg-gray-200/70" />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[28px] bg-[#161213] p-2">
            {/* Photo */}
            <Skeleton className="aspect-[16/10] w-full rounded-[22px] bg-white/10" />

            <div className="p-4 pb-3">
              {/* Title + price */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-6 w-2/3 rounded-md bg-white/10" />
                  <Skeleton className="h-4 w-1/3 rounded-md bg-white/10" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md bg-[#E4141B]/30" />
              </div>

              {/* Odometer tiles */}
              <div className="mt-5 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, d) => (
                  <Skeleton
                    key={d}
                    className="h-8 w-6 rounded-md bg-white/10"
                  />
                ))}
              </div>

              {/* Pills + arrow */}
              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="flex gap-1.5">
                  <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                  <Skeleton className="h-6 w-14 rounded-full bg-white/10" />
                  <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                </div>
                <Skeleton className="size-10 rounded-full bg-[#E4141B]/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarListingsLoading;
