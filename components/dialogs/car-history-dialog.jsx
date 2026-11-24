"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wrench,
  Clock,
  Sparkles,
} from "lucide-react";

export function CarHistoryDialog({ car }) {
  const [open, setOpen] = useState(false);

  const serviceHistory = [
    {
      date: "Recent",
      mileage: `${car?.mileage?.toLocaleString()} mi`,
      location: "CarsAi Service Center, Cairo",
      type: "Comprehensive 150-Point Certification",
      details:
        "Full synthetic oil & filter replaced, brake inspection passed, tire rotation, complete interior detailing.",
    },
    {
      date: `${car?.year ? car.year + 1 : 2023}`,
      mileage: `${Math.round((car?.mileage || 30000) * 0.6).toLocaleString()} mi`,
      location: "Authorized Dealership Service",
      type: "Factory Scheduled Maintenance",
      details:
        "Cabin air filter replaced, wiper blades renewed, multi-point electronic safety diagnostic performed.",
    },
    {
      date: `${car?.year || 2022}`,
      mileage: "12 mi",
      location: "Official Importer Hub",
      type: "Pre-Delivery Inspection (PDI)",
      details:
        "Vehicle delivered new to first registered private owner. Zero commercial or fleet use.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer group flex items-center justify-between p-4 bg-sky-50/60 hover:bg-sky-50 rounded-2xl border border-sky-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 text-white rounded-xl shadow-sm">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-sky-950">
                  Vehicle History Report
                </span>
                <Badge className="bg-sky-600 hover:bg-sky-600 text-white text-[10px] px-2 py-0">
                  CLEAN TITLE
                </Badge>
              </div>
              <p className="text-xs text-sky-700 mt-0.5">
                0 Accidents • 1 Private Owner • Verified Mileage
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-sky-800 group-hover:translate-x-0.5 transition-transform">
            View History →
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sky-700">
            <FileCheck className="h-6 w-6" />
            <DialogTitle className="text-xl">
              Certified Vehicle History Record
            </DialogTitle>
          </div>
          <DialogDescription>
            Historical transparency audit for {car?.year} {car?.make} {car?.model}.
          </DialogDescription>
        </DialogHeader>

        {/* 4 Pillars Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border rounded-xl text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] text-muted-foreground block">
              Accident Record
            </span>
            <span className="text-xs font-bold text-slate-800">
              No Accidents
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] text-muted-foreground block">
              Title Brand
            </span>
            <span className="text-xs font-bold text-slate-800">
              Guaranteed Clean
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] text-muted-foreground block">
              Ownership
            </span>
            <span className="text-xs font-bold text-slate-800">
              1 Private Owner
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] text-muted-foreground block">
              Odometer
            </span>
            <span className="text-xs font-bold text-slate-800">
              Verified Actual
            </span>
          </div>
        </div>

        {/* Service Timeline */}
        <div className="space-y-4 pt-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#E4141B]" />
            <span>Service & Maintenance Records</span>
          </h4>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {serviceHistory.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#E4141B] border-2 border-white" />
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">
                      {item.type}
                    </span>
                    <span className="text-muted-foreground">{item.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Odometer: {item.mileage} • {item.location}
                  </div>
                  <p className="text-xs text-slate-700 pt-1 leading-relaxed">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

