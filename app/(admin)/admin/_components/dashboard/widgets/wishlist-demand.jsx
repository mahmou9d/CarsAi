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
import { Heart, Car, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

export function WishlistDemandWidget({ wishlist = {} }) {
  const { totalSaves = 0, topWishlistedCars = [] } = wishlist;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            Customer Wishlist & Saved Intent
          </CardTitle>
          <CardDescription>
            {totalSaves} total vehicles saved by registered users
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {topWishlistedCars.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-400">
            No saved vehicles recorded yet
          </div>
        ) : (
          <div className="space-y-2.5">
            {topWishlistedCars.map((car) => (
              <div
                key={car.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-8 rounded-md overflow-hidden bg-slate-100 shrink-0">
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
                        <Car className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {car.year} {car.make} {car.model}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formatCurrency(car.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
                    <Heart className="h-3 w-3 fill-rose-600" /> {car.savesCount}{" "}
                    Saves
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

