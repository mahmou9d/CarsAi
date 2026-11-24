"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { CarFilterControls } from "./filter-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
];

export const CarFilters = ({ filters: filtersProp }) => {
  // Safe defaults so an empty filters object can't crash the page
  const filters = {
    makes: [],
    bodyTypes: [],
    fuelTypes: [],
    transmissions: [],
    ...filtersProp,
    priceRange: { min: 0, max: 100000, ...(filtersProp?.priceRange || {}) },
  };

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Current filter values from the URL
  const currentMake = searchParams.get("make") || "";
  const currentBodyType = searchParams.get("bodyType") || "";
  const currentFuelType = searchParams.get("fuelType") || "";
  const currentTransmission = searchParams.get("transmission") || "";
  const currentMinPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice"))
    : filters.priceRange.min;
  const currentMaxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice"))
    : filters.priceRange.max;
  const currentSortBy = searchParams.get("sortBy") || "newest";

  // Local state
  const [make, setMake] = useState(currentMake);
  const [bodyType, setBodyType] = useState(currentBodyType);
  const [fuelType, setFuelType] = useState(currentFuelType);
  const [transmission, setTransmission] = useState(currentTransmission);
  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Sync local state when the URL changes
  useEffect(() => {
    setMake(currentMake);
    setBodyType(currentBodyType);
    setFuelType(currentFuelType);
    setTransmission(currentTransmission);
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSortBy(currentSortBy);
  }, [
    currentMake,
    currentBodyType,
    currentFuelType,
    currentTransmission,
    currentMinPrice,
    currentMaxPrice,
    currentSortBy,
  ]);

  // Count active filters
  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    currentMinPrice > filters.priceRange.min ||
      currentMaxPrice < filters.priceRange.max,
  ].filter(Boolean).length;

  // Push filters to the URL. `overrides` lets a caller apply a value that
  // hasn't reached state yet (used by the sort dropdown).
  const applyFilters = useCallback(
    (overrides = {}) => {
      const next = {
        make,
        bodyType,
        fuelType,
        transmission,
        priceRange,
        sortBy,
        ...overrides,
      };
      const params = new URLSearchParams();

      if (next.make) params.set("make", next.make);
      if (next.bodyType) params.set("bodyType", next.bodyType);
      if (next.fuelType) params.set("fuelType", next.fuelType);
      if (next.transmission) params.set("transmission", next.transmission);
      if (next.priceRange[0] > filters.priceRange.min)
        params.set("minPrice", next.priceRange[0].toString());
      if (next.priceRange[1] < filters.priceRange.max)
        params.set("maxPrice", next.priceRange[1].toString());
      if (next.sortBy !== "newest") params.set("sortBy", next.sortBy);

      // Preserve search and page params if they exist
      const search = searchParams.get("search");
      const page = searchParams.get("page");
      if (search) params.set("search", search);
      if (page && page !== "1") params.set("page", page);

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      setIsSheetOpen(false);
    },
    [
      make,
      bodyType,
      fuelType,
      transmission,
      priceRange,
      sortBy,
      pathname,
      searchParams,
      router,
      filters.priceRange.min,
      filters.priceRange.max,
    ],
  );

  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case "make":
        setMake(value);
        break;
      case "bodyType":
        setBodyType(value);
        break;
      case "fuelType":
        setFuelType(value);
        break;
      case "transmission":
        setTransmission(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
    }
  };

  const handleClearFilter = (filterName) => handleFilterChange(filterName, "");

  const clearFilters = () => {
    setMake("");
    setBodyType("");
    setFuelType("");
    setTransmission("");
    setPriceRange([filters.priceRange.min, filters.priceRange.max]);
    setSortBy("newest");

    // Keep search term if it exists
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setIsSheetOpen(false);
  };

  const currentFilters = {
    make,
    bodyType,
    fuelType,
    transmission,
    priceRange,
    priceRangeMin: filters.priceRange.min,
    priceRangeMax: filters.priceRange.max,
  };

  return (
    <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-stretch lg:gap-4">
      {/* Mobile: filters sheet */}
      <div className="lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="h-11 gap-2 rounded-full bg-[#161213] px-5 font-semibold text-white hover:bg-black">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#E4141B] px-1 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full overflow-y-auto sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-montserrat text-xl font-[800] tracking-tight text-black">
                <Sliders className="h-4 w-4 text-[#E4141B]" />
                Filters
              </SheetTitle>
            </SheetHeader>

            <div className="px-4 py-6">
              <CarFilterControls
                filters={filters}
                currentFilters={currentFilters}
                onFilterChange={handleFilterChange}
                onClearFilter={handleClearFilter}
              />
            </div>

            <SheetFooter className="mt-auto flex-row gap-3 border-t border-black/10 pt-4 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-11 flex-1 rounded-full border-black/15"
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={() => applyFilters()}
                className="h-11 flex-1 rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
              >
                Show results
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sort */}
      <Select
        value={sortBy}
        onValueChange={(value) => {
          setSortBy(value);
          applyFilters({ sortBy: value });
        }}
      >
        <SelectTrigger className="h-11 w-[190px] rounded-full border-black/10 bg-white font-medium focus:ring-[#E4141B]/40 lg:w-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Desktop: filter panel */}
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between bg-[#161213] px-5 py-4 text-white">
            <h3 className="flex items-center gap-2 font-montserrat text-lg font-[800] tracking-tight">
              <Sliders className="h-4 w-4 text-[#E4141B]" />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#E4141B] px-1 text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </h3>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center rounded-md text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
              >
                <X className="mr-1 h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="p-5">
            <CarFilterControls
              filters={filters}
              currentFilters={currentFilters}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
            />
          </div>

          <div className="border-t border-black/5 p-5">
            <Button
              onClick={() => applyFilters()}
              className="h-12 w-full rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
            >
              Apply filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
