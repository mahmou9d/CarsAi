"use client";

import { useCompare } from "@/hooks/use-compare";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X, ArrowLeftRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function CompareFloatingBar() {
  const { compareCars, compareCount, removeFromCompare, clearCompare, maxLimit } =
    useCompare();
  const pathname = usePathname();

  // Don't show on the comparison page itself or when empty
  if (compareCount === 0 || pathname === "/compare") {
    return null;
  }

  return (
    <aside
      aria-label="Vehicle comparison dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-700/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Info & items */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="hidden sm:flex items-center gap-2 pl-2 pr-1 border-r border-slate-700">
            <ArrowLeftRight className="h-4 w-4 text-[#E4141B]" />
            <span className="text-xs font-semibold whitespace-nowrap">
              Compare ({compareCount}/{maxLimit})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {compareCars.map((car) => (
              <div
                key={car.id}
                className="relative flex items-center gap-2 bg-slate-800/80 rounded-xl px-2 py-1.5 border border-slate-700 group shrink-0"
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-700">
                  {car.images?.[0] ? (
                    <Image
                      src={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-600" />
                  )}
                </div>
                <span className="text-xs font-medium max-w-[100px] truncate">
                  {car.make} {car.model}
                </span>
                <button
                  onClick={() => removeFromCompare(car.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-0.5 rounded-full hover:bg-slate-700"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCompare}
            className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-8 px-2"
            title="Clear all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Link href="/compare">
            <Button
              size="sm"
              className="bg-[#E4141B] hover:bg-[#c81219] text-white rounded-full text-xs h-8 px-4 font-semibold gap-1.5 shadow-md shadow-red-900/30"
            >
              <span>Compare Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

