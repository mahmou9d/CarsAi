"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart, BarChart3, Fuel, Cog } from "lucide-react";
import { StatusBar } from "../ui-elements";
import { InventoryAgingWidget } from "../widgets/inventory-aging";

export function InventoryTab({
  cars,
  inventoryAging,
  bodyTypesBreakdown = [],
  makesBreakdown = [],
  fuelBreakdown = [],
  transmissionBreakdown = [],
}) {
  const bodyColors = [
    "bg-[#E4141B]",
    "bg-blue-600",
    "bg-purple-600",
    "bg-amber-500",
    "bg-teal-600",
    "bg-pink-600",
    "bg-indigo-600",
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-200 shadow-sm text-center">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-black text-slate-900">
              {cars.total}
            </div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">
              Total Stock
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 shadow-sm text-center bg-emerald-50/30">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-black text-emerald-700">
              {cars.available}
            </div>
            <div className="text-xs text-emerald-600 mt-1 uppercase font-semibold">
              Available
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-sm text-center bg-blue-50/30">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-black text-blue-700">
              {cars.sold}
            </div>
            <div className="text-xs text-blue-600 mt-1 uppercase font-semibold">
              Sold
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 shadow-sm text-center bg-amber-50/30">
          <CardContent className="pt-5 pb-4">
            <div className="text-3xl font-black text-amber-700">
              {cars.unavailable}
            </div>
            <div className="text-xs text-amber-600 mt-1 uppercase font-semibold">
              Unavailable
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Aging Section */}
      <InventoryAgingWidget aging={inventoryAging} />

      <div className="grid gap-5 md:grid-cols-2">
        {/* Body Types */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-purple-600" />
                By Body Type
              </CardTitle>
              <CardDescription>Vehicle style distribution</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {bodyTypesBreakdown.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No body type data
              </div>
            ) : (
              <div className="space-y-3.5">
                {bodyTypesBreakdown.map((item, i) => (
                  <StatusBar
                    key={item.bodyType}
                    label={item.bodyType || "Other"}
                    value={item.count}
                    total={cars.total}
                    colorClass={bodyColors[i % bodyColors.length]}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Makes Breakdown */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#E4141B]" />
                By Manufacturer
              </CardTitle>
              <CardDescription>Top makes in your inventory</CardDescription>
            </div>
            <Link
              href="/admin/cars"
              className="text-xs text-[#E4141B] hover:underline font-medium"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {makesBreakdown.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No manufacturer data
              </div>
            ) : (
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {makesBreakdown.map((item) => (
                  <StatusBar
                    key={item.make}
                    label={item.make}
                    value={item.count}
                    total={cars.total}
                    colorClass="bg-[#E4141B]"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Powertrain: Fuel & Transmission Breakdown */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Fuel Types */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Fuel className="h-4 w-4 text-emerald-600" />
              Fuel & Energy Types
            </CardTitle>
            <CardDescription>
              Petrol, Diesel, Hybrid, and Electric vehicles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fuelBreakdown.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                No fuel data available
              </div>
            ) : (
              <div className="space-y-3">
                {fuelBreakdown.map((item) => (
                  <StatusBar
                    key={item.fuelType}
                    label={item.fuelType}
                    value={item.count}
                    total={cars.total}
                    colorClass="bg-emerald-600"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transmission Types */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Cog className="h-4 w-4 text-blue-600" />
              Transmission Types
            </CardTitle>
            <CardDescription>
              Automatic versus Manual transmissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transmissionBreakdown.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                No transmission data available
              </div>
            ) : (
              <div className="space-y-3">
                {transmissionBreakdown.map((item) => (
                  <StatusBar
                    key={item.transmission}
                    label={item.transmission}
                    value={item.count}
                    total={cars.total}
                    colorClass="bg-blue-600"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

