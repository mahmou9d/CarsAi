"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, Gauge } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import { StatusBar } from "../ui-elements";

export function FinancialsTab({ financials, cars, priceTiers, mileageTiers }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Stock Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-700">
              {formatCurrency(financials.inventoryValuation || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {cars.available} active vehicles
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Realized Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-700">
              {formatCurrency(financials.totalSalesVolume || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {cars.sold} vehicles sold
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-purple-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-700">
              {formatCurrency(financials.avgPrice || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across active inventory
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Price Tiers Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Inventory by Price Tier
            </CardTitle>
            <CardDescription>
              Breakdown of stock across price brackets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {priceTiers.map((tier) => (
              <StatusBar
                key={tier.label}
                label={tier.label}
                value={tier.count}
                total={cars.total}
                colorClass="bg-emerald-600"
              />
            ))}
          </CardContent>
        </Card>

        {/* Mileage Tiers Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              Inventory by Mileage Bracket
            </CardTitle>
            <CardDescription>
              Odometer distribution across inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {mileageTiers.map((tier) => (
              <StatusBar
                key={tier.label}
                label={tier.label}
                value={tier.count}
                total={cars.total}
                colorClass="bg-blue-600"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

