"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Pause,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CarLightbox({
  images = [],
  initialIndex = 0,
  open,
  onClose,
  carTitle = "Vehicle",
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    },
    [open, onClose, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 360° Auto Rotation Tour
  useEffect(() => {
    let interval = null;
    if (isRotating && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isRotating, images.length]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white z-10">
        <div>
          <h3 className="font-bold text-sm sm:text-base">{carTitle}</h3>
          <span className="text-xs text-slate-400">
            Photo {currentIndex + 1} of {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {images.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRotating(!isRotating)}
              className={`rounded-full text-xs gap-1.5 bg-white/10 hover:bg-white/20 border-white/20 text-white ${
                isRotating ? "border-[#E4141B] text-[#E4141B] bg-red-950/40" : ""
              }`}
            >
              {isRotating ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause 360° Tour</span>
                </>
              ) : (
                <>
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>360° Auto Tour</span>
                </>
              )}
            </Button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Large Image View */}
      <div className="relative flex-1 my-4 flex items-center justify-center">
        {images.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + images.length) % images.length
              )
            }
            className="absolute left-2 sm:left-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-110"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="relative w-full h-full max-w-5xl max-h-[70vh]">
          <Image
            src={images[currentIndex]}
            alt={`${carTitle} photo ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % images.length)
            }
            className="absolute right-2 sm:right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-110"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsRotating(false);
            }}
            className={`relative w-16 h-12 rounded-lg overflow-hidden cursor-pointer shrink-0 transition-all ${
              idx === currentIndex
                ? "border-2 border-[#E4141B] scale-105"
                : "opacity-50 hover:opacity-100 border border-white/20"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

