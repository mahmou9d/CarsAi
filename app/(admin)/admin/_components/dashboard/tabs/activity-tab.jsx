"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Calendar, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

export function ActivityTab({ recentActivity = { cars: [], testDrives: [], inquiries: [] } }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {/* Latest Cars */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Car className="h-4 w-4 text-[#E4141B]" /> Latest Cars Added
            </span>
            <Link
              href="/admin/cars"
              className="text-xs text-[#E4141B] hover:underline font-normal"
            >
              All →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {!recentActivity.cars || recentActivity.cars.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No vehicles added yet
            </p>
          ) : (
            recentActivity.cars.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {c.year} {c.make} {c.model}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {formatCurrency(c.price)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Latest Test Drives */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-600" /> Latest Test
              Drives
            </span>
            <Link
              href="/admin/test-drives"
              className="text-xs text-amber-600 hover:underline font-normal"
            >
              Schedule →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {!recentActivity.testDrives || recentActivity.testDrives.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No bookings yet
            </p>
          ) : (
            recentActivity.testDrives.map((td) => (
              <div
                key={td.id}
                className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {td.customerName}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 shrink-0 ${
                      td.status === "CONFIRMED"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : td.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {td.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {td.car}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(td.bookingDate).toLocaleDateString()} ·{" "}
                  {td.startTime}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Latest Inquiries */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-blue-600" /> Latest
              Inquiries
            </span>
            <Link
              href="/admin/inquiries"
              className="text-xs text-blue-600 hover:underline font-normal"
            >
              View all →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {!recentActivity.inquiries || recentActivity.inquiries.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No inquiries yet
            </p>
          ) : (
            recentActivity.inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {inq.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 shrink-0 ${
                      inq.status === "NEW"
                        ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                        : inq.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {inq.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {inq.car}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

