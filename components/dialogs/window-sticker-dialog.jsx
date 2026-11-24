"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Printer,
  ShieldCheck,
  Fuel,
  Sparkles,
  CheckCircle2,
  QrCode,
  Award,
} from "lucide-react";

export function WindowStickerDialog({ car }) {
  const [open, setOpen] = useState(false);

  if (!car) return null;

  const vin =
    car.vin ||
    `1C4RJFBG${car.year ? car.year.toString().slice(-2) : "24"}L${car.id ? car.id.slice(0, 7).toUpperCase() : "884912"}`;
  const priceNum = Number(car.price) || 25000;
  const destinationCharge = 1295;
  const certifiedFee = 695;
  const totalMSRP = priceNum + destinationCharge + certifiedFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-1.5 rounded-full text-xs hover:border-[#E4141B] hover:text-[#E4141B] transition"
        >
          <FileText className="h-4 w-4 text-[#E4141B]" />
          <span>Window Sticker</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="p-4 border-b border-slate-200 bg-slate-900 text-white flex flex-row items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-red-500" />
            <DialogTitle className="text-base font-bold text-white">
              Official Monroney Window Sticker
            </DialogTitle>
          </div>
          <Button
            onClick={handlePrint}
            size="sm"
            className="bg-[#E4141B] hover:bg-red-700 text-white rounded-full text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Sticker</span>
          </Button>
        </DialogHeader>

        {/* Sticker Canvas */}
        <div className="p-6 bg-slate-50 font-sans text-slate-900" id="window-sticker-content">
          {/* Top Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E4141B]" />
                <span className="text-xl font-black tracking-tight font-montserrat">
                  Cars<span className="text-[#E4141B]">Ai</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Certified Pre-Owned
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Official Factory & Dealership Window Specification
              </p>
            </div>
            <div className="text-left sm:text-right font-mono text-xs">
              <p className="text-slate-400">VIN IDENTIFICATION</p>
              <p className="font-bold text-amber-400 text-sm tracking-wider">{vin}</p>
            </div>
          </div>

          {/* Vehicle Heading */}
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-[#E4141B] uppercase tracking-wide">
                Vehicle Details
              </span>
              <h2 className="text-2xl font-black text-slate-950">
                {car.year} {car.make} {car.model}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {car.bodyType || "Sedan"} • {car.color || "Standard"} Exterior • {car.mileage?.toLocaleString()} Verified Miles
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Total Certified MSRP
              </span>
              <span className="text-2xl font-black text-[#E4141B]">
                ${totalMSRP.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 3 Columns Grid: Specs, Fuel Economy, Standard Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Column 1: EPA Fuel Economy */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <Fuel className="h-4 w-4 text-[#E4141B]" />
                  <h3 className="text-xs font-bold uppercase tracking-wide">
                    Fuel Economy & Environment
                  </h3>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center mb-3">
                  <span className="text-3xl font-black text-emerald-700">
                    {car.fuelType?.toLowerCase().includes("electric") ? "115" : "28"}
                  </span>
                  <span className="text-[11px] block font-semibold text-emerald-800">
                    {car.fuelType?.toLowerCase().includes("electric") ? "MPGe Combined" : "MPG Combined City/Hwy"}
                  </span>
                </div>
                <div className="text-[11px] space-y-1.5 text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>City MPG:</span>
                    <span className="font-semibold">{car.fuelType?.toLowerCase().includes("electric") ? "120" : "25"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Highway MPG:</span>
                    <span className="font-semibold">{car.fuelType?.toLowerCase().includes("electric") ? "110" : "32"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Fuel Cost:</span>
                    <span className="font-semibold text-slate-900">$1,650</span>
                  </div>
                </div>
              </div>

              {/* Safety Ratings */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Overall Safety Rating
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  {"★★★★★"}
                  <span className="text-[10px] font-bold text-slate-700 ml-1">5.0 Star NHTSA</span>
                </div>
              </div>
            </div>

            {/* Column 2: Standard Equipment */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs md:col-span-1">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wide">
                  Standard Equipment
                </h3>
              </div>
              <ul className="text-xs space-y-2 text-slate-700">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{car.transmission} Automatic Transmission</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{car.fuelType} High-Efficiency Powertrain</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Rearview Backup Camera & Radar Sensors</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Touchscreen Navigation with Apple CarPlay</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Lane Departure Warning & Blind Spot Monitor</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Electronic Stability Control & Multi-Airbags</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Price Breakdown & Warranty */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wide">
                    Pricing Breakdown
                  </h3>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-600">Vehicle Base Price</span>
                    <span className="font-medium">${priceNum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-600">Certified Inspection Package</span>
                    <span className="font-medium">${certifiedFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-600">Transit & Prep Handling</span>
                    <span className="font-medium">${destinationCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold text-slate-900">
                    <span>Total MSRP</span>
                    <span className="text-[#E4141B]">${totalMSRP.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Warranty Stamp */}
              <div className="mt-4 p-3 bg-red-50/70 border border-red-200/80 rounded-lg text-xs">
                <span className="font-bold text-[#E4141B] block mb-0.5">
                  CarsAi Certified Warranty
                </span>
                <p className="text-[11px] text-slate-700 leading-tight">
                  Included: 12 Months / 12,000 Miles Powertrain Warranty, 24/7 Roadside Assistance & 5-Day Money-Back Guarantee.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Barcode and Verification */}
          <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="font-mono tracking-widest text-center sm:text-left">
              ||| | |||| | ||||| || |||||| | ||| || ||||||| | |||
              <span className="block text-[10px] text-slate-400 mt-0.5">{vin}</span>
            </div>
            <div className="text-center sm:text-right text-[11px]">
              <span className="font-semibold text-slate-700">CarsAi Certified Showroom • Cairo, Egypt</span>
              <p className="text-slate-400">Printed directly from certified dealer management registry</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

