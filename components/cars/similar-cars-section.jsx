"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { CarCard } from "@/components/cars/car-card";

/**
 * SimilarCarsSection – fetches similar cars client-side based on bodyType/make.
 * Falls back to localStorage recently viewed if no match found.
 */
export function SimilarCarsSection({ car }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    if (!car?.id) return;

    async function fetchSimilar() {
      try {
        const params = new URLSearchParams({
          bodyType: car.bodyType || "",
          make: car.make || "",
          excludeId: car.id,
          limit: "4",
        });
        const res = await fetch(`/api/similar-cars?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.cars?.length > 0) {
            setSimilar(data.cars);
            return;
          }
        }
      } catch (e) {
        // silent
      }

      // Fallback: show nothing (parent handles recently viewed)
      setSimilar([]);
    }

    fetchSimilar();
  }, [car]);

  if (!similar.length) return null;

  return (
    <div className="mt-14 pt-8 border-t border-slate-200">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Similar <span className="text-[#E4141B]">Vehicles</span>
        </h2>
        <Link
          href={`/cars?bodyType=${encodeURIComponent(car.bodyType || "")}`}
          className="text-sm font-semibold text-[#E4141B] hover:underline flex items-center gap-1"
        >
          View all {car.bodyType}s
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similar.map((c) => (
          <CarCard key={c.id} car={c} />
        ))}
      </div>
    </div>
  );
}

