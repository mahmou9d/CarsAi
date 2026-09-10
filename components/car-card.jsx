"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Car as CarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleSavedCar } from "@/actions/car-listing";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";

export const CarCard = ({ car }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(car.wishlisted);

  const {
    loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isSaved) {
      setIsSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isSaved]);

  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (isToggling) return;

    await toggleSavedCarFn(car.id);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group rounded-2xl">
      <div className="relative h-48 bg-slate-100">
        {car.images && car.images.length > 0 ? (
          <div className="relative w-full h-full">
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-scale-down group-hover:scale-105 transition duration-300"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <CarIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 shadow-sm rounded-full p-1.5 transition-colors ${
            isSaved
              ? "text-[#E4141B] hover:text-[#c81219]"
              : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} size={20} />
          )}
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
            {car.make} {car.model}
          </h3>
          <span className="text-xl font-bold text-[#E4141B]">
            ${car.price.toLocaleString()}
          </span>
        </div>

        <div className="text-slate-500 text-sm mb-3 flex items-center">
          <span>{car.year}</span>
          <span className="mx-2">•</span>
          <span>{car.transmission}</span>
          <span className="mx-2">•</span>
          <span>{car.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-200 text-slate-600">
            {car.bodyType}
          </Badge>
          <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-200 text-slate-600">
            {car.mileage.toLocaleString()} miles
          </Badge>
          <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-200 text-slate-600">
            {car.color}
          </Badge>
        </div>

        <div className="flex justify-between">
          <Button
            className="flex-1 rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
            onClick={() => {
              router.push(`/cars/${car.id}`);
            }}
          >
            View Car
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};