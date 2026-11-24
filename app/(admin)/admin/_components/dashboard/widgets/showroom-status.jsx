"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";

export function ShowroomStatusWidget({ dealership = null }) {
  if (!dealership) return null;

  const daysOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const todayDayName = daysOrder[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const todayHours = (dealership.workingHours || []).find(
    (wh) => wh.dayOfWeek === todayDayName,
  );

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-600" />
            Showroom Operating Status
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 ${
              todayHours?.isOpen
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {todayHours?.isOpen
              ? `Open Today: ${todayHours.openTime} - ${todayHours.closeTime}`
              : "Closed Today"}
          </Badge>
        </div>
        <CardDescription>Dealership facility location and contact info</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Location</span>
            <span className="text-slate-800 font-bold mt-0.5 block truncate">
              {dealership.address || "Main Showroom"}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Contact Phone</span>
            <span className="text-slate-800 font-bold mt-0.5 block truncate">
              {dealership.phone || "01009014597"}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Showroom Email</span>
            <span className="text-slate-800 font-bold mt-0.5 block truncate">
              {dealership.email || "support@carsai.com"}
            </span>
          </div>
        </div>

        {dealership.workingHours && dealership.workingHours.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 text-center">
              {daysOrder.map((day) => {
                const wh = dealership.workingHours.find((h) => h.dayOfWeek === day);
                const isToday = day === todayDayName;
                return (
                  <div
                    key={day}
                    className={`p-1.5 rounded-lg border text-[11px] ${
                      isToday
                        ? "bg-red-50 border-red-200 font-bold text-red-900"
                        : "bg-slate-50/60 border-slate-100 text-slate-600"
                    }`}
                  >
                    <div className="font-semibold capitalize">
                      {day.slice(0, 3)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {wh?.isOpen ? `${wh.openTime}` : "Closed"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

