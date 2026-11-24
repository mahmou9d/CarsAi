"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/cars/car-card";
import { Heart, Plus } from "lucide-react";

export function SavedCarsList({ initialData }) {
  const cars = initialData?.data ?? [];

  // No saved cars
  if (cars.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[40px] bg-[#F3F1EC] p-8 text-center">
        <div className="flex gap-3" aria-hidden="true">
          <span className="grid h-24 w-20 place-items-center rounded-2xl bg-[#E4141B] text-white shadow-[0_12px_30px_-10px_rgba(228,20,27,0.6)]">
            <Heart className="h-8 w-8" />
          </span>
          {[0, 1].map((i) => (
            <span
              key={i}
              className="grid h-24 w-20 place-items-center rounded-2xl border-2 border-dashed border-black/20 text-black/30"
            >
              <Plus className="h-5 w-5" />
            </span>
          ))}
        </div>

        <h2 className="mt-8 font-montserrat text-3xl font-[800] tracking-tighter text-black md:text-4xl">
          No saved cars yet
        </h2>
        <p className="mt-3 max-w-md text-gray-600">
          Browse our listings and tap the heart on any car to save it for later.
        </p>
        <Button
          asChild
          className="mt-8 h-12 rounded-full bg-[#E4141B] px-8 text-base font-semibold text-white hover:bg-[#c81219]"
        >
          <Link href="/cars">Browse cars</Link>
        </Button>
      </div>
    );
  }

  // Display saved cars
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <li key={car.id}>
          <CarCard car={{ ...car, wishlisted: true }} />
        </li>
      ))}
    </ul>
  );
}
