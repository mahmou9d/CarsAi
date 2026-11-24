"use client";

import { useState, useEffect, useCallback } from "react";

const RECENTLY_VIEWED_KEY = "carsai_recently_viewed_cars";
const MAX_RECENT = 6;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recently viewed cars", e);
    }
  }, []);

  const addCarToRecent = useCallback((car) => {
    if (!car || !car.id) return;

    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let current = stored ? JSON.parse(stored) : [];

      // Filter out this car if already present to put it at the front
      current = current.filter((c) => c.id !== car.id);

      const minimal = {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: Number(car.price),
        mileage: car.mileage,
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType,
        color: car.color,
        images: car.images || [],
        viewedAt: Date.now(),
      };

      const updated = [minimal, ...current].slice(0, MAX_RECENT);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch (e) {
      console.error("Failed to save recently viewed car", e);
    }
  }, []);

  return {
    recentlyViewed,
    addCarToRecent,
  };
}

