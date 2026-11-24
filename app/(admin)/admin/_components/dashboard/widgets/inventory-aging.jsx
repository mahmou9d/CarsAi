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
import { Hourglass, Clock, AlertCircle, Car, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import { StatusBar } from "../ui-elements";

export function InventoryAgingWidget({ aging = {} }) {
  const {
    avgDaysOnLot = 0,
    fresh = 0,
    normal = 0,
    aging: agingCount = 0,
    stale = 0,
    oldestStock = [],
  } = aging;

  const totalActive = fresh + normal + agingCount + stale;

  return (
    <div className="space-y-5">
      {/* Aging KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-black text-slate-900">
              {avgDaysOnLot} Days
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5 text-slate-400" />
              Average Days on Lot
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-sm bg-emerald-50/20">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-black text-emerald-700">{fresh}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">
              Fresh Arrivals (&lt;15d)
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm bg-blue-50/20">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-black text-blue-700">{normal}</div>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              Normal Turn (15-45d)
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm bg-amber-50/20">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-2xl font-black text-amber-700">
              {agingCount + stale}
            </div>
            <div className="text-xs text-amber-600 mt-1 font-medium">
              Stale Stock (&gt;45d)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Aging Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Inventory Aging Distribution
            </CardTitle>
            <CardDescription>
              Time active vehicles have been listed on showroom lot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <StatusBar
              label="Fresh Stock (< 15 days)"
              value={fresh}
              total={totalActive}
              colorClass="bg-emerald-500"
            />
            <StatusBar
              label="Standard Turn (15 - 45 days)"
              value={normal}
              total={totalActive}
              colorClass="bg-blue-500"
            />
            <StatusBar
              label="Aging Stock (45 - 90 days)"
              value={agingCount}
              total={totalActive}
              colorClass="bg-amber-500"
            />
            <StatusBar
              label="Critical / Stale (90+ days)"
              value={stale}
              total={totalActive}
              colorClass="bg-red-500"
            />
          </CardContent>
        </Card>

        {/* Oldest Inventory on Lot */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#E4141B]" />
                Longest In-Stock Vehicles
              </CardTitle>
              <CardDescription>
                Vehicles that may require price adjustments or promotions
              </CardDescription>
            </div>
            <Link
              href="/admin/cars"
              className="text-xs text-[#E4141B] hover:underline font-medium"
            >
              All cars →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {oldestStock.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No aging vehicles recorded
              </div>
            ) : (
              oldestStock.map((car) => (
                <div
                  key={car.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-9 rounded-md overflow-hidden bg-slate-100 shrink-0">
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
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        {formatCurrency(car.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 ${
                        car.daysOnLot > 45
                          ? "bg-red-50 text-red-700 border-red-200 font-semibold"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {car.daysOnLot} Days on Lot
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

