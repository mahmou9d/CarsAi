"use client";

import { useCompare } from "@/hooks/use-compare";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Car as CarIcon,
  Calendar,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/helpers";
import { useState } from "react";

export default function ComparePage() {
  const {
    compareCars,
    compareCount,
    removeFromCompare,
    clearCompare,
    maxLimit,
  } = useCompare();
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  // ---------- Empty state ----------
  if (compareCount === 0) {
    return (
      <div className="px-4 pb-20 pt-28 md:px-6">
        <div className="mx-auto flex min-h-[420px] max-w-6xl flex-col items-center justify-center rounded-[40px] bg-[#F3F1EC] p-8 text-center">
          <div className="flex gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="grid h-20 w-16 place-items-center rounded-2xl border-2 border-dashed border-black/20 text-black/30"
              >
                {i === 0 ? (
                  <CarIcon className="h-6 w-6" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </span>
            ))}
          </div>
          <h1 className="mt-8 font-montserrat text-4xl font-[800] tracking-tighter text-black md:text-5xl">
            Nothing to compare yet
          </h1>
          <p className="mt-3 max-w-md text-gray-600">
            Browse our cars and tap &quot;Compare&quot; on any listing to see
            them side by side.
          </p>
          <Button
            asChild
            className="mt-8 h-12 rounded-full bg-[#E4141B] px-8 text-base font-semibold text-white hover:bg-[#c81219]"
          >
            <Link href="/cars">Browse all cars</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Helpers ----------
  const hasDifference = (key) => {
    if (compareCars.length < 2) return false;
    const firstVal = compareCars[0][key];
    return compareCars.some((c) => c[key] !== firstVal);
  };

  // `best`: which direction wins. `bar`: draw a proportional bar under the value.
  const specRows = [
    { label: "Make", key: "make" },
    { label: "Model", key: "model" },
    { label: "Year", key: "year", best: "high" },
    {
      label: "Price",
      key: "price",
      format: (val) => formatCurrency(val),
      best: "low",
      bar: true,
    },
    {
      label: "Estimated EMI",
      key: "price",
      format: (val) => `${formatCurrency(val / 60)} / mo`,
    },
    {
      label: "Mileage",
      key: "mileage",
      format: (val) => `${Number(val).toLocaleString()} miles`,
      best: "low",
      bar: true,
    },
    { label: "Body type", key: "bodyType" },
    { label: "Fuel type", key: "fuelType" },
    { label: "Transmission", key: "transmission" },
    { label: "Color", key: "color" },
    { label: "Seats", key: "seats", format: (val) => val || "N/A" },
    { label: "Status", key: "status" },
  ];

  const nums = (key) =>
    compareCars.map((c) => Number(c[key])).filter((n) => Number.isFinite(n));

  // Always render maxLimit columns so the cards row and the table rows line up
  const gridStyle = {
    gridTemplateColumns: `160px repeat(${maxLimit}, minmax(220px, 1fr))`,
  };
  const emptySlots = Math.max(0, maxLimit - compareCars.length);

  return (
    <div className="px-4 pb-20 pt-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Title panel */}
        <header className="relative overflow-hidden rounded-[40px] bg-[#161213] px-8 pb-14 pt-10 text-white md:px-14 md:pb-16 md:pt-12">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <span className="absolute -top-10 bottom-[-40px] right-[6%] w-24 -skew-x-[20deg] bg-white/[0.06] md:w-40" />
            <span className="absolute -top-10 bottom-[-40px] right-[20%] w-10 -skew-x-[20deg] bg-[#E4141B]/20 md:w-16" />
          </div>

          <Link
            href="/cars"
            className="relative inline-flex items-center gap-1.5 rounded-md text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cars
          </Link>

          <div className="relative mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-montserrat text-5xl font-[800] leading-[0.95] tracking-tighter md:text-7xl">
                Compare cars
              </h1>
              <p className="mt-4 text-white/70">
                {compareCount} of {maxLimit} cars side by side.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {compareCount > 1 && (
                <button
                  type="button"
                  onClick={() => setHighlightDifferences(!highlightDifferences)}
                  aria-pressed={highlightDifferences}
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 ${
                    highlightDifferences
                      ? "border-white bg-white text-[#161213]"
                      : "border-white/25 text-white hover:bg-white/10"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  {highlightDifferences
                    ? "Showing differences"
                    : "Highlight differences"}
                </button>
              )}

              {compareCount < maxLimit && (
                <Link
                  href="/cars"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
                >
                  <Plus className="h-4 w-4" />
                  Add a car
                </Link>
              )}

              <button
                type="button"
                onClick={clearCompare}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-1.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)] md:inset-x-14"
          />
        </header>

        {/* Comparison */}
        <div className="mt-10 overflow-x-auto pb-6">
          <div className="min-w-[760px]">
            {/* Cars row */}
            <div className="grid items-stretch gap-4" style={gridStyle}>
              <div />

              {compareCars.map((car) => (
                <article
                  key={car.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]"
                >
                  <button
                    type="button"
                    onClick={() => removeFromCompare(car.id)}
                    aria-label={`Remove ${car.make} ${car.model} from comparison`}
                    className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-[#E4141B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F3F1EC]">
                      {car.images?.[0] ? (
                        <Image
                          src={car.images[0]}
                          alt={`${car.make} ${car.model}`}
                          fill
                          className="object-scale-down"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-black/20">
                          <CarIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 p-5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          car.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {car.status}
                      </span>
                      <h3 className="line-clamp-1 font-montserrat text-lg font-[800] tracking-tight text-black">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="font-montserrat text-2xl font-[800] tracking-tight text-[#E4141B]">
                        {formatCurrency(car.price)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 p-5 pt-0">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-10 w-full gap-1.5 rounded-full border-black/15 font-semibold"
                    >
                      <Link href={`/cars/${car.id}`}>
                        <Eye className="h-4 w-4" />
                        View details
                      </Link>
                    </Button>

                    {car.status === "AVAILABLE" && (
                      <Button
                        asChild
                        size="sm"
                        className="h-10 w-full gap-1.5 rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
                      >
                        <Link href={`/test-drive/${car.id}`}>
                          <Calendar className="h-4 w-4" />
                          Book test drive
                        </Link>
                      </Button>
                    )}
                  </div>
                </article>
              ))}

              {Array.from({ length: emptySlots }).map((_, i) => (
                <Link
                  key={`slot-${i}`}
                  href="/cars"
                  className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/15 p-6 text-center transition-colors hover:border-[#E4141B] hover:bg-[#E4141B]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-gray-100 text-gray-500 transition-colors group-hover:bg-[#E4141B] group-hover:text-white">
                    <Plus className="h-6 w-6" />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-gray-800">
                    Add a car
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    Choose from the lot
                  </span>
                </Link>
              ))}
            </div>

            {/* Spec table */}
            <div className="mt-6 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
              {specRows.map((spec) => {
                const differs = hasDifference(spec.key);
                const shaded = highlightDifferences && differs;
                const values = spec.best || spec.bar ? nums(spec.key) : [];
                const bestVal =
                  spec.best && differs && values.length > 1
                    ? spec.best === "low"
                      ? Math.min(...values)
                      : Math.max(...values)
                    : null;
                const maxVal = values.length ? Math.max(...values) : 0;

                return (
                  <div
                    key={spec.label}
                    className={`grid items-center gap-4 border-b border-black/5 px-4 py-4 last:border-b-0 transition-colors ${
                      shaded ? "bg-[#E4141B]/[0.05]" : "hover:bg-gray-50"
                    }`}
                    style={gridStyle}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                      {shaded && (
                        <span
                          aria-hidden
                          className="size-1.5 rounded-full bg-[#E4141B]"
                        />
                      )}
                      {spec.label}
                    </div>

                    {compareCars.map((car) => {
                      const rawVal = car[spec.key];
                      const displayVal = spec.format
                        ? spec.format(rawVal)
                        : rawVal || "—";
                      const num = Number(rawVal);
                      const isBest = bestVal !== null && num === bestVal;

                      return (
                        <div key={car.id} className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm ${
                                spec.key === "price"
                                  ? "font-bold text-[#E4141B]"
                                  : "font-medium text-gray-900"
                              }`}
                            >
                              {displayVal}
                            </span>
                            {isBest && (
                              <span className="rounded-full bg-[#161213] px-2 py-0.5 text-[11px] font-semibold text-white">
                                Best
                              </span>
                            )}
                          </div>

                          {spec.bar &&
                            maxVal > 0 &&
                            Number.isFinite(num) &&
                            compareCars.length > 1 && (
                              <div
                                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                                aria-hidden="true"
                              >
                                <div
                                  className={`h-full rounded-full ${isBest ? "bg-[#E4141B]" : "bg-gray-300"}`}
                                  style={{
                                    width: `${Math.max(6, (num / maxVal) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                        </div>
                      );
                    })}

                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <div key={`e-${i}`} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
