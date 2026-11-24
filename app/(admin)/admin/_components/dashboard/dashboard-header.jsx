"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Download, AlertCircle, RefreshCw, Wrench } from "lucide-react";
import { pct } from "./ui-elements";

export function DashboardHeader({
  inquiries = { total: 0, new: 0, contacted: 0, resolved: 0 },
  financials = { inventoryValuation: 0, totalSalesVolume: 0, avgPrice: 0 },
  cars = { total: 0, available: 0, sold: 0, unavailable: 0, featured: 0 },
  inventoryAging = {},
  testDrives = { total: 0, pending: 0, confirmed: 0, completed: 0, conversionRate: 0 },
  wishlistDemand = {},
  makesBreakdown = [],
  bodyTypesBreakdown = [],
  fuelBreakdown = [],
  transmissionBreakdown = [],
  tradeIns = { total: 0, pending: 0, inReview: 0, offerMade: 0 },
  services = { total: 0, pending: 0, inProgress: 0, ready: 0 },
}) {
  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Export Executive Summary Report to CSV
  const handleExportExecutiveReport = () => {
    const lines = [
      ["CarsAi Dealership - Executive Dashboard Report"],
      [`Generated At: ${new Date().toLocaleString()}`],
      [""],
      ["=== FINANCIAL METRICS ==="],
      ["Metric", "Value"],
      [
        "Inventory Valuation (Active)",
        `$${Math.round(financials.inventoryValuation || 0)}`,
      ],
      [
        "Realized Sales Volume",
        `$${Math.round(financials.totalSalesVolume || 0)}`,
      ],
      ["Average Vehicle Price", `$${Math.round(financials.avgPrice || 0)}`],
      [""],
      ["=== INVENTORY STATUS & AGING ==="],
      ["Status", "Count", "Percentage"],
      ["Total Vehicles", cars.total, "100%"],
      ["Available", cars.available, `${pct(cars.available, cars.total)}%`],
      ["Sold", cars.sold, `${pct(cars.sold, cars.total)}%`],
      [
        "Unavailable",
        cars.unavailable,
        `${pct(cars.unavailable, cars.total)}%`,
      ],
      ["Featured Listings", cars.featured, `${pct(cars.featured, cars.total)}%`],
      ["Average Days on Lot", `${inventoryAging.avgDaysOnLot || 0} days`, ""],
      ["Fresh Stock (<15d)", inventoryAging.fresh || 0, ""],
      ["Normal Turn (15-45d)", inventoryAging.normal || 0, ""],
      ["Aging/Stale (>45d)", (inventoryAging.aging || 0) + (inventoryAging.stale || 0), ""],
      [""],
      ["=== TEST DRIVES & LEADS ==="],
      ["Category", "Count"],
      ["Total Test Drives", testDrives.total],
      ["Pending Test Drives", testDrives.pending],
      ["Confirmed Test Drives", testDrives.confirmed],
      ["Completed Test Drives", testDrives.completed],
      ["Sales Conversion Rate", `${testDrives.conversionRate}%`],
      ["Total Customer Leads", inquiries.total],
      ["New Unread Inquiries", inquiries.new],
      ["Contacted Inquiries", inquiries.contacted],
      ["Resolved Inquiries", inquiries.resolved],
      ["Total Wishlist Saves", wishlistDemand.totalSaves || 0],
      [""],
      ["=== MAKES BREAKDOWN ==="],
      ["Make", "Vehicles Count"],
      ...makesBreakdown.map((m) => [m.make, m.count]),
      [""],
      ["=== POWERTRAIN & BODY STYLES ==="],
      ["Category", "Name", "Count"],
      ...bodyTypesBreakdown.map((b) => [
        "Body Style",
        b.bodyType || "Other",
        b.count,
      ]),
      ...fuelBreakdown.map((f) => ["Fuel Type", f.fuelType || "Other", f.count]),
      ...transmissionBreakdown.map((t) => [
        "Transmission",
        t.transmission || "Other",
        t.count,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      lines.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `CarsAi_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Executive summary report exported to CSV!");
  };

  return (
    <div className="space-y-4">
      {/* ── Dealership Top Banner ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">
              {getGreeting()}, Administrator
            </h2>
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 border-0 text-[10px] uppercase font-bold tracking-wide">
              Showroom Online
            </Badge>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Overview of dealership revenue, active leads, and inventory
            performance for{" "}
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExecutiveReport}
            className="rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Executive Report
          </Button>
          <Link href="/admin/cars/create">
            <Button
              size="sm"
              className="rounded-full text-xs font-semibold bg-[#E4141B] hover:bg-[#c81219] text-white"
            >
              <Car className="h-3.5 w-3.5 mr-1.5" />
              Add Car
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Urgent Alert Banners ── */}
      {inquiries.new > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-medium">
              You have <strong>{inquiries.new} new</strong> customer{" "}
              {inquiries.new === 1 ? "inquiry" : "inquiries"} waiting for your
              response.
            </span>
          </div>
          <Link href="/admin/inquiries">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full h-7 px-3"
            >
              View CRM
            </Button>
          </Link>
        </div>
      )}
      {(tradeIns.pending + tradeIns.inReview) > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-2 text-orange-800">
            <RefreshCw className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="text-sm font-medium">
              <strong>{tradeIns.pending + tradeIns.inReview}</strong> trade-in{" "}
              {(tradeIns.pending + tradeIns.inReview) === 1 ? "request needs" : "requests need"} appraisal.
            </span>
          </div>
          <Link href="/admin/trade-ins">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-full h-7 px-3">
              Review Trade-Ins
            </Button>
          </Link>
        </div>
      )}
      {(services.pending + services.inProgress + services.ready) > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200">
          <div className="flex items-center gap-2 text-teal-800">
            <Wrench className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="text-sm font-medium">
              <strong>{services.pending + services.inProgress + services.ready}</strong> service{" "}
              {(services.pending + services.inProgress + services.ready) === 1 ? "booking is" : "bookings are"} active in the workshop.
            </span>
          </div>
          <Link href="/admin/services">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-full h-7 px-3">
              View Services
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
