"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function MonthlyGrowthChart({ trends = [] }) {
  const [metric, setMetric] = useState("all"); // 'all' | 'cars' | 'testDrives' | 'inquiries'

  if (!trends || trends.length === 0) return null;

  const maxVal = Math.max(
    ...trends.map((t) =>
      Math.max(t.cars || 0, t.testDrives || 0, t.inquiries || 0),
    ),
    5,
  );

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-2">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#E4141B]" />
            6-Month Dealership Growth Trends
          </CardTitle>
          <CardDescription>
            Monthly volume across inventory, test drives, and customer leads
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setMetric("all")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metric === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMetric("cars")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metric === "cars"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cars
          </button>
          <button
            onClick={() => setMetric("testDrives")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metric === "testDrives"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Test Drives
          </button>
          <button
            onClick={() => setMetric("inquiries")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metric === "inquiries"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Leads
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Visual Bar Columns */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 border-b border-slate-100">
          {trends.map((item, idx) => {
            const hCars = Math.max(
              Math.round(((item.cars || 0) / maxVal) * 120),
              4,
            );
            const hTD = Math.max(
              Math.round(((item.testDrives || 0) / maxVal) * 120),
              4,
            );
            const hInq = Math.max(
              Math.round(((item.inquiries || 0) / maxVal) * 120),
              4,
            );

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-end h-full gap-1 group"
              >
                <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full h-full pb-1">
                  {(metric === "all" || metric === "cars") && (
                    <div
                      title={`${item.month}: ${item.cars} Cars Added`}
                      style={{ height: `${hCars}px` }}
                      className="w-2.5 sm:w-4 bg-[#E4141B] rounded-t-sm hover:brightness-110 transition-all cursor-pointer relative"
                    />
                  )}
                  {(metric === "all" || metric === "testDrives") && (
                    <div
                      title={`${item.month}: ${item.testDrives} Test Drives`}
                      style={{ height: `${hTD}px` }}
                      className="w-2.5 sm:w-4 bg-amber-500 rounded-t-sm hover:brightness-110 transition-all cursor-pointer relative"
                    />
                  )}
                  {(metric === "all" || metric === "inquiries") && (
                    <div
                      title={`${item.month}: ${item.inquiries} Inquiries`}
                      style={{ height: `${hInq}px` }}
                      className="w-2.5 sm:w-4 bg-blue-600 rounded-t-sm hover:brightness-110 transition-all cursor-pointer relative"
                    />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-600 mt-1">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-xs bg-[#E4141B]" />
            <span>Vehicles Added</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-xs bg-amber-500" />
            <span>Test Drives Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-xs bg-blue-600" />
            <span>Customer Inquiries</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

