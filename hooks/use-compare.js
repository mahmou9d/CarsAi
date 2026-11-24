"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "carsai_compare_vehicles";
const MAX_COMPARE = 4;

export function useCompare() {
  const [compareCars, setCompareCars] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompareCars(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load compare cars from storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Listen for storage events across tabs or components
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setCompareCars(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener("compare-updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("compare-updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const saveToStorage = useCallback((cars) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
      setCompareCars(cars);
      window.dispatchEvent(new Event("compare-updated"));
    } catch (e) {
      console.error("Failed to save compare cars", e);
    }
  }, []);

  const addToCompare = useCallback(
    (car) => {
      if (!car || !car.id) return false;

      const exists = compareCars.some((c) => c.id === car.id);
      if (exists) {
        toast.info(`${car.make} ${car.model} is already in comparison`);
        return false;
      }

      if (compareCars.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} cars at a time`);
        return false;
      }

      const minimalCar = {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: Number(car.price),
        mileage: car.mileage,
        color: car.color,
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType,
        seats: car.seats,
        images: car.images || [],
        description: car.description || "",
        status: car.status || "AVAILABLE",
      };

      const updated = [...compareCars, minimalCar];
      saveToStorage(updated);
      toast.success(`Added ${car.year} ${car.make} ${car.model} to comparison`);
      return true;
    },
    [compareCars, saveToStorage],
  );

  const removeFromCompare = useCallback(
    (carId) => {
      const carToRemove = compareCars.find((c) => c.id === carId);
      const updated = compareCars.filter((c) => c.id !== carId);
      saveToStorage(updated);
      if (carToRemove) {
        toast.info(`Removed ${carToRemove.make} ${carToRemove.model} from comparison`);
      }
    },
    [compareCars, saveToStorage],
  );

  const toggleCompare = useCallback(
    (car) => {
      if (!car || !car.id) return;
      const exists = compareCars.some((c) => c.id === car.id);
      if (exists) {
        removeFromCompare(car.id);
      } else {
        addToCompare(car);
      }
    },
    [compareCars, addToCompare, removeFromCompare],
  );

  const clearCompare = useCallback(() => {
    saveToStorage([]);
    toast.info("Cleared all cars from comparison");
  }, [saveToStorage]);

  const isInCompare = useCallback(
    (carId) => {
      return compareCars.some((c) => c.id === carId);
    },
    [compareCars],
  );

  return {
    compareCars,
    compareCount: compareCars.length,
    isInitialized,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    isInCompare,
    maxLimit: MAX_COMPARE,
  };
}

