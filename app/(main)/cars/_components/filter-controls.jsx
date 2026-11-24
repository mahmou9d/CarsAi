"use client";

import { Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const CarFilterControls = ({
  filters,
  currentFilters,
  onFilterChange,
  onClearFilter,
}) => {
  const { make, bodyType, fuelType, transmission, priceRange } = currentFilters;

  const filterSections = [
    {
      id: "make",
      title: "Make",
      options: filters.makes.map((m) => ({ value: m, label: m })),
      currentValue: make,
      onChange: (value) => onFilterChange("make", value),
    },
    {
      id: "bodyType",
      title: "Body type",
      options: filters.bodyTypes.map((t) => ({ value: t, label: t })),
      currentValue: bodyType,
      onChange: (value) => onFilterChange("bodyType", value),
    },
    {
      id: "fuelType",
      title: "Fuel type",
      options: filters.fuelTypes.map((t) => ({ value: t, label: t })),
      currentValue: fuelType,
      onChange: (value) => onFilterChange("fuelType", value),
    },
    {
      id: "transmission",
      title: "Transmission",
      options: filters.transmissions.map((t) => ({ value: t, label: t })),
      currentValue: transmission,
      onChange: (value) => onFilterChange("transmission", value),
    },
  ];

  const fmt = (n) => `$${Number(n).toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Price range */}
      <div>
        <h4 className="text-sm font-semibold text-black">Price range</h4>
        <div className="mt-5 px-2">
          <Slider
            min={filters.priceRange.min}
            max={filters.priceRange.max}
            step={100}
            value={priceRange}
            onValueChange={(value) => onFilterChange("priceRange", value)}
            className="[&_[role=slider]]:border-[#E4141B] [&_[role=slider]]:bg-white [&_.bg-primary]:bg-[#E4141B]"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-gray-100 px-3 py-2">
            <p className="text-xs text-gray-500">Min</p>
            <p className="text-sm font-semibold text-black">
              {fmt(priceRange[0])}
            </p>
          </div>
          <div className="rounded-xl bg-gray-100 px-3 py-2">
            <p className="text-xs text-gray-500">Max</p>
            <p className="text-sm font-semibold text-black">
              {fmt(priceRange[1])}
            </p>
          </div>
        </div>
      </div>

      {/* Chip groups */}
      {filterSections.map((section) => (
        <div key={section.id}>
          <h4 className="flex items-center justify-between text-sm font-semibold text-black">
            <span>{section.title}</span>
            {section.currentValue && (
              <button
                type="button"
                className="flex items-center rounded-md text-xs font-medium text-gray-500 transition-colors hover:text-[#E4141B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
                onClick={() => onClearFilter(section.id)}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </button>
            )}
          </h4>

          <div className="custom-scrollbar mt-3 flex max-h-60 flex-wrap gap-2 overflow-y-auto pr-1">
            {section.options.map((option) => {
              const active = section.currentValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => section.onChange(active ? "" : option.value)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40 ${
                    active
                      ? "border-[#E4141B] bg-[#E4141B] text-white"
                      : "border-black/10 bg-white text-gray-700 hover:border-black/30"
                  }`}
                >
                  {option.label}
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
