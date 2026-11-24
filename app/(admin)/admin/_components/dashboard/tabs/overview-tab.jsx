"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Car,
  Calendar,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import { KpiCard, StatusBar, QuickAction, HealthScore } from "../ui-elements";
import { ShowroomStatusWidget } from "../widgets/showroom-status";
import { TopDemandedInventoryCard } from "../widgets/top-demanded-cars";

export function OverviewTab({
  cars,
  testDrives,
  financials,
  inquiries,
  dealership,
  topDemandedCars,
}) {
  return (
    <div className="space-y-5">
      {/* Main KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Inventory"
          value={cars.total}
          sub={`${cars.available} available · ${cars.sold} sold · ${cars.unavailable} unavailable`}
          icon={Car}
          iconBg="bg-red-50"
          iconColor="text-[#E4141B]"
          ring={cars.available}
          ringTotal={cars.total}
          ringColor="#E4141B"
        />
        <KpiCard
          title="Inventory Value"
          value={Math.round(financials.inventoryValuation || 0)}
          sub={`Avg $${Math.round(financials.avgPrice || 0).toLocaleString()} per vehicle`}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          ring={cars.available}
          ringTotal={cars.total}
          ringColor="#10b981"
        />
        <KpiCard
          title="Test Drive Bookings"
          value={testDrives.total}
          sub={`${testDrives.pending} pending · ${testDrives.confirmed} confirmed`}
          icon={Calendar}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          ring={testDrives.completed}
          ringTotal={testDrives.total}
          ringColor="#f59e0b"
        />
        <KpiCard
          title="Customer Inquiries"
          value={inquiries.total}
          sub={`${inquiries.new} new · ${inquiries.contacted} contacted · ${inquiries.resolved} resolved`}
          icon={MessageSquare}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          ring={inquiries.resolved}
          ringTotal={inquiries.total}
          ringColor="#3b82f6"
        />
      </div>

      {/* Dealership Health, Quick Actions & Sales Performance */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Dealership Health */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Dealership Health
            </CardTitle>
            <CardDescription>Composite operational score</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <HealthScore
              cars={cars}
              testDrives={testDrives}
              inquiries={inquiries}
            />
            <div className="mt-2 space-y-2">
              <StatusBar
                label="Inventory Utilization"
                value={cars.available}
                total={cars.total}
                colorClass="bg-[#E4141B]"
              />
              <StatusBar
                label="Test Drive Completion"
                value={testDrives.completed}
                total={testDrives.total}
                colorClass="bg-amber-500"
              />
              <StatusBar
                label="Lead Response Rate"
                value={inquiries.resolved + inquiries.contacted}
                total={inquiries.total}
                colorClass="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Rapid management shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              href="/admin/cars/create"
              icon={Car}
              label="Add New Vehicle"
              desc="List a new car with AI spec extraction"
              color="red"
            />
            <QuickAction
              href="/admin/inquiries"
              icon={MessageSquare}
              label="Customer Leads & CRM"
              desc={`${inquiries.new} unread inquiries waiting`}
              color="blue"
            />
            <QuickAction
              href="/admin/test-drives"
              icon={Calendar}
              label="Test Drive Schedule"
              desc={`${testDrives.pending} pending confirmations`}
              color="amber"
            />
            <QuickAction
              href="/admin/cars"
              icon={Layers}
              label="Manage Inventory"
              desc={`${cars.total} vehicles in database`}
              color="slate"
            />
            <QuickAction
              href="/admin/trade-ins"
              icon={RefreshCw}
              label="Trade-In Requests"
              desc="Review appraisals & make offers"
              color="orange"
            />
            <QuickAction
              href="/admin/services"
              icon={Wrench}
              label="Service Bookings"
              desc="Manage workshop appointments"
              color="teal"
            />
          </CardContent>
        </Card>

        {/* Conversion & Revenue summary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#E4141B]" />
              Sales Performance
            </CardTitle>
            <CardDescription>
              Conversion & revenue indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-emerald-700">
                  {formatCurrency(financials.totalSalesVolume || 0)}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  Realized Sales
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-[#E4141B]">
                  {testDrives.conversionRate}%
                </div>
                <div className="text-[11px] text-red-600 font-medium mt-0.5">
                  Drive Conversion
                </div>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Cars Sold</span>
                <span className="font-semibold text-slate-800">
                  {cars.sold} vehicles
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Featured Listings</span>
                <span className="font-semibold text-amber-700">
                  {cars.featured} cars ⭐
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Average Active Price</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(financials.avgPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Leads Handled</span>
                <span className="font-semibold text-blue-700">
                  {inquiries.resolved + inquiries.contacted} /{" "}
                  {inquiries.total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Showroom Status & Hours */}
      {dealership && <ShowroomStatusWidget dealership={dealership} />}

      {/* Hot In-Demand Inventory on Overview */}
      {topDemandedCars.length > 0 && (
        <TopDemandedInventoryCard cars={topDemandedCars} />
      )}
    </div>
  );
}

