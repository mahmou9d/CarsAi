"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { Heart } from "lucide-react";

export function SavedCarsList({ initialData }) {
  const cars = initialData?.data ?? [];

  // No saved cars
  if (cars.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-lg bg-red-50">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <Heart className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No saved cars</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You haven&apos;t saved any cars yet. Browse our listings and click
          the heart icon to save cars for later.
        </p>
        <Button
          variant="default"
          className="bg-red-600 hover:bg-red-700"
          asChild
        >
          <Link href="/cars">Browse cars</Link>
        </Button>
      </div>
    );
  }

  // Display saved cars
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {cars.length} {cars.length === 1 ? "car" : "cars"} saved
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={{ ...car, wishlisted: true }} />
        ))}
      </div>
    </div>
  );
}