"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Flame, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

export function TopDemandedInventoryCard({ cars = [] }) {
  if (!cars || cars.length === 0) return null;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#E4141B]" />
            Hot In-Demand Inventory
          </CardTitle>
          <CardDescription>
            Vehicles generating the highest booking and customer interest
          </CardDescription>
        </div>
        <Link
          href="/admin/cars"
          className="text-xs text-[#E4141B] hover:underline font-medium"
        >
          View all cars →
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {cars.map((car, index) => (
          <div
            key={car.id}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {car.image ? (
                  <Image
                    src={car.image}
                    alt={car.model}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {car.year} {car.make} {car.model}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-700 font-bold">
                    {formatCurrency(car.price)}
                  </span>
                  <span>•</span>
                  <span>{car.testDrivesCount} Drives</span>
                  <span>•</span>
                  <span>{car.inquiriesCount} Leads</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 ${
                  index === 0
                    ? "bg-red-50 text-red-700 border-red-200 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {index === 0 ? "🔥 Top Demand" : `#${index + 1} Demand`}
              </Badge>
              <Link href={`/cars/${car.id}`} target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

