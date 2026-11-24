"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Car as CarIcon,
  Loader2,
  ArrowLeftRight,
  Calendar,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleSavedCar } from "@/actions/car-listing";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { useCompare } from "@/hooks/use-compare";
import { formatCurrency } from "@/lib/helpers";

export function CarCardHorizontal({ car }) {
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
  const pills = [car.fuelType, car.transmission, car.color].filter(Boolean);
  const available = car.status === "AVAILABLE";

  const roundBtn =
    "z-10 grid size-10 place-items-center rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60";

  return (
    <article className="group overflow-hidden rounded-[28px] bg-[#161213] p-2 text-white transition-all duration-300 hover:shadow-[0_24px_50px_-18px_rgba(228,20,27,0.45)]">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* Image */}
        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-[22px] bg-[#F3F1EC] sm:h-auto sm:min-h-[220px] sm:w-72">
          {car.images && car.images.length > 0 ? (
            <Image
              src={car.images[0]}
              alt=""
              fill
              className="object-scale-down transition-transform duration-500 group-hover:scale-105"
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
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  available
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {car.status}
              </span>
              {car.bodyType && (
                <span className="text-xs text-white/50">{car.bodyType}</span>
              )}
            </div>

            <h3 className="mt-3 font-montserrat text-2xl font-[800] leading-tight tracking-tight">
              <Link
                href={`/cars/${car.id}`}
                className="line-clamp-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
              >
                {car.year} {car.make} {car.model}
              </Link>
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
              {car.description ||
                "Fully verified, tested, and certified road-ready vehicle."}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {/* Odometer-style mileage */}
            <div className="flex items-center gap-3">
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
          </div>
        </div>

        {/* Price + actions */}
        <div className="flex shrink-0 flex-col justify-between gap-5 border-t border-white/10 p-5 sm:w-56 sm:border-l sm:border-t-0">
          <div>
            <p className="text-xs font-semibold text-white/50">Selling price</p>
            <p className="mt-1 font-montserrat text-3xl font-[800] tracking-tighter text-[#E4141B]">
              {formatCurrency(car.price)}
            </p>
            <p className="mt-1 text-xs text-white/50">
              Est. {formatCurrency(car.price / 60)}/mo
            </p>
          </div>

          <div className="space-y-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 w-full gap-1.5 rounded-full border-white/20 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={`/cars/${car.id}`}>
                <Eye className="h-4 w-4" />
                Details
              </Link>
            </Button>

            {available && (
              <Button
                asChild
                size="sm"
                className="h-10 w-full gap-1.5 rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
              >
                <Link href={`/test-drive/${car.id}`}>
                  <Calendar className="h-4 w-4" />
                  Test drive
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
