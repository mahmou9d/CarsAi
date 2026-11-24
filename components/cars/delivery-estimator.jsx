"use client";

import { useState } from "react";
import { Truck, CheckCircle2, ShieldCheck, Clock, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const CITIES = [
  { name: "Cairo", time: "Same Day / 24 hrs", cost: "FREE Delivery" },
  { name: "Giza", time: "Same Day / 24 hrs", cost: "FREE Delivery" },
  { name: "Alexandria", time: "24 - 48 hrs", cost: "500 EGP" },
  { name: "Mansoura (Dakahlia)", time: "24 - 48 hrs", cost: "600 EGP" },
  { name: "Tanta (Gharbia)", time: "24 - 48 hrs", cost: "500 EGP" },
  { name: "Port Said", time: "48 hrs", cost: "700 EGP" },
  { name: "Suez & Ismailia", time: "48 hrs", cost: "600 EGP" },
  { name: "Hurghada (Red Sea)", time: "48 - 72 hrs", cost: "1,200 EGP" },
  { name: "Sharm El-Sheikh", time: "48 - 72 hrs", cost: "1,400 EGP" },
  { name: "Assiut & Upper Egypt", time: "48 - 72 hrs", cost: "1,100 EGP" },
];

export function DeliveryEstimator() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-[#E4141B]" />
          <span className="text-sm font-bold text-slate-900">
            Home Delivery & Handover
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] bg-white border-slate-200 text-slate-700"
        >
          Nationwide
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <Select
          value={selectedCity.name}
          onValueChange={(cityName) => {
            const found = CITIES.find((c) => c.name === cityName);
            if (found) setSelectedCity(found);
          }}
        >
          <SelectTrigger className="h-8 text-xs bg-white rounded-xl border-slate-200">
            <SelectValue placeholder="Select Destination City" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c.name} value={c.name} className="text-xs">
                {c.name} ({c.cost})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transit info */}
      <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="h-3.5 w-3.5 text-[#E4141B]" />
          <span>Transit Time: <strong className="text-slate-800">{selectedCity.time}</strong></span>
        </div>
        <span className="font-bold text-emerald-700">{selectedCity.cost}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
          <span>Enclosed Carrier Transport</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
          <span>7-Day Return Guarantee</span>
        </div>
      </div>
    </div>
  );
}

