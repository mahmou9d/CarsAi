"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Car as CarIcon,
  Loader2,
  ArrowLeftRight,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { toggleSavedCar } from "@/actions/car-listing";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { useCompare } from "@/hooks/use-compare";

export const CarCard = ({ car }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(car.wishlisted);
  const { isInCompare, toggleCompare } = useCompare();
  const isCompared = isInCompare(car.id);

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

  const mileageText = Number(car.mileage).toLocaleString("en-US");
  const pills = [car.transmission, car.fuelType, car.bodyType].filter(Boolean);

  const roundBtn =
    "z-10 grid size-10 place-items-center rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60";

  return (
    <article className="group relative overflow-hidden rounded-[28px] bg-[#161213] p-2 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(228,20,27,0.55)]">
      {/* Image, inset in the dark card */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-[#F3F1EC]">
        {car.images && car.images.length > 0 ? (
          <Image
            src={car.images[0]}
            alt=""
            fill
            className="object-scale-down transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CarIcon className="h-12 w-12 text-black/20" />
          </div>
        )}

        <button
          type="button"
          aria-pressed={isCompared}
          aria-label={isCompared ? "Remove from compare" : "Add to compare"}
          title={isCompared ? "Remove from compare" : "Add to compare"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCompare(car);
          }}
          className={`${roundBtn} absolute left-3 top-3 ${
            isCompared
              ? "bg-[#E4141B] text-white hover:bg-[#c81219]"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-black"
          }`}
        >
          <ArrowLeftRight size={16} />
        </button>

        <button
          type="button"
          aria-pressed={isSaved}
          aria-label={isSaved ? "Remove from saved cars" : "Save car"}
          title={isSaved ? "Remove from saved cars" : "Save car"}
          onClick={handleToggleSave}
          disabled={isToggling}
          className={`${roundBtn} absolute right-3 top-3 bg-white/90 hover:bg-white ${
            isSaved ? "text-[#E4141B]" : "text-gray-600 hover:text-black"
          }`}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} size={18} />
          )}
        </button>
      </div>

      {/* Details */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-montserrat text-xl font-[800] leading-tight tracking-tight">
              {/* Stretched link: the whole card is clickable */}
              <Link
                href={`/cars/${car.id}`}
                className="line-clamp-1 after:absolute after:inset-0 after:rounded-[28px] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#E4141B]"
              >
                {car.make} {car.model}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-white/60">
              {car.year}
              {car.color ? ` · ${car.color}` : ""}
            </p>
          </div>
          <p className="shrink-0 font-montserrat text-xl font-[800] tracking-tight text-[#E4141B]">
            ${car.price.toLocaleString()}
          </p>
        </div>

        {/* Odometer-style mileage */}
        <div className="mt-5 flex items-center gap-3">
          <div
            className="flex items-center gap-1"
            role="img"
            aria-label={`${mileageText} miles`}
          >
            {mileageText.split("").map((ch, i) =>
              ch === "," ? (
                <span
                  key={i}
                  className="px-0.5 font-mono text-sm font-bold text-white/40"
                >
                  ,
                </span>
              ) : (
                <span
                  key={i}
                  className="grid h-8 w-6 place-items-center rounded-md border border-white/10 bg-white/[0.07] font-mono text-sm font-bold"
                >
                  {ch}
                </span>
              ),
            )}
          </div>
          <span className="text-xs font-semibold text-white/50">miles</span>
        </div>

        {/* Pills + arrow */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <ul className="flex flex-wrap gap-1.5">
            {pills.map((p) => (
              <li
                key={p}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/80"
              >
                {p}
              </li>
            ))}
          </ul>
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E4141B] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </article>
  );
};
