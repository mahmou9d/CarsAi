"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Car,
  Gauge,
  Printer,
  Download,
  Filter,
  Users,
  CalendarCheck,
  CheckCircle2,
  Layers,
  Fuel,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ReportsView({ data }) {
  const { financials, brandStats, bodyTypeStats, fuelTypeStats, priceTiers, funnel } = data;
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("ALL");

  const exportCSV = () => {
    try {
      const rows = [
        ["Dealership Executive Performance Report"],
        ["Generated", new Date().toLocaleString()],
        [],
        ["FINANCIAL SUMMARY"],
        ["Active Inventory Valuation", `$${financials.activeInventoryValue.toLocaleString()}`],
        ["Realized Sold Revenue", `$${financials.realizedSoldRevenue.toLocaleString()}`],
        ["Average Vehicle Price", `$${financials.averageVehiclePrice.toLocaleString()}`],
        ["Average Mileage", `${financials.averageMileage.toLocaleString()} km`],
        ["Available Vehicles", financials.availableCount],
        ["Sold Vehicles", financials.soldCount],
        ["Unavailable Units", financials.unavailableCount],
        [],
        ["SALES FUNNEL"],
        ["Inquiries (Leads)", funnel.totalInquiries],
        ["Test Drives Scheduled", funnel.totalBookings],
        ["Completed Drives", funnel.completedBookings],
        ["Units Sold", funnel.totalSold],
        ["Lead to Booking Rate", `${funnel.leadToBookingRate}%`],
        ["Drive to Sale Rate", `${funnel.bookingToSaleRate}%`],
        [],
        ["BRAND PERFORMANCE MATRIX"],
        ["Make", "Total Units", "Available", "Sold", "Total Value ($)", "Avg Price ($)"],
        ...brandStats.map((b) => [
          b.make,
          b.totalUnits,
          b.availableUnits,
          b.soldUnits,
          b.totalValue,
          b.avgPrice,
        ]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Dealership_Executive_Report_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Executive CSV report downloaded successfully!");
    } catch (e) {
      toast.error("Failed to export report CSV");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredBrands =
    selectedBrandFilter === "ALL"
      ? brandStats
      : brandStats.filter((b) => b.make === selectedBrandFilter);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-[#E4141B]" />
            Financial & Sales Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time dealership portfolio valuation, conversion funnels, and brand profitability breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button
            onClick={exportCSV}
            size="sm"
            className="flex items-center gap-1.5 bg-[#E4141B] hover:bg-red-700 text-white shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Inventory Capital
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${financials.activeInventoryValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">{financials.availableCount}</span> units currently ready for sale
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Realized Sold Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${financials.realizedSoldRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-blue-600">{financials.soldCount}</span> completed vehicle sales
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Vehicle Price
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Car className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${financials.averageVehiclePrice.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across active showroom inventory
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Odometer
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Gauge className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {financials.averageMileage.toLocaleString()} <span className="text-sm font-normal text-slate-500">km</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Average mileage of listed inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales & Conversion Funnel */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-[#E4141B]" />
                Customer Acquisition & Sales Conversion Funnel
              </CardTitle>
              <CardDescription>
                Pipeline progression from initial customer leads through scheduled test drives to finalized sales.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step 1: Leads</span>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">{funnel.totalInquiries}</div>
                <p className="text-xs text-slate-500 mt-0.5">Total Inquiries Received</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
                100% of pipeline entries
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Step 2: Booked</span>
                  <CalendarCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-900">{funnel.totalBookings}</div>
                <p className="text-xs text-blue-700 mt-0.5">Test Drives Scheduled</p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200 text-xs text-blue-800 font-medium">
                {funnel.leadToBookingRate}% Inquiry-to-Drive Rate
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Step 3: Driven</span>
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-purple-900">{funnel.completedBookings}</div>
                <p className="text-xs text-purple-700 mt-0.5">Test Drives Completed</p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-200 text-xs text-purple-800 font-medium">
                {funnel.totalBookings > 0
                  ? Math.round((funnel.completedBookings / funnel.totalBookings) * 100)
                  : 0}
                % Completion Rate
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Step 4: Sold</span>
                  <Award className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-900">{funnel.totalSold}</div>
                <p className="text-xs text-emerald-700 mt-0.5">Vehicles Successfully Sold</p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200 text-xs text-emerald-800 font-medium">
                {funnel.bookingToSaleRate}% Drive-to-Sale Conversion
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Breakdown by Price Tiers */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Inventory Capital by Price Tier
          </CardTitle>
          <CardDescription>
            Categorized distribution of active showroom stock across price brackets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {priceTiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {tier.label}
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-2">
                    {tier.count} <span className="text-xs font-normal text-slate-500">cars</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Value:</span>
                  <span className="font-bold text-emerald-700">
                    ${tier.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2-Column: Body Type & Fuel Type Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Types */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Inventory by Body Type
            </CardTitle>
            <CardDescription>
              Volume and percentage share of vehicle body styles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bodyTypeStats.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 capitalize">{item.type}</span>
                  <span className="text-slate-500 text-xs font-medium">
                    {item.count} units ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fuel Types */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Fuel className="h-5 w-5 text-cyan-600" />
              Powertrain & Fuel Distribution
            </CardTitle>
            <CardDescription>
              Propulsion technologies available in the active showroom.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fuelTypeStats.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 capitalize">{item.type}</span>
                  <span className="text-slate-500 text-xs font-medium">
                    {item.count} units ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-cyan-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Brand & Manufacturer Performance Matrix */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-[#E4141B]" />
                Brand & Manufacturer Performance Matrix
              </CardTitle>
              <CardDescription>
                Detailed inventory capitalization, unit velocity, and pricing breakdown per automaker.
              </CardDescription>
            </div>
            {brandStats.length > 1 && (
              <div className="flex items-center gap-2 print:hidden">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedBrandFilter}
                  onChange={(e) => setSelectedBrandFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="ALL">All Brands ({brandStats.length})</option>
                  {brandStats.map((b) => (
                    <option key={b.make} value={b.make}>
                      {b.make} ({b.totalUnits})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold">Automaker / Brand</th>
                  <th className="py-3 px-4 font-semibold text-center">Total Units</th>
                  <th className="py-3 px-4 font-semibold text-center">Available</th>
                  <th className="py-3 px-4 font-semibold text-center">Sold Units</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBrands.map((brand, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold">
                        {brand.make.charAt(0)}
                      </span>
                      {brand.make}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {brand.totalUnits}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {brand.availableUnits} Available
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {brand.soldUnits > 0 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {brand.soldUnits} Sold
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      ${brand.avgPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ${brand.totalValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

