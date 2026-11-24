"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Calculator } from "lucide-react";

import { DashboardHeader } from "./dashboard/dashboard-header";
import { OverviewTab } from "./dashboard/tabs/overview-tab";
import { TrendsTab } from "./dashboard/tabs/trends-tab";
import { FinancialsTab } from "./dashboard/tabs/financials-tab";
import { InventoryTab } from "./dashboard/tabs/inventory-tab";
import { TestDrivesTab } from "./dashboard/tabs/test-drives-tab";
import { LeadsTab } from "./dashboard/tabs/leads-tab";
import { ActivityTab } from "./dashboard/tabs/activity-tab";
import { DealCalculatorWidget } from "./dashboard/widgets/deal-calculator";

// Re-export subcomponents for backward compatibility
export * from "./dashboard/ui-elements";
export { DealCalculatorWidget } from "./dashboard/widgets/deal-calculator";
export { MonthlyGrowthChart } from "./dashboard/widgets/growth-chart";
export { TopDemandedInventoryCard } from "./dashboard/widgets/top-demanded-cars";
export { InventoryAgingWidget } from "./dashboard/widgets/inventory-aging";
export { WishlistDemandWidget } from "./dashboard/widgets/wishlist-demand";
export { ShowroomStatusWidget } from "./dashboard/widgets/showroom-status";

export function Dashboard({ initialData }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!initialData || !initialData.success) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {initialData?.error || "Failed to load dashboard data"}
        </AlertDescription>
      </Alert>
    );
  }

  const {
    cars = { total: 0, available: 0, sold: 0, unavailable: 0, featured: 0 },
    testDrives = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      conversionRate: 0,
    },
    financials = { inventoryValuation: 0, totalSalesVolume: 0, avgPrice: 0 },
    makesBreakdown = [],
    bodyTypesBreakdown = [],
    fuelBreakdown = [],
    transmissionBreakdown = [],
    priceTiers = [],
    mileageTiers = [],
    monthlyTrends = [],
    topDemandedCars = [],
    inventoryAging = {},
    wishlistDemand = {},
    availableCarsList = [],
    dealership = null,
    inquiries = { total: 0, new: 0, contacted: 0, resolved: 0 },
    recentActivity = { cars: [], testDrives: [], inquiries: [] },
    tradeIns = { total: 0, pending: 0, inReview: 0, offerMade: 0, accepted: 0, completed: 0 },
    services = { total: 0, pending: 0, confirmed: 0, inProgress: 0, ready: 0, completed: 0 },
  } = initialData.data;

  return (
    <div className="space-y-5">
      {/* ── Top Header & Alert Banner ── */}
      <DashboardHeader
        inquiries={inquiries}
        financials={financials}
        cars={cars}
        inventoryAging={inventoryAging}
        testDrives={testDrives}
        wishlistDemand={wishlistDemand}
        makesBreakdown={makesBreakdown}
        bodyTypesBreakdown={bodyTypesBreakdown}
        fuelBreakdown={fuelBreakdown}
        transmissionBreakdown={transmissionBreakdown}
        tradeIns={tradeIns}
        services={services}
      />

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* ── Navigation Tabs ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <TabsList className="bg-slate-100/80 p-1 rounded-xl flex-wrap h-auto gap-0.5">
            <TabsTrigger
              value="overview"
              className="rounded-lg text-xs sm:text-sm font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="rounded-lg text-xs sm:text-sm font-medium"
            >
              Trends & Growth
            </TabsTrigger>
            <TabsTrigger
              value="calculator"
              className="rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5"
            >
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              Deal Calculator
            </TabsTrigger>
            <TabsTrigger
              value="financials"
              className="rounded-lg text-xs sm:text-sm font-medium"
            >
              Financials
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="rounded-lg text-xs sm:text-sm font-medium"
            >
              Inventory & Aging
            </TabsTrigger>
            <TabsTrigger
              value="test-drives"
              className="rounded-lg text-xs sm:text-sm font-medium"
            >
              Test Drives
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="rounded-lg text-xs sm:text-sm font-medium relative"
            >
              Leads & CRM
              {inquiries.new > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-blue-600 text-white text-[9px] font-bold px-1">
                  {inquiries.new}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="trade-ins"
              className="rounded-lg text-xs sm:text-sm font-medium relative"
            >
              Trade-Ins
              {(tradeIns.pending + tradeIns.inReview) > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-orange-500 text-white text-[9px] font-bold px-1">
                  {tradeIns.pending + tradeIns.inReview}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-lg text-xs sm:text-sm font-medium relative"
            >
              Services
              {(services.pending + services.inProgress + services.ready) > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-teal-600 text-white text-[9px] font-bold px-1">
                  {services.pending + services.inProgress + services.ready}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-lg text-xs sm:text-sm font-medium"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="pt-4">
          <OverviewTab
            cars={cars}
            testDrives={testDrives}
            financials={financials}
            inquiries={inquiries}
            dealership={dealership}
            topDemandedCars={topDemandedCars}
          />
        </TabsContent>

        {/* Tab 2: Trends & Growth */}
        <TabsContent value="trends" className="pt-4">
          <TrendsTab
            monthlyTrends={monthlyTrends}
            topDemandedCars={topDemandedCars}
            wishlistDemand={wishlistDemand}
          />
        </TabsContent>

        {/* Tab 3: Deal Calculator */}
        <TabsContent value="calculator" className="pt-4">
          <DealCalculatorWidget availableCars={availableCarsList} />
        </TabsContent>

        {/* Tab 4: Financials */}
        <TabsContent value="financials" className="pt-4">
          <FinancialsTab
            financials={financials}
            cars={cars}
            priceTiers={priceTiers}
            mileageTiers={mileageTiers}
          />
        </TabsContent>

        {/* Tab 5: Inventory & Aging */}
        <TabsContent value="inventory" className="pt-4">
          <InventoryTab
            cars={cars}
            inventoryAging={inventoryAging}
            bodyTypesBreakdown={bodyTypesBreakdown}
            makesBreakdown={makesBreakdown}
            fuelBreakdown={fuelBreakdown}
            transmissionBreakdown={transmissionBreakdown}
          />
        </TabsContent>

        {/* Tab 6: Test Drives */}
        <TabsContent value="test-drives" className="pt-4">
          <TestDrivesTab testDrives={testDrives} cars={cars} />
        </TabsContent>

        {/* Tab 7: Leads & CRM */}
        <TabsContent value="leads" className="pt-4">
          <LeadsTab inquiries={inquiries} testDrives={testDrives} />
        </TabsContent>

        {/* Tab 8: Recent Activity */}
        <TabsContent value="activity" className="pt-4">
          <ActivityTab recentActivity={recentActivity} />
        </TabsContent>

        {/* Tab 9: Trade-Ins summary */}
        <TabsContent value="trade-ins" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total", value: tradeIns.total, color: "slate" },
              { label: "Pending", value: tradeIns.pending, color: "amber" },
              { label: "In Review", value: tradeIns.inReview, color: "blue" },
              { label: "Offer Made", value: tradeIns.offerMade, color: "purple" },
              { label: "Accepted", value: tradeIns.accepted, color: "emerald" },
              { label: "Completed", value: tradeIns.completed, color: "emerald" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border border-${color}-200 bg-${color}-50/40 p-4 text-center shadow-sm`}>
                <div className={`text-3xl font-black text-${color}-700`}>{value}</div>
                <div className={`text-xs text-${color}-600 mt-1 font-medium uppercase`}>{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <a href="/admin/trade-ins" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline">
              Manage All Trade-In Requests →
            </a>
          </div>
        </TabsContent>

        {/* Tab 10: Services summary */}
        <TabsContent value="services" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total", value: services.total, color: "slate" },
              { label: "Pending", value: services.pending, color: "amber" },
              { label: "Confirmed", value: services.confirmed, color: "blue" },
              { label: "In Progress", value: services.inProgress, color: "purple" },
              { label: "Ready", value: services.ready, color: "teal" },
              { label: "Completed", value: services.completed, color: "emerald" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border border-${color}-200 bg-${color}-50/40 p-4 text-center shadow-sm`}>
                <div className={`text-3xl font-black text-${color}-700`}>{value}</div>
                <div className={`text-xs text-${color}-600 mt-1 font-medium uppercase`}>{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <a href="/admin/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline">
              Manage All Service Bookings →
            </a>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
