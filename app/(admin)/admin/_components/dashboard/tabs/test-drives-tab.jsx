"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { pct, StatusBar, DonutRing } from "../ui-elements";

export function TestDrivesTab({ testDrives, cars }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Total Bookings",
            value: testDrives.total,
            icon: Calendar,
            color: "slate",
          },
          {
            label: "Pending",
            value: testDrives.pending,
            icon: Clock,
            color: "amber",
          },
          {
            label: "Confirmed",
            value: testDrives.confirmed,
            icon: CheckCircle,
            color: "blue",
          },
          {
            label: "Completed",
            value: testDrives.completed,
            icon: CheckCircle,
            color: "emerald",
          },
          {
            label: "Cancelled / No Show",
            value: testDrives.cancelled + testDrives.noShow,
            icon: XCircle,
            color: "red",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs uppercase font-semibold text-slate-500">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 text-${color}-500`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              {testDrives.total > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pct(value, testDrives.total)}%
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Status Breakdown
              </CardTitle>
              <CardDescription>
                Lifecycle of all test drive appointments
              </CardDescription>
            </div>
            <Link href="/admin/test-drives">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                Manage →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBar
              label="Pending confirmation"
              value={testDrives.pending}
              total={testDrives.total}
              colorClass="bg-amber-500"
            />
            <StatusBar
              label="Confirmed & scheduled"
              value={testDrives.confirmed}
              total={testDrives.total}
              colorClass="bg-blue-500"
            />
            <StatusBar
              label="Successfully completed"
              value={testDrives.completed}
              total={testDrives.total}
              colorClass="bg-emerald-500"
            />
            <StatusBar
              label="Cancelled by client/admin"
              value={testDrives.cancelled}
              total={testDrives.total}
              colorClass="bg-red-400"
            />
            <StatusBar
              label="Client no-show"
              value={testDrives.noShow}
              total={testDrives.total}
              colorClass="bg-slate-400"
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Conversion Metrics
            </CardTitle>
            <CardDescription>
              How effectively test drives lead to confirmed sales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-around">
              <div className="relative flex items-center justify-center">
                <DonutRing
                  value={testDrives.conversionRate}
                  total={100}
                  color="#E4141B"
                  size={88}
                  strokeWidth={8}
                />
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-[#E4141B]">
                    {testDrives.conversionRate}%
                  </span>
                </div>
              </div>
              <div className="text-left space-y-1">
                <div className="text-xs text-slate-500 font-medium">
                  Conversion Rate
                </div>
                <div className="text-xs text-slate-700">
                  Test drives → purchases
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <DonutRing
                  value={testDrives.completed}
                  total={testDrives.total}
                  color="#10b981"
                  size={88}
                  strokeWidth={8}
                />
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-emerald-600">
                    {pct(testDrives.completed, testDrives.total, 0)}%
                  </span>
                </div>
              </div>
              <div className="text-left space-y-1">
                <div className="text-xs text-slate-500 font-medium">
                  Completion Rate
                </div>
                <div className="text-xs text-slate-700">Drives completed</div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-3 text-center text-xs">
              <div>
                <div className="font-bold text-slate-900 text-base">
                  {testDrives.pending + testDrives.confirmed}
                </div>
                <div className="text-slate-500">Upcoming appointments</div>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base">
                  {cars.sold}
                </div>
                <div className="text-slate-500">Cars sold total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

