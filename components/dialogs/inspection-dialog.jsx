"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Award, FileText, Check } from "lucide-react";
import { useState } from "react";

const INSPECTION_CATEGORIES = [
  {
    name: "Powertrain & Mechanical",
    items: [
      "Engine oil level & quality inspected",
      "Transmission fluid condition & shift smoothness",
      "Cooling system & radiator pressure tested",
      "Drive belts & tensioners condition",
      "Exhaust system & catalytic converter emissions check",
      "OBD-II computer diagnostics scanned (Zero fault codes)",
    ],
  },
  {
    name: "Braking & Tires",
    items: [
      "Front brake pads checked (min 6mm thickness)",
      "Rear brake pads/shoes inspected",
      "Brake rotors & calipers free of excessive runout",
      "Tire tread depth inspected (all above 5/32 inch)",
      "Tire pressure & TPMS sensors verified",
      "Emergency parking brake engagement verified",
    ],
  },
  {
    name: "Suspension & Steering",
    items: [
      "Front & rear shock absorbers & struts checked",
      "Ball joints, tie rod ends & sway bar links intact",
      "Power steering rack & fluid pump tested",
      "Four-wheel alignment verification verified",
    ],
  },
  {
    name: "Electrical & Cabin Systems",
    items: [
      "12V starter battery health & cranking amperage tested",
      "Alternator charging voltage output verified",
      "Air conditioning refrigeration & heater performance tested",
      "Touchscreen infotainment, navigation & Bluetooth verified",
      "All exterior headlights, tail lights & turn signals verified",
      "Power windows, mirrors & central door locks tested",
    ],
  },
  {
    name: "Body & Structural Integrity",
    items: [
      "Frame & unibody verified 100% free of structural damage",
      "No evidence of flood, fire, or salvage title history",
      "Exterior paint depth inspected for consistent factory coat",
      "Glass, windshield & mirrors free of structural chips",
    ],
  },
];

export function InspectionReportDialog({ car }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer group flex items-center justify-between p-4 bg-emerald-50/60 hover:bg-emerald-50 rounded-2xl border border-emerald-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-950">
                  150-Point Certified Inspection
                </span>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] px-2 py-0">
                  PASSED
                </Badge>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Every mechanical, electrical & safety system verified.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
            View Report →
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-700">
            <Award className="h-6 w-6" />
            <DialogTitle className="text-xl">
              150-Point Vehicle Inspection Report
            </DialogTitle>
          </div>
          <DialogDescription>
            Official inspection certificate for {car?.year} {car?.make} {car?.model}.
          </DialogDescription>
        </DialogHeader>

        {/* Certificate Banner */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Certification Status
            </span>
            <div className="text-lg font-extrabold text-emerald-800">
              Verified 100% Road Ready
            </div>
            <p className="text-xs text-emerald-700">
              Inspected and signed off by CarsAi Certified Master Technicians.
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            150/150
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-6 pt-2">
          {INSPECTION_CATEGORIES.map((cat) => (
            <div key={cat.name} className="space-y-2.5">
              <h4 className="font-bold text-sm text-slate-900 border-b pb-1">
                {cat.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {cat.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-slate-700"
                  >
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
          <span>Inspection Date: Recent</span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setOpen(false)}
          >
            Close Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

