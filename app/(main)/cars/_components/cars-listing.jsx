"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, LayoutGrid, List, Bell } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { getCars } from "@/actions/car-listing";
import CarListingsLoading from "./car-listing-loading";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CarCard } from "@/components/cars/car-card";
import { CarCardHorizontal } from "@/components/cars/car-card-horizontal";

const chipBase =
  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40";
const chipOn = "border-[#E4141B] bg-[#E4141B] text-white";
const chipOff = "border-black/10 bg-white text-gray-700 hover:border-black/30";

export function CarListings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const limit = 6;

  // Load view mode from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("carsai_listing_view_mode");
      if (savedMode === "list" || savedMode === "grid") {
        setViewMode(savedMode);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const changeViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("carsai_listing_view_mode", mode);
    } catch (e) {
      console.error(e);
    }
  };

  const applyQuickFilter = (type, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (type === "clear") {
      router.push("/cars");
      return;
    }
    if (type === "maxPrice") {
      params.set("maxPrice", value.toString());
    } else if (type === "bodyType") {
      params.set("bodyType", value);
    } else if (type === "transmission") {
      params.set("transmission", value);
    } else if (type === "fuelType") {
      params.set("fuelType", value);
    }
    router.push(`?${params.toString()}`);
  };

  const handleSaveAlert = (e) => {
    e.preventDefault();
    if (!alertEmail.trim() || !alertEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success(
      `Search alert saved! We'll email ${alertEmail} when matching vehicles arrive.`,
    );
    setAlertOpen(false);
    setAlertEmail("");
  };

  // Extract filter values from searchParams
  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);

  // Fetch cars when filters change
  useEffect(() => {
    fetchCars({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage !== page) {
      const params = new URLSearchParams(searchParams);
      params.set("page", currentPage.toString());
      router.push(`?${params.toString()}`);
    }
  }, [currentPage, router, searchParams, page]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const getPaginationUrl = (pageNum) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    return `?${params.toString()}`;
  };

  if (loading && !result) {
    return <CarListingsLoading />;
  }

  if (error || (result && !result.success)) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cars. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!result || !result.data) {
    return null;
  }

  const { data: cars, pagination } = result;

  // No results
  if (cars.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl bg-[#F3F1EC] p-8 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-[#E4141B]">
          <Info className="h-7 w-7 text-white" />
        </span>
        <h3 className="mt-6 font-montserrat text-2xl font-[800] tracking-tight text-black">
          No cars found
        </h3>
        <p className="mt-2 max-w-md text-gray-600">
          We couldn&apos;t find any cars matching your search. Try adjusting
          your filters or search term.
        </p>
        <Button
          asChild
          className="mt-6 h-11 rounded-full bg-black px-6 font-semibold text-white hover:bg-[#E4141B]"
        >
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  // Pagination items
  const paginationItems = [];
  const visiblePageNumbers = [1];

  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(pagination.pages - 1, page + 1);
    i++
  ) {
    visiblePageNumbers.push(i);
  }
  if (pagination.pages > 1) {
    visiblePageNumbers.push(pagination.pages);
  }

  const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort(
    (a, b) => a - b,
  );

  let lastPageNumber = 0;
  uniquePageNumbers.forEach((pageNumber) => {
    if (pageNumber - lastPageNumber > 1) {
      paginationItems.push(
        <PaginationItem key={`ellipsis-${pageNumber}`}>
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    paginationItems.push(
      <PaginationItem key={pageNumber}>
        <PaginationLink
          href={getPaginationUrl(pageNumber)}
          isActive={pageNumber === page}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pageNumber);
          }}
          className={
            pageNumber === page
              ? "rounded-full border-[#E4141B] bg-[#E4141B] text-white hover:bg-[#c81219] hover:text-white"
              : "rounded-full text-gray-700 hover:bg-gray-100"
          }
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>,
    );

    lastPageNumber = pageNumber;
  });

  const quickFilters = [
    {
      label: "Under $25k",
      type: "maxPrice",
      value: 25000,
      active: maxPrice === "25000",
    },
    {
      label: "Under $50k",
      type: "maxPrice",
      value: 50000,
      active: maxPrice === "50000",
    },
    {
      label: "SUVs",
      type: "bodyType",
      value: "SUV",
      active: bodyType.toUpperCase() === "SUV",
    },
    {
      label: "Automatic",
      type: "transmission",
      value: "Automatic",
      active: transmission.toLowerCase() === "automatic",
    },
    {
      label: "Electric",
      type: "fuelType",
      value: "Electric",
      active: fuelType.toLowerCase() === "electric",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick filter chips */}
      <div className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => applyQuickFilter("clear")}
          className={`${chipBase} ${chipOff}`}
        >
          All cars
        </button>
        {quickFilters.map((q) => (
          <button
            key={q.label}
            type="button"
            aria-pressed={q.active}
            onClick={() => applyQuickFilter(q.type, q.value)}
            className={`${chipBase} ${q.active ? chipOn : chipOff}`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Toolbar: result count, alert, view toggle */}
      <div className="flex flex-col items-start justify-between gap-3 border-b border-black/10 pb-4 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-black">
            {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-black">{pagination.total}</span>{" "}
          vehicles
        </p>

        <div className="flex items-center gap-2">
          {/* Search alert dialog */}
          <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-1.5 rounded-full border-black/10 px-4 text-sm font-semibold text-gray-700 hover:border-[#E4141B] hover:text-[#E4141B]"
              >
                <Bell className="h-4 w-4" />
                Save alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSaveAlert}>
                <DialogHeader>
                  <DialogTitle className="font-montserrat text-xl font-[800] tracking-tight">
                    Create search alert
                  </DialogTitle>
                  <DialogDescription>
                    We&apos;ll email you when new vehicles matching your current
                    search are added.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="alert-em">Your email address</Label>
                    <Input
                      id="alert-em"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 rounded-2xl bg-[#F3F1EC] p-4 text-sm text-gray-700">
                    <span className="block font-semibold text-black">
                      Current criteria
                    </span>
                    <div>Make: {make || "Any"}</div>
                    <div>Body: {bodyType || "Any"}</div>
                    <div>
                      Budget: Up to{" "}
                      {maxPrice < Number.MAX_SAFE_INTEGER
                        ? `$${Number(maxPrice).toLocaleString()}`
                        : "Any"}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setAlertOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
                  >
                    Set alert
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* View toggle */}
          <div
            role="group"
            aria-label="View mode"
            className="flex items-center rounded-full bg-gray-100 p-1"
          >
            {[
              { mode: "grid", Icon: LayoutGrid, label: "Grid view" },
              { mode: "list", Icon: List, label: "List view" },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                type="button"
                aria-label={label}
                aria-pressed={viewMode === mode}
                onClick={() => changeViewMode(mode)}
                className={`grid size-8 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40 ${
                  viewMode === mode
                    ? "bg-[#161213] text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <CarCardHorizontal key={car.id} car={car} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={getPaginationUrl(page - 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
                }}
                className={
                  page <= 1
                    ? "pointer-events-none rounded-full opacity-50"
                    : "rounded-full text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>

            {paginationItems}

            <PaginationItem>
              <PaginationNext
                href={getPaginationUrl(page + 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page < pagination.pages) handlePageChange(page + 1);
                }}
                className={
                  page >= pagination.pages
                    ? "pointer-events-none rounded-full opacity-50"
                    : "rounded-full text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
