import { Skeleton } from "@/components/ui/skeleton";

const CarListingsLoading = () => {
  return (
    <>
      <Skeleton className="h-8 w-40 mb-5 bg-red-200/60 dark:bg-red-900/40" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-red-100 dark:border-red-900/40 overflow-hidden"
            >
              <Skeleton className="h-48 w-full bg-red-200/60 dark:bg-red-900/40" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3 bg-red-200/60 dark:bg-red-900/40" />
                <Skeleton className="h-4 w-1/2 bg-red-200/50 dark:bg-red-900/30" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-4/5 bg-red-200/50 dark:bg-red-900/30" />
                  <Skeleton className="h-4 w-3/5 bg-red-200/50 dark:bg-red-900/30" />
                </div>
                <div className="pt-2 flex gap-2">
                  <Skeleton className="h-9 flex-1 bg-red-200/60 dark:bg-red-900/40" />
                  <Skeleton className="h-9 flex-1 bg-red-200/60 dark:bg-red-900/40" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default CarListingsLoading;