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
import {
  Users,
  MessageSquare,
  Calendar,
  ArrowRight,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { pct, StatusBar } from "../ui-elements";

export function LeadsTab({ inquiries, testDrives }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Leads",
            value: inquiries.total,
            color: "slate",
            border: "border-slate-200",
          },
          {
            label: "New / Unread",
            value: inquiries.new,
            color: "blue",
            border: "border-blue-200 bg-blue-50/30",
          },
          {
            label: "Being Contacted",
            value: inquiries.contacted,
            color: "amber",
            border: "border-amber-200 bg-amber-50/30",
          },
          {
            label: "Resolved / Closed",
            value: inquiries.resolved,
            color: "emerald",
            border: "border-emerald-200 bg-emerald-50/30",
          },
        ].map(({ label, value, color, border }) => (
          <Card key={label} className={`${border} shadow-sm`}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`text-3xl font-black text-${color}-700`}>
                {value}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                {label}
              </div>
              {inquiries.total > 0 && (
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {pct(value, inquiries.total)}% of total
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Lead Funnel */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Lead Funnel
              </CardTitle>
              <CardDescription>
                Customer inquiry lifecycle stages
              </CardDescription>
            </div>
            <Link href="/admin/inquiries">
              <Button
                size="sm"
                className="rounded-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Open CRM →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBar
              label={`New Inquiries (${inquiries.new})`}
              value={inquiries.new}
              total={inquiries.total}
              colorClass="bg-blue-600"
            />
            <StatusBar
              label={`Being Contacted (${inquiries.contacted})`}
              value={inquiries.contacted}
              total={inquiries.total}
              colorClass="bg-amber-500"
            />
            <StatusBar
              label={`Resolved / Closed (${inquiries.resolved})`}
              value={inquiries.resolved}
              total={inquiries.total}
              colorClass="bg-emerald-500"
            />

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Response Coverage</span>
                <span className="font-bold text-blue-700">
                  {pct(
                    inquiries.contacted + inquiries.resolved,
                    inquiries.total,
                    0,
                  )}
                  %
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {inquiries.contacted + inquiries.resolved} out of{" "}
                {inquiries.total} leads actioned by staff
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CRM Action Center */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-slate-600" />
              CRM Action Center
            </CardTitle>
            <CardDescription>
              Prioritized actions for dealership staff
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inquiries.new > 0 && (
              <Link href="/admin/inquiries">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MessageSquare className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-900">
                      {inquiries.new} unread{" "}
                      {inquiries.new === 1 ? "inquiry" : "inquiries"}
                    </div>
                    <div className="text-xs text-blue-700">
                      Reply promptly to convert customer leads
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </div>
              </Link>
            )}
            {testDrives.pending > 0 && (
              <Link href="/admin/test-drives">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Calendar className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-amber-900">
                      {testDrives.pending} test drives pending
                    </div>
                    <div className="text-xs text-amber-700">
                      Confirm or reschedule booking time slots
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-500" />
                </div>
              </Link>
            )}
            {inquiries.new === 0 && testDrives.pending === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
                <div className="text-sm font-semibold text-slate-900">
                  All caught up!
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  No urgent pending actions required.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

